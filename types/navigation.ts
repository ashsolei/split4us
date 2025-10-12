import { NavigatorScreenParams } from '@react-navigation/native';

// Split4Us Tab Navigator
export type Split4UsTabParamList = {
  Split4UsDashboard: undefined;
  Split4UsGroups: undefined;
  Split4UsExpenses: undefined;
  Split4UsSettings: undefined;
};

// Root Stack Navigator
export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  ContractDetail: { contractId: string };
  CreateContract: undefined;
  EditContract: { contractId: string };
  NotificationSettings: undefined;
  WebhookSettings: undefined;
  CalendarSync: undefined;
  Profile: undefined;
  // Split4Us Screens
  GroupDetail: { groupId: string };
  CreateGroup: undefined;
  CreateExpense: { groupId?: string };
  ExpenseDetail: { expenseId: string };
  BalancesScreen: { groupId: string };
};

// Main Tab Navigator
export type MainTabParamList = {
  Dashboard: undefined;
  Contracts: undefined;
  Calendar: undefined;
  Split4Us: NavigatorScreenParams<Split4UsTabParamList>;
  More: undefined;
};

// Auth Stack Navigator
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
