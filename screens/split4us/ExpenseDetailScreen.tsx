/**
 * Expense Detail Screen
 * 
 * Visar fullständig expense detalj med:
 * - All info (description, amount, category, date, payer)
 * - Split breakdown (vem betalar vad)
 * - Receipt (om finns)
 * - Edit/Delete actions
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../types/navigation';
import { expensesApi, Split4UsExpense } from '../../lib/split4us/api';
import { formatAmount, formatDate, getCategoryById, getUserDisplayName } from '../../lib/split4us/utils';
import { useTheme } from '../../contexts/ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'ExpenseDetail'>;

export default function ExpenseDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { expenseId } = route.params;

  const [expense, setExpense] = useState<Split4UsExpense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    if (expenseId) {
      loadExpense();
    }
  }, [expenseId]);

  const loadExpense = async () => {
    try {
      setError(null);
      const result = await expensesApi.getById(expenseId);
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setExpense(result.data);
      }
    } catch {
      // Error handled via state
      setError('Failed to load expense');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await expensesApi.delete(expenseId);
              if (result.error) {
                Alert.alert('Error', result.error);
                return;
              }
              Alert.alert('Success', 'Expense deleted', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
        },
      ]
    );
  };

  const startEditing = () => {
    if (!expense) return;
    setEditDescription(expense.description);
    setEditAmount(String(expense.amount));
    setEditNotes(expense.notes || '');
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const handleSaveEdit = async () => {
    if (!editDescription.trim()) {
      Alert.alert('Error', 'Description is required');
      return;
    }
    const parsedAmount = parseFloat(editAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Error', 'Enter a valid amount');
      return;
    }

    setSaving(true);
    try {
      const result = await expensesApi.update(expenseId, {
        description: editDescription.trim(),
        amount: parsedAmount,
        notes: editNotes.trim() || undefined,
      });
      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        setEditing(false);
        await loadExpense();
        Alert.alert('Success', 'Expense updated');
      }
    } catch {
      Alert.alert('Error', 'Failed to update expense');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !expense) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>❌ {error || 'Expense not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const category = getCategoryById(expense.category);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.categoryIcon, { backgroundColor: colors.inputBg }]}>
          <Text style={styles.categoryEmoji}>{category.icon}</Text>
        </View>
        <Text style={[styles.description, { color: colors.text }]}>{expense.description}</Text>
        <Text style={[styles.amount, { color: colors.primary }]}>
          {formatAmount(expense.amount, expense.currency)}
        </Text>
      </View>

      {/* Details */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>
        
        <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Category</Text>
          <View style={styles.detailValue}>
            <Text style={styles.detailEmoji}>{category.icon}</Text>
            <Text style={[styles.detailText, { color: colors.text }]}>{category.name}</Text>
          </View>
        </View>

        <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date</Text>
          <Text style={[styles.detailText, { color: colors.text }]}>{formatDate(expense.date)}</Text>
        </View>

        <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Paid by</Text>
          <Text style={[styles.detailText, { color: colors.text }]}>
            {getUserDisplayName(expense.paid_by_user)}
          </Text>
        </View>

        {expense.notes && (
          <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Notes</Text>
            <Text style={[styles.detailText, { color: colors.text }]}>{expense.notes}</Text>
          </View>
        )}

        <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Created</Text>
          <Text style={[styles.detailText, { color: colors.text }]}>{formatDate(expense.created_at)}</Text>
        </View>
      </View>

      {/* Split Breakdown */}
      {expense.splits && expense.splits.length > 0 && (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Split ({expense.splits.length} people)</Text>
          {expense.splits.map((split, index) => (
            <View key={split.user_id || index} style={[styles.splitRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.splitUser, { color: colors.textSecondary }]}>
                {getUserDisplayName({ email: split.user_id })}
              </Text>
              <Text style={[styles.splitAmount, { color: colors.text }]}>
                {formatAmount(split.amount, expense.currency)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Receipt */}
      {expense.receipt_url && (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Receipt</Text>
          <TouchableOpacity
            style={[styles.receiptButton, { backgroundColor: colors.inputBg }]}
            onPress={() => Linking.openURL(expense.receipt_url!)}
          >
            <Text style={styles.receiptIcon}>📄</Text>
            <Text style={[styles.receiptText, { color: colors.textSecondary }]}>View Receipt</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Form */}
      {editing && (
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Edit Expense</Text>
          <View style={styles.editField}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Description</Text>
            <TextInput
              style={[styles.editInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              value={editDescription}
              onChangeText={setEditDescription}
            />
          </View>
          <View style={styles.editField}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Amount</Text>
            <TextInput
              style={[styles.editInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              value={editAmount}
              onChangeText={setEditAmount}
              keyboardType="decimal-pad"
            />
          </View>
          <View style={styles.editField}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Notes</Text>
            <TextInput
              style={[styles.editInput, styles.editTextArea, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              value={editNotes}
              onChangeText={setEditNotes}
              multiline
              numberOfLines={3}
            />
          </View>
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.editCancelButton, { borderColor: colors.border }]}
              onPress={cancelEditing}
            >
              <Text style={[styles.editCancelText, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.editSaveButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveEdit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.editSaveText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}
          onPress={startEditing}
        >
          <Text style={[styles.editButtonText, { color: colors.primary }]}>✏️ Edit Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton, { borderColor: colors.error }]}
          onPress={handleDelete}
        >
          <Text style={[styles.deleteButtonText, { color: colors.error }]}>🗑️ Delete Expense</Text>
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
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryEmoji: {
    fontSize: 32,
  },
  description: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailEmoji: {
    fontSize: 20,
  },
  detailText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  splitUser: {
    fontSize: 16,
  },
  splitAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  receiptButton: {
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  receiptIcon: {
    fontSize: 24,
  },
  receiptText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionsSection: {
    padding: 16,
    gap: 12,
    marginTop: 12,
    marginBottom: 32,
  },
  actionButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  editButton: {
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  editField: {
    marginBottom: 16,
  },
  editInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginTop: 6,
  },
  editTextArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  editCancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  editCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  editSaveButton: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  editSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
