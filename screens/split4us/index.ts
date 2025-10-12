/**
 * Split4Us Screens Index
 * 
 * Exporterar alla Split4Us screens för enkel import
 */

export { default as DashboardScreen } from './DashboardScreen';
export { default as GroupsScreen } from './GroupsScreen';
export { default as GroupDetailScreen } from './GroupDetailScreen';
export { default as CreateGroupScreen } from './CreateGroupScreen';
export { default as CreateExpenseScreen } from './CreateExpenseScreen';
export { default as ExpensesScreen } from './ExpensesScreen';
export { default as ExpenseDetailScreen } from './ExpenseDetailScreen';
export { default as BalancesScreen } from './BalancesScreen';
export { default as SettingsScreen } from './SettingsScreen';

// Navigation type helpers (to be used with React Navigation)
export type Split4UsScreenParams = {
  Dashboard: undefined;
  Groups: undefined;
  GroupDetail: { groupId: string };
  CreateGroup: undefined;
  CreateExpense: { groupId?: string };
  Expenses: undefined;
  ExpenseDetail: { expenseId: string };
  Balances: { groupId: string };
  Settings: undefined;
};
