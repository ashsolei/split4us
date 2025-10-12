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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/types';
import { expensesApi, Split4UsExpense } from '../../lib/split4us/api';
import { formatAmount, formatDate, getCategoryById, getUserDisplayName } from '../../lib/split4us/utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'ExpenseDetail'>;

export default function ExpenseDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { expenseId } = route.params;

  const [expense, setExpense] = useState<Split4UsExpense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      console.error('Failed to load expense:', err);
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
              await expensesApi.delete(expenseId);
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (error || !expense) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error || 'Expense not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const category = getCategoryById(expense.category);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.categoryIcon}>
          <Text style={styles.categoryEmoji}>{category.icon}</Text>
        </View>
        <Text style={styles.description}>{expense.description}</Text>
        <Text style={styles.amount}>
          {formatAmount(expense.amount, expense.currency)}
        </Text>
      </View>

      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Category</Text>
          <View style={styles.detailValue}>
            <Text style={styles.detailEmoji}>{category.icon}</Text>
            <Text style={styles.detailText}>{category.name}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailText}>{formatDate(expense.date)}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Paid by</Text>
          <Text style={styles.detailText}>
            {getUserDisplayName(expense.paid_by_user)}
          </Text>
        </View>

        {expense.notes && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Notes</Text>
            <Text style={styles.detailText}>{expense.notes}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Created</Text>
          <Text style={styles.detailText}>{formatDate(expense.created_at)}</Text>
        </View>
      </View>

      {/* Split Breakdown */}
      {expense.splits && expense.splits.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Split ({expense.splits.length} people)</Text>
          {expense.splits.map((split, index) => (
            <View key={index} style={styles.splitRow}>
              <Text style={styles.splitUser}>
                Person {index + 1}
              </Text>
              <Text style={styles.splitAmount}>
                {formatAmount(split.amount, expense.currency)}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Receipt */}
      {expense.receipt_url && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receipt</Text>
          <TouchableOpacity style={styles.receiptButton}>
            <Text style={styles.receiptIcon}>📄</Text>
            <Text style={styles.receiptText}>View Receipt</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsSection}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            Alert.alert('Coming Soon', 'Edit feature coming soon!');
          }}
        >
          <Text style={styles.editButtonText}>✏️ Edit Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>🗑️ Delete Expense</Text>
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
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F3F4F6',
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
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
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
    color: '#111827',
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
    borderBottomColor: '#F3F4F6',
  },
  splitUser: {
    fontSize: 16,
    color: '#374151',
  },
  splitAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  receiptButton: {
    backgroundColor: '#F3F4F6',
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
    color: '#374151',
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
    backgroundColor: '#DBEAFE',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
