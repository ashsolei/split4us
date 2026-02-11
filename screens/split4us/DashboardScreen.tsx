/**
 * Split4Us Dashboard Screen
 * 
 * Huvudvy som visar:
 * - Quick stats (total balance, pending settlements)
 * - Recent activity
 * - Quick actions
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { balancesApi, expensesApi, groupsApi, Split4UsExpense, Split4UsGroup, UserBalance } from '../../lib/split4us/api';
import { formatAmount, formatRelativeTime, getCategoryById } from '../../lib/split4us/utils';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [recentExpenses, setRecentExpenses] = useState<Split4UsExpense[]>([]);
  const [pendingSettlements, setPendingSettlements] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load recent expenses
      const expensesResult = await expensesApi.getAll();
      if (expensesResult.data) {
        const sorted = expensesResult.data
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        setRecentExpenses(sorted);
      }

      // Calculate real balance across all groups
      const groupsResult = await groupsApi.getAll();
      if (groupsResult.data && groupsResult.data.length > 0) {
        let userBalance = 0;
        let pending = 0;
        for (const group of groupsResult.data) {
          try {
            const balResult = await balancesApi.getAll(group.id);
            if (balResult.data) {
              const myBalance = balResult.data.find(b => b.user_id === user.id);
              if (myBalance) {
                userBalance += myBalance.balance;
                if (myBalance.balance < 0) pending++;
              }
            }
          } catch {
            // Skip failed group balance
          }
        }
        setTotalBalance(userBalance);
        setPendingSettlements(pending);
      }

    } catch {
      // Error handled via state
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>❌ {error}</Text>
        <TouchableOpacity onPress={loadDashboardData} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <View>
          <Text style={[styles.title, { color: colors.headerText }]}>Split4Us</Text>
          <Text style={[styles.subtitle, { color: colors.headerText, opacity: 0.8 }]}>Dela utgifter smart</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Notifications')}
          style={styles.notificationBell}
          accessibilityLabel="Notifications"
        >
          <Text style={{ fontSize: 24 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Your Balance</Text>
          <Text style={[
            styles.statValue,
            { color: totalBalance >= 0 ? colors.success : colors.error }
          ]}>
            {formatAmount(totalBalance)}
          </Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{pendingSettlements}</Text>
          <Text style={[styles.statSubtext, { color: colors.textTertiary }]}>settlements</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('CreateExpense')}
          >
            <Text style={styles.actionIcon}>➕</Text>
            <Text style={styles.actionText}>Add Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => navigation.navigate('CreateGroup')}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>New Group</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
            onPress={() => navigation.navigate('Split4UsGroups')}
          >
            <Text style={styles.actionIcon}>💰</Text>
            <Text style={styles.actionText}>Settle Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.warning }]}
            onPress={() => navigation.navigate('Split4UsExpenses')}
          >
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Expenses</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
        </View>

        {recentExpenses.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No recent expenses</Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>Add your first expense to get started</Text>
          </View>
        ) : (
          recentExpenses.map((expense) => {
            const category = getCategoryById(expense.category);
            return (
              <TouchableOpacity
                key={expense.id}
                style={[styles.expenseCard, { backgroundColor: colors.card }]}
                onPress={() => navigation.navigate('ExpenseDetail', { expenseId: expense.id })}
              >
                <View style={[styles.expenseIcon, { backgroundColor: colors.inputBg }]}>
                  <Text style={styles.categoryEmoji}>{category.icon}</Text>
                </View>
                <View style={styles.expenseInfo}>
                  <Text style={[styles.expenseDescription, { color: colors.text }]}>{expense.description}</Text>
                  <Text style={[styles.expenseDate, { color: colors.textTertiary }]}>{formatRelativeTime(expense.date)}</Text>
                </View>
                <View style={styles.expenseAmount}>
                  <Text style={[styles.expenseAmountText, { color: colors.text }]}>
                    {formatAmount(expense.amount, expense.currency)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  notificationBell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  expenseCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  expenseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 12,
  },
  expenseAmount: {
    marginLeft: 12,
  },
  expenseAmountText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
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
});
