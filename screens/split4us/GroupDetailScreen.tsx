/**
 * Group Detail Screen
 * 
 * Visar group detaljer med:
 * - Group info och stats
 * - Members list
 * - Expenses list
 * - Quick actions
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../types/navigation';
import { groupsApi, membersApi, expensesApi, Split4UsGroup, GroupMember, Split4UsExpense } from '../../lib/split4us/api';
import { formatAmount, formatRelativeTime, getCategoryById, getUserDisplayName } from '../../lib/split4us/utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteType = RouteProp<RootStackParamList, 'GroupDetail'>;

export default function GroupDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteType>();
  const { groupId } = route.params;

  const [group, setGroup] = useState<Split4UsGroup | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [expenses, setExpenses] = useState<Split4UsExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (groupId) {
      loadGroupData();
    }
  }, [groupId]);

  const loadGroupData = async () => {
    try {
      setError(null);
      
      const [groupResult, membersResult, expensesResult] = await Promise.all([
        groupsApi.getById(groupId),
        membersApi.getAll(groupId),
        expensesApi.getAll(groupId),
      ]);

      if (groupResult.error) {
        setError(groupResult.error);
      } else if (groupResult.data) {
        setGroup(groupResult.data);
      }

      if (membersResult.data) {
        setMembers(membersResult.data);
      }

      if (expensesResult.data) {
        // Sort by date descending
        const sorted = expensesResult.data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setExpenses(sorted);
      }
    } catch (err) {
      console.error('Failed to load group:', err);
      setError('Failed to load group data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadGroupData();
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete "${group?.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await groupsApi.delete(groupId);
              Alert.alert('Success', 'Group deleted', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (err) {
              Alert.alert('Error', 'Failed to delete group');
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

  if (error || !group) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error || 'Group not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Group Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.groupName}>{group.name}</Text>
          {group.description && (
            <Text style={styles.groupDescription}>{group.description}</Text>
          )}
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatLabel}>Members</Text>
              <Text style={styles.headerStatValue}>{members.length}</Text>
            </View>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatLabel}>Expenses</Text>
              <Text style={styles.headerStatValue}>{expenses.length}</Text>
            </View>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatLabel}>Currency</Text>
              <Text style={styles.headerStatValue}>{group.currency}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
          onPress={() => navigation.navigate('CreateExpense', { groupId })}
        >
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionText}>Add Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#10B981' }]}
          onPress={() => navigation.navigate('BalancesScreen', { groupId })}
        >
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionText}>Balances</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
          onPress={() => {
            Alert.alert('Coming Soon', 'Analytics feature coming soon!');
          }}
        >
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionText}>Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* Members Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Members ({members.length})</Text>
          <TouchableOpacity onPress={() => {
            Alert.alert('Coming Soon', 'Add member feature coming soon!');
          }}>
            <Text style={styles.addButton}>+ Add</Text>
          </TouchableOpacity>
        </View>
        {members.map((member) => (
          <View key={member.user_id} style={styles.memberCard}>
            <View style={styles.memberAvatar}>
              <Text style={styles.memberAvatarText}>
                {getUserDisplayName(member.user).substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>
                {getUserDisplayName(member.user)}
              </Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Expenses Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expenses ({expenses.length})</Text>
        {expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubtext}>Add your first expense to this group</Text>
          </View>
        ) : (
          expenses.map((expense) => {
            const category = getCategoryById(expense.category);
            return (
              <TouchableOpacity
                key={expense.id}
                style={styles.expenseCard}
                onPress={() => navigation.navigate('ExpenseDetail', { expenseId: expense.id })}
              >
                <View style={styles.expenseIcon}>
                  <Text style={styles.categoryEmoji}>{category.icon}</Text>
                </View>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseDescription}>{expense.description}</Text>
                  <Text style={styles.expenseDate}>
                    {formatRelativeTime(expense.date)} · {getUserDisplayName(expense.paid_by_user)}
                  </Text>
                </View>
                <View style={styles.expenseAmount}>
                  <Text style={styles.expenseAmountText}>
                    {formatAmount(expense.amount, expense.currency)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      {/* Danger Zone */}
      <View style={styles.dangerSection}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteGroup}
        >
          <Text style={styles.deleteButtonText}>Delete Group</Text>
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
    backgroundColor: '#3B82F6',
    padding: 20,
    paddingTop: 16,
  },
  headerContent: {
    paddingTop: 8,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 16,
    color: '#DBEAFE',
    marginBottom: 16,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerStat: {
    alignItems: 'center',
  },
  headerStatLabel: {
    fontSize: 12,
    color: '#DBEAFE',
    marginBottom: 4,
  },
  headerStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
    color: '#111827',
    marginBottom: 12,
  },
  addButton: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  memberCard: {
    backgroundColor: '#FFFFFF',
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
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  expenseCard: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F3F4F6',
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
    color: '#111827',
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  expenseAmount: {
    marginLeft: 12,
  },
  expenseAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
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
    color: '#6B7280',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  dangerSection: {
    padding: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    color: '#DC2626',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
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
