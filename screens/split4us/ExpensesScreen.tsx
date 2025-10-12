/**
 * Expenses List Screen
 * 
 * Visar alla expenses från alla grupper med:
 * - Filter (group, category, date range)
 * - Search
 * - Sorting
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { expensesApi, Split4UsExpense } from '../../lib/split4us/api';
import { formatAmount, formatRelativeTime, getCategoryById, getUserDisplayName } from '../../lib/split4us/utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ExpensesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [expenses, setExpenses] = useState<Split4UsExpense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Split4UsExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    // Filter expenses based on search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const filtered = expenses.filter(expense =>
        expense.description.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query) ||
        expense.notes?.toLowerCase().includes(query)
      );
      setFilteredExpenses(filtered);
    } else {
      setFilteredExpenses(expenses);
    }
  }, [searchQuery, expenses]);

  const loadExpenses = async () => {
    try {
      setError(null);
      const result = await expensesApi.getAll();
      
      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        // Sort by date descending
        const sorted = result.data.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setExpenses(sorted);
        setFilteredExpenses(sorted);
      }
    } catch (err) {
      console.error('Failed to load expenses:', err);
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadExpenses();
  };

  // Group expenses by date
  const groupedExpenses: { [key: string]: Split4UsExpense[] } = {};
  filteredExpenses.forEach(expense => {
    const date = new Date(expense.date).toDateString();
    if (!groupedExpenses[date]) {
      groupedExpenses[date] = [];
    }
    groupedExpenses[date].push(expense);
  });

  const sections = Object.keys(groupedExpenses).map(date => ({
    date,
    data: groupedExpenses[date],
  }));

  const renderExpenseCard = (expense: Split4UsExpense) => {
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
            {getUserDisplayName(expense.paid_by_user)} · {formatRelativeTime(expense.date)}
          </Text>
        </View>
        <View style={styles.expenseAmount}>
          <Text style={styles.expenseAmountText}>
            {formatAmount(expense.amount, expense.currency)}
          </Text>
          <Text style={styles.categoryName}>{category.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search expenses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{filteredExpenses.length}</Text>
          <Text style={styles.statLabel}>Expenses</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {formatAmount(
              filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
            )}
          </Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Expenses List */}
      {error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <TouchableOpacity onPress={loadExpenses} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredExpenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'No expenses found' : 'No expenses yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {searchQuery ? 'Try a different search' : 'Add your first expense to get started'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={item => item.date}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View style={styles.section}>
              <Text style={styles.dateHeader}>{item.date}</Text>
              {item.data.map(renderExpenseCard)}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Floating Action Button */}
      {expenses.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateExpense', {})}
        >
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      )}
    </View>
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  clearIcon: {
    fontSize: 20,
    color: '#9CA3AF',
    paddingHorizontal: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  section: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
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
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  expenseAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  categoryName: {
    fontSize: 11,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
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
