import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Expense } from '../types/split4us';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
  showGroup?: boolean;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  onPress,
  showGroup = false,
}) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('sv-SE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.description} numberOfLines={1}>
          {expense.description}
        </Text>
        <Text style={styles.amount}>
          {formatCurrency(expense.amount, expense.currency)}
        </Text>
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Paid by:</Text>
          <Text style={styles.value}>{expense.paid_by_name || 'Unknown'}</Text>
        </View>

        {expense.category && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Category:</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{expense.category}</Text>
            </View>
          </View>
        )}

        {showGroup && expense.group_name && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Group:</Text>
            <Text style={styles.value}>{expense.group_name}</Text>
          </View>
        )}

        <View style={styles.detailRow}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.dateText}>{formatDate(expense.date)}</Text>
        </View>
      </View>

      {expense.split_type && (
        <View style={styles.footer}>
          <Text style={styles.splitType}>
            {expense.split_type === 'equal' ? '⚖️ Equal Split' : '📊 Custom Split'}
          </Text>
          {expense.participants && (
            <Text style={styles.participants}>
              {expense.participants.length} participants
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 12,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  value: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  categoryBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  splitType: {
    fontSize: 13,
    color: '#6b7280',
  },
  participants: {
    fontSize: 13,
    color: '#9ca3af',
  },
});
