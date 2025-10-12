/**
 * Split4Us Navigation Types
 * 
 * Type definitions för React Navigation
 */

export type RootStackParamList = {
  // Auth Screens
  Login: undefined;
  Register: undefined;
  
  // Main App
  MainTabs: undefined;
  
  // Split4Us Screens (accessed from tabs)
  Split4UsDashboard: undefined;
  Split4UsGroups: undefined;
  Split4UsExpenses: undefined;
  Split4UsSettings: undefined;
  
  // Modal/Detail Screens
  GroupDetail: { groupId: string };
  CreateGroup: undefined;
  CreateExpense: { groupId?: string };
  ExpenseDetail: { expenseId: string };
  BalancesScreen: { groupId: string };
};

export type Split4UsTabParamList = {
  Dashboard: undefined;
  Groups: undefined;
  Expenses: undefined;
  Settings: undefined;
};

// Helper type for navigation prop
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type Split4UsTabNavigationProp = BottomTabNavigationProp<Split4UsTabParamList>;
