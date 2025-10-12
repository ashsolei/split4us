import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Group } from '../types/split4us';

interface GroupCardProps {
  group: Group;
  onPress?: () => void;
  balance?: number;
  currency?: string;
}

export const GroupCard: React.FC<GroupCardProps> = ({
  group,
  onPress,
  balance,
  currency = 'SEK',
}) => {
  const formatCurrency = (amount: number, curr: string) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: curr,
    }).format(amount);
  };

  const getBalanceColor = (bal: number) => {
    if (bal > 0) return '#10b981'; // Green - You are owed
    if (bal < 0) return '#ef4444'; // Red - You owe
    return '#6b7280'; // Gray - Settled
  };

  const getBalanceText = (bal: number) => {
    if (bal > 0) return 'You are owed';
    if (bal < 0) return 'You owe';
    return 'Settled up';
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>👥</Text>
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.name} numberOfLines={1}>
            {group.name}
          </Text>
          {group.description && (
            <Text style={styles.description} numberOfLines={2}>
              {group.description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Members</Text>
          <Text style={styles.statValue}>{group.member_count || 0}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Expenses</Text>
          <Text style={styles.statValue}>{group.expense_count || 0}</Text>
        </View>
      </View>

      {balance !== undefined && (
        <View style={styles.balanceContainer}>
          <View
            style={[
              styles.balanceBadge,
              { backgroundColor: getBalanceColor(balance) + '20' },
            ]}
          >
            <Text
              style={[
                styles.balanceLabel,
                { color: getBalanceColor(balance) },
              ]}
            >
              {getBalanceText(balance)}
            </Text>
            <Text
              style={[
                styles.balanceAmount,
                { color: getBalanceColor(balance) },
              ]}
            >
              {formatCurrency(Math.abs(balance), currency)}
            </Text>
          </View>
        </View>
      )}

      {group.created_at && (
        <Text style={styles.createdAt}>
          Created {new Date(group.created_at).toLocaleDateString('sv-SE')}
        </Text>
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
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  headerContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  balanceContainer: {
    marginBottom: 8,
  },
  balanceBadge: {
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  createdAt: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
