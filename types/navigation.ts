/**
 * Split4Us Navigation Types
 *
 * Single source of truth for all navigation type definitions
 */

// Split4Us Tab Navigator
export type Split4UsTabParamList = {
  Split4UsDashboard: undefined;
  Split4UsGroups: undefined;
  Split4UsExpenses: undefined;
  Split4UsSettings: undefined;
};

// Root Stack Navigator
export type RootStackParamList = {
  // Main tab container
  MainTabs: undefined;
  // Modal / Detail Screens
  GroupDetail: { groupId: string };
  CreateGroup: undefined;
  CreateExpense: { groupId?: string } | undefined;
  ExpenseDetail: { expenseId: string };
  BalancesScreen: { groupId: string };
  Notifications: undefined;
};

// Auth Stack Navigator
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList, Split4UsTabParamList {}
  }
}
