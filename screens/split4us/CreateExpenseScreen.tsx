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
import { useTheme } from '../../contexts/ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'CreateExpense'>;

export default function CreateExpenseScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const prefilledGroupId = route.params?.groupId;

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { colors } = useTheme();

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
    } catch {
      // Error handled via state
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
    } catch {
      // Error handled via state
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
    } catch {
      // Error handled via state
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
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (groups.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.emptyIcon}>👥</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No groups available</Text>
        <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>Create a group first</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('CreateGroup')}
        >
          <Text style={styles.createButtonText}>Create Group</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
      <View style={styles.form}>
        {/* Description */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Description *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="e.g., Dinner at restaurant"
            placeholderTextColor={colors.textTertiary}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Amount */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Amount *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="0.00"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Date */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Date</Text>
          <TouchableOpacity
            style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: colors.text, fontSize: 16 }}>📅 {date}</Text>
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
          <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
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
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  category === cat.id && [styles.categoryButtonActive, { backgroundColor: colors.primaryLight, borderColor: colors.primary }],
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    styles.categoryName,
                    { color: colors.textSecondary },
                    category === cat.id && [styles.categoryNameActive, { color: colors.primary }],
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
          <Text style={[styles.label, { color: colors.textSecondary }]}>Group *</Text>
          <View style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {groups.map((group) => (
              <TouchableOpacity
                key={group.id}
                style={[
                  styles.pickerOption,
                  { borderBottomColor: colors.border },
                  selectedGroupId === group.id && [styles.pickerOptionActive, { backgroundColor: colors.primaryLight }],
                ]}
                onPress={() => setSelectedGroupId(group.id)}
              >
                <Text
                  style={[
                    styles.pickerText,
                    { color: colors.textSecondary },
                    selectedGroupId === group.id && [styles.pickerTextActive, { color: colors.primary }],
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
            <Text style={[styles.label, { color: colors.textSecondary }]}>Paid by *</Text>
            <View style={[styles.picker, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {members.map((member) => (
                <TouchableOpacity
                  key={member.user_id}
                  style={[
                    styles.pickerOption,
                    { borderBottomColor: colors.border },
                    paidBy === member.user_id && [styles.pickerOptionActive, { backgroundColor: colors.primaryLight }],
                  ]}
                  onPress={() => setPaidBy(member.user_id)}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      { color: colors.textSecondary },
                      paidBy === member.user_id && [styles.pickerTextActive, { color: colors.primary }],
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
            <Text style={[styles.label, { color: colors.textSecondary }]}>Split Type</Text>
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
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    splitType === st.key && [styles.splitTypeButtonActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
                  ]}
                  onPress={() => setSplitType(st.key)}
                >
                  <Text
                    style={[
                      styles.splitTypeText,
                      { color: colors.textSecondary },
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
<View key={m.user_id} style={[styles.splitInputRow, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.splitMemberName, { color: colors.textSecondary }]} numberOfLines={1}>
                    {getMemberName(m.user_id)}
                  </Text>
                  <TextInput
                    style={[styles.splitInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="0.00"
                    placeholderTextColor={colors.textTertiary}
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
          <Text style={[styles.label, { color: colors.textSecondary }]}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
            placeholder="Add any additional details..."
            placeholderTextColor={colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary }, loading && styles.submitButtonDisabled]}
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
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
    borderWidth: 1,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  categoryButtonActive: {
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
  },
  categoryNameActive: {
    fontWeight: '600',
  },
  picker: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pickerOption: {
    padding: 12,
    borderBottomWidth: 1,
  },
  pickerOptionActive: {
  },
  pickerText: {
    fontSize: 16,
  },
  pickerTextActive: {
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
    borderWidth: 1,
  },
  splitTypeButtonActive: {
  },
  splitTypeText: {
    fontSize: 13,
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
  },
  splitMemberName: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  splitInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  splitInput: {
    width: 80,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    borderWidth: 1,
    textAlign: 'right',
  },
  splitUnit: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
    width: 40,
  },
  submitButton: {
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
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