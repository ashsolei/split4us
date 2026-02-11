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
  TextInput,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../types/navigation';
import { groupsApi, membersApi, expensesApi, Split4UsGroup, GroupMember, Split4UsExpense } from '../../lib/split4us/api';
import { formatAmount, formatRelativeTime, getCategoryById, getUserDisplayName } from '../../lib/split4us/utils';
import { shareExpensesCSV } from '../../lib/split4us/export';
import { useTheme } from '../../contexts/ThemeContext';

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
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const { colors } = useTheme();

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
    } catch {
      // Error handled via state
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

  const handleAddMember = async () => {
    const email = newMemberEmail.trim().toLowerCase();
    if (!email) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setAddingMember(true);
    try {
      const result = await membersApi.add(groupId, email);
      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        setNewMemberEmail('');
        setShowAddMember(false);
        Alert.alert('Success', `Invitation sent to ${email}`);
        await loadGroupData();
      }
    } catch {
      Alert.alert('Error', 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
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
              const result = await groupsApi.delete(groupId);
              if (result.error) {
                Alert.alert('Error', result.error);
                return;
              }
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
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !group) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>❌ {error || 'Group not found'}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Group Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBg }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.groupName, { color: colors.headerText }]}>{group.name}</Text>
          {group.description && (
            <Text style={[styles.groupDescription, { color: colors.headerText, opacity: 0.8 }]}>{group.description}</Text>
          )}
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={[styles.headerStatLabel, { color: colors.headerText, opacity: 0.8 }]}>Members</Text>
              <Text style={[styles.headerStatValue, { color: colors.headerText }]}>{members.length}</Text>
            </View>
            <View style={styles.headerStat}>
              <Text style={[styles.headerStatLabel, { color: colors.headerText, opacity: 0.8 }]}>Expenses</Text>
              <Text style={[styles.headerStatValue, { color: colors.headerText }]}>{expenses.length}</Text>
            </View>
            <View style={styles.headerStat}>
              <Text style={[styles.headerStatLabel, { color: colors.headerText, opacity: 0.8 }]}>Currency</Text>
              <Text style={[styles.headerStatValue, { color: colors.headerText }]}>{group.currency}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('CreateExpense', { groupId })}
        >
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionText}>Add Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.success }]}
          onPress={() => navigation.navigate('BalancesScreen', { groupId })}
        >
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionText}>Balances</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#8B5CF6' }]}
          onPress={() => {
            if (expenses.length === 0) {
              Alert.alert('No Data', 'No expenses to export yet.');
              return;
            }
            shareExpensesCSV(expenses, group.name);
          }}
        >
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Members Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Members ({members.length})</Text>
          <TouchableOpacity onPress={() => setShowAddMember(!showAddMember)}>
            <Text style={[styles.addButton, { color: colors.primary }]}>{showAddMember ? 'Cancel' : '+ Add'}</Text>
          </TouchableOpacity>
        </View>

        {showAddMember && (
          <View style={[styles.addMemberForm, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.addMemberInput, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
              placeholder="Enter email address"
              placeholderTextColor={colors.textTertiary}
              value={newMemberEmail}
              onChangeText={setNewMemberEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            <TouchableOpacity
              style={[styles.addMemberButton, { backgroundColor: colors.primary }]}
              onPress={handleAddMember}
              disabled={addingMember}
            >
              {addingMember ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.addMemberButtonText}>Add Member</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {members.map((member) => (
          <View key={member.user_id} style={[styles.memberCard, { backgroundColor: colors.card }]}>
            <View style={[styles.memberAvatar, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.memberAvatarText, { color: colors.primary }]}>
                {getUserDisplayName(member.user).substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={[styles.memberName, { color: colors.text }]}>
                {getUserDisplayName(member.user)}
              </Text>
              <Text style={[styles.memberRole, { color: colors.textSecondary }]}>{member.role}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Expenses Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Expenses ({expenses.length})</Text>
        {expenses.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No expenses yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>Add your first expense to this group</Text>
          </View>
        ) : (
          expenses.map((expense) => {
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
                  <Text style={[styles.expenseDate, { color: colors.textTertiary }]}>
                    {formatRelativeTime(expense.date)} · {getUserDisplayName(expense.paid_by_user)}
                  </Text>
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

      {/* Danger Zone */}
      <View style={styles.dangerSection}>
        <Text style={[styles.dangerTitle, { color: colors.error }]}>Danger Zone</Text>
        <TouchableOpacity
          style={[styles.deleteButton, { borderColor: colors.error }]}
          onPress={handleDeleteGroup}
        >
          <Text style={[styles.deleteButtonText, { color: colors.error }]}>Delete Group</Text>
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
    padding: 20,
    paddingTop: 16,
  },
  headerContent: {
    paddingTop: 8,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 16,
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
    marginBottom: 4,
  },
  headerStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
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
    marginBottom: 12,
  },
  addButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberCard: {
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
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 12,
    textTransform: 'capitalize',
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
  dangerSection: {
    padding: 16,
    marginTop: 24,
    marginBottom: 32,
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  deleteButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
  addMemberForm: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  addMemberInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  addMemberButton: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  addMemberButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
