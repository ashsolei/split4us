/**
 * Create Expense Screen
   formatAmount 
} from '../../lib/split4us/utils';
import { supabase } from '../../lib/supabase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'CreateExpense'>;

export default function CreateExpenseScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const prefilledGroupId = route.params?.groupId;rmulär för att skapa ny utgift med:
 * - Description, amount, category
 * - Date picker
 * - Group & payer selection
 * - Split configuration
 */

import React, { useState, useEffect } from 'react';
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
import type { RootStackParamList } from '../../navigation/types';
import { expensesApi, groupsApi, membersApi, CreateExpenseRequest, GroupMember, Split4UsGroup } from '../../lib/split4us/api';
import { 
  EXPENSE_CATEGORIES, 
  validateAmount, 
  calculateEqualSplit,
  formatAmount 
} from '../../lib/split4us/utils';
import { supabase } from '../../lib/supabase';

export default function CreateExpenseScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { groupId } = (route.params as any) || {};

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGroupId, setSelectedGroupId] = useState(groupId || '');
  const [paidBy, setPaidBy] = useState('');
  const [notes, setNotes] = useState('');
  
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setCurrentUserId(user.id);
      setPaidBy(user.id);

      const groupsResult = await groupsApi.getAll();
      if (groupsResult.data) {
        const active = groupsResult.data.filter(g => !g.is_archived);
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
      }
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  };

  const handleSubmit = async () => {
    // Validation
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

    setLoading(true);

    try {
      // Calculate equal split among all members
      const memberIds = members.map(m => m.user_id);
      const splitResult = calculateEqualSplit(amountValidation.value!, memberIds);

      if (!splitResult.isValid) {
        Alert.alert('Error', splitResult.error || 'Failed to calculate split');
        setLoading(false);
        return;
      }

      const expenseData: CreateExpenseRequest = {
        group_id: selectedGroupId,
        description: description.trim(),
        amount: amountValidation.value!,
        category,
        date,
        paid_by: paidBy,
        notes: notes.trim() || undefined,
        split_type: 'equal',
        splits: splitResult.splits,
      };

      const result = await expensesApi.create(expenseData);

      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        Alert.alert('Success', 'Expense created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err) {
      console.error('Failed to create expense:', err);
      Alert.alert('Error', 'Failed to create expense');
    } finally {
      setLoading(false);
    }
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
          onPress={() => navigation.navigate('CreateGroup' as never)}
        >
          <Text style={styles.createButtonText}>Create Group</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
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

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
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
                <Text style={[
                  styles.categoryName,
                  category === cat.id && styles.categoryNameActive,
                ]}>
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
                <Text style={[
                  styles.pickerText,
                  selectedGroupId === group.id && styles.pickerTextActive,
                ]}>
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
                  <Text style={[
                    styles.pickerText,
                    paidBy === member.user_id && styles.pickerTextActive,
                  ]}>
                    {member.user?.full_name || member.user?.email || 'Unknown'}
                    {member.user_id === currentUserId && ' (You)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
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
