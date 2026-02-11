/**
 * Create Expense Screen
 *
 * Formulär för att skapa ny utgift med:
 * - Description, amount, category
 * - Date picker
 * - Group & payer selection
 * - Split configuration (equal, percentage, exact, shares)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../types/navigation';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  expensesApi,
  groupsApi,
  membersApi,
  CreateExpenseRequest,
  GroupMember,
  Split4UsGroup,
  SplitType,
  ExpenseSplit,
} from '../../lib/split4us/api';
import {
  EXPENSE_CATEGORIES,
  validateAmount,
  calculateEqualSplit,
  calculatePercentageSplit,
  validateExactSplits,
  calculateShareSplit,
  formatAmount,
} from '../../lib/split4us/utils';
import { supabase } from '../../lib/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'CreateExpense'>;

export default function CreateExpenseScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const prefilledGroupId = route.params?.groupId;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(prefilledGroupId || '');
  const [paidBy, setPaidBy] = useState('');
  const [notes, setNotes] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('equal');

  // Split config state
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [customPercentages, setCustomPercentages] = useState<Record<string, string>>({});
  const [customShares, setCustomShares] = useState<Record<string, string>>({});

  // Data
  const [groups, setGroups] = useState<Split4UsGroup[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupMembers();
    }
  }, [selectedGroupId]);

  const loadInitialData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUserId(user.id);
      setPaidBy(user.id);

      const groupsResult = await groupsApi.getAll();
      if (groupsResult.data) {
        const active = groupsResult.data.filter((g) => !g.is_archived);
        setGroups(active);

        if (!selectedGroupId && active.length > 0) {
          setSelectedGroupId(active[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const loadGroupMembers = async () => {
    try {
      const result = await membersApi.getAll(selectedGroupId);
      if (result.data) {
        setMembers(result.data);
        const defaults: Record<string, string> = {};
        const pctDefaults: Record<string, string> = {};
        const shareDefaults: Record<string, string> = {};
        result.data.forEach((m) => {
          defaults[m.user_id] = '';
          pctDefaults[m.user_id] = String(Math.round(100 / result.data!.length));
          shareDefaults[m.user_id] = '1';
        });
        setCustomSplits(defaults);
        setCustomPercentages(pctDefaults);
        setCustomShares(shareDefaults);
      }
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  };

  const buildSplits = useCallback((): {
    splits: ExpenseSplit[];
    isValid: boolean;
    error?: string;
  } => {
    const amountVal = validateAmount(amount);
    if (!amountVal.isValid || !amountVal.value) {
      return { splits: [], isValid: false, error: 'Enter a valid amount first' };
    }

    const memberIds = members.map((m) => m.user_id);

    switch (splitType) {
      case 'equal':
        return calculateEqualSplit(amountVal.value, memberIds);
      case 'exact': {
        const exactSplits: ExpenseSplit[] = memberIds.map((uid) => ({
          user_id: uid,
          amount: parseFloat(customSplits[uid] || '0') || 0,
        }));
        return validateExactSplits(amountVal.value, exactSplits);
      }
      case 'percentage': {
        const pcts = memberIds.map((uid) => ({
          user_id: uid,
          percentage: parseFloat(customPercentages[uid] || '0') || 0,
        }));
        return calculatePercentageSplit(amountVal.value, pcts);
      }
      case 'shares': {
        const sh = memberIds.map((uid) => ({
          user_id: uid,
          shares: parseInt(customShares[uid] || '1', 10) || 1,
        }));
        return calculateShareSplit(amountVal.value, sh);
      }
      default:
        return { splits: [], isValid: false, error: 'Invalid split type' };
    }
  }, [amount, splitType, members, customSplits, customPercentages, customShares]);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter a description');
      return;
    }

    const amountValidation = validateAmount(amount);
    if (!amountValidation.isValid) {
      Alert.alert('Error', amountValidation.error || 'Invalid amount');
      return;
    }

    if (!selectedGroupId) {
      Alert.alert('Error', 'Please select a group');
      return;
    }

    if (!paidBy) {
      Alert.alert('Error', 'Please select who paid');
      return;
    }

    const splitResult = buildSplits();
    if (!splitResult.isValid) {
      Alert.alert('Error', splitResult.error || 'Invalid split configuration');
      return;
    }

    setLoading(true);

    try {
      const expenseData: CreateExpenseRequest = {
        group_id: selectedGroupId,
        description: description.trim(),
        amount: amountValidation.value!,
        category,
        date,
        paid_by: paidBy,
        notes: notes.trim() || undefined,
        split_type: splitType,
        splits: splitResult.splits,
      };

      const result = await expensesApi.create(expenseData);

      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert('Success', 'Expense created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      console.error('Failed to create expense:', err);
      Alert.alert('Error', 'Failed to create expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMemberName = (userId: string): string => {
    const member = members.find((m) => m.user_id === userId);
    if (!member) return 'Unknown';
    const name = member.user?.full_name || member.user?.email || 'Unknown';
    return userId === currentUserId ? `${name} (You)` : name;
  };

  if (loadingData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>👥</Text>
        <Text style={styles.emptyText}>No groups available</Text>
        <Text style={styles.emptySubtext}>Create a group first</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateGroup')}
        >
          <Text style={styles.createButtonText}>Create Group</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Dinner at restaurant"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Amount */}
        <View style={styles.field}>
          <Text style={styles.label}>Amount *</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={styles.label}>Date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: '#1a1a1a', fontSize: 16 }}>📅 {date}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={new Date(date)}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setDate(selectedDate.toISOString().split('T')[0]);
                }
              }}
            />
          )}
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryButton,
                  category === cat.id && styles.categoryButtonActive,
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryName,
                    category === cat.id && styles.categoryNameActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Group */}
        <View style={styles.field}>
          <Text style={styles.label}>Group *</Text>
          <View style={styles.picker}>
            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.pickerOption,
                  selectedGroupId === group.id && styles.pickerOptionActive,
                ]}
                onPress={() => setSelectedGroupId(group.id)}
              >
                <Text
                  style={[
                    styles.pickerText,
                    selectedGroupId === group.id && styles.pickerTextActive,
                  ]}
                >
                  {group.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Paid By */}
        {members.length > 0 && (
          <View style={styles.field}>
            <Text style={styles.label}>Paid by *</Text>
            <View style={styles.picker}>
              {members.map((member) => (
                <TouchableOpacity
                  key={member.user_id}
                  style={[
                    styles.pickerOption,
                    paidBy === member.user_id && styles.pickerOptionActive,
                  ]}
                  onPress={() => setPaidBy(member.user_id)}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      paidBy === member.user_id && styles.pickerTextActive,
                    ]}
                  >
                    {getMemberName(member.user_id)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Split Type */}
        {members.length > 0 && (
          <View style={styles.field}>
            <Text style={styles.label}>Split Type</Text>
            <View style={styles.splitTypeRow}>
              {(
                [
                  { key: 'equal', label: '= Equal' },
                  { key: 'percentage', label: '% Percent' },
                  { key: 'exact', label: '# Exact' },
                  { key: 'shares', label: '÷ Shares' },
                ] as const
              ).map((st) => (
                <TouchableOpacity
                  key={st.key}
                  style={[
                    styles.splitTypeButton,
                    splitType === st.key && styles.splitTypeButtonActive,
                  ]}
                  onPress={() => setSplitType(st.key)}
                >
                  <Text
                    style={[
                      styles.splitTypeText,
                      splitType === st.key && styles.splitTypeTextActive,
                    ]}
                  >
                    {st.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Split Details */}
            {splitType === 'equal' && amount && (
              <View style={styles.splitPreview}>
                <Text style={styles.splitPreviewText}>
                  {members.length > 0
                    ? `${formatAmount(
                        (parseFloat(amount) || 0) / members.length
                      )} per person`
                    : 'Add members to split'}
                </Text>
              </View>
            )}

            {splitType === 'exact' &&
              members.map((m) => (
                <View key={m.user_id} style={styles.splitInputRow}>
                  <Text style={styles.splitMemberName} numberOfLines={1}>
                    {getMemberName(m.user_id)}
                  </Text>
                  <TextInput
                    style={styles.splitInput}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    value={customSplits[m.user_id] || ''}
                    onChangeText={(v) =>
                      setCustomSplits((prev) => ({ ...prev, [m.user_id]: v }))
                    }
                  />
                </View>
              ))}

            {splitType === 'percentage' &&
              members.map((m) => (
                <View key={m.user_id} style={styles.splitInputRow}>
                  <Text style={styles.splitMemberName} numberOfLines={1}>
                    {getMemberName(m.user_id)}
                  </Text>
                  <View style={styles.splitInputWrapper}>
                    <TextInput
                      style={styles.splitInput}
                      placeholder="0"
                      keyboardType="number-pad"
                      value={customPercentages[m.user_id] || ''}
                      onChangeText={(v) =>
                        setCustomPercentages((prev) => ({
                          ...prev,
                          [m.user_id]: v,
                        }))
                      }
                    />
                    <Text style={styles.splitUnit}>%</Text>
                  </View>
                </View>
              ))}

            {splitType === 'shares' &&
              members.map((m) => (
                <View key={m.user_id} style={styles.splitInputRow}>
                  <Text style={styles.splitMemberName} numberOfLines={1}>
                    {getMemberName(m.user_id)}
                  </Text>
                  <View style={styles.splitInputWrapper}>
                    <TextInput
                      style={styles.splitInput}
                      placeholder="1"
                      keyboardType="number-pad"
                      value={customShares[m.user_id] || ''}
                      onChangeText={(v) =>
                        setCustomShares((prev) => ({
                          ...prev,
                          [m.user_id]: v,
                        }))
                      }
                    />
                    <Text style={styles.splitUnit}>shares</Text>
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* Notes */}
        <View style={styles.field}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any additional details..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Create Expense</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 32,
  },
  form: {
    padding: 16,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  categoryButtonActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#3B82F6',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    color: '#6B7280',
  },
  categoryNameActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  picker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  pickerOptionActive: {
    backgroundColor: '#DBEAFE',
  },
  pickerText: {
    fontSize: 16,
    color: '#374151',
  },
  pickerTextActive: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  splitTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  splitTypeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  splitTypeButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  splitTypeText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  splitTypeTextActive: {
    color: '#FFFFFF',
  },
  splitPreview: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  splitPreviewText: {
    fontSize: 14,
    color: '#16A34A',
    fontWeight: '500',
    textAlign: 'center',
  },
  splitInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  splitMemberName: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
  },
  splitInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitInput: {
    width: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    textAlign: 'right',
  },
  splitUnit: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
    width: 40,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});