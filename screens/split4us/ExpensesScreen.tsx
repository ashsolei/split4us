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
import type { RootStackParamList } from '../../types/navigation';
import { expensesApi, Split4UsExpense } from '../../lib/split4us/api';
import { formatAmount, formatRelativeTime, getCategoryById, getUserDisplayName } from '../../lib/split4us/utils';
import { useTheme } from '../../contexts/ThemeContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ExpensesScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [expenses, setExpenses] = useState<Split4UsExpense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Split4UsExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();

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
    } catch {
      // Error handled via state
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
        style={[styles.expenseCard, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('ExpenseDetail', { expenseId: expense.id })}
      >
        <View style={[styles.expenseIcon, { backgroundColor: colors.inputBg }]}>
          <Text style={styles.categoryEmoji}>{category.icon}</Text>
        </View>
        <View style={styles.expenseInfo}>
          <Text style={[styles.expenseDescription, { color: colors.text }]}>{expense.description}</Text>
          <Text style={[styles.expenseDate, { color: colors.textTertiary }]}>
            {getUserDisplayName(expense.paid_by_user)} · {formatRelativeTime(expense.date)}
          </Text>
        </View>
        <View style={styles.expenseAmount}>
          <Text style={[styles.expenseAmountText, { color: colors.text }]}>
            {formatAmount(expense.amount, expense.currency)}
          </Text>
          <Text style={[styles.categoryName, { color: colors.textSecondary }]}>{category.name}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search expenses..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={[styles.clearIcon, { color: colors.textTertiary }]}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{filteredExpenses.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Expenses</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {formatAmount(
              filteredExpenses.reduce((sum, e) => sum + e.amount, 0)
            )}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
        </View>
      </View>

      {/* Expenses List */}
      {error ? (
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>❌ {error}</Text>
          <TouchableOpacity onPress={loadExpenses} style={[styles.retryButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : filteredExpenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {searchQuery ? 'No expenses found' : 'No expenses yet'}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
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
              <Text style={[styles.dateHeader, { color: colors.textSecondary }]}>{item.date}</Text>
              {item.data.map(renderExpenseCard)}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Floating Action Button */}
      {expenses.length > 0 && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
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
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  clearIcon: {
    fontSize: 20,
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
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
    marginBottom: 12,
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
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  expenseAmountText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryName: {
    fontSize: 11,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
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
