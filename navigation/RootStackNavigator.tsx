/**
 * Root Stack Navigator
 * 
 * Main navigation stack för hela appen
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../contexts/ThemeContext';

// Import navigators & screens
import Split4UsTabNavigator from './Split4UsTabNavigator';
import GroupDetailScreen from '../screens/split4us/GroupDetailScreen';
import CreateGroupScreen from '../screens/split4us/CreateGroupScreen';
import CreateExpenseScreen from '../screens/split4us/CreateExpenseScreen';
import ExpenseDetailScreen from '../screens/split4us/ExpenseDetailScreen';
import BalancesScreen from '../screens/split4us/BalancesScreen';
import NotificationsScreen from '../screens/split4us/NotificationsScreen';

// Types
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.headerBg,
        },
        headerTintColor: colors.headerText,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      {/* Main Tabs (no header, tabs have their own) */}
      <Stack.Screen
        name="MainTabs"
        component={Split4UsTabNavigator}
        options={{ headerShown: false }}
      />
      
      {/* Modal Screens */}
      <Stack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        options={({ route }) => ({
          title: 'Group Details',
          presentation: 'card',
        })}
      />
      
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{
          title: 'Create Group',
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen
        name="CreateExpense"
        component={CreateExpenseScreen}
        options={{
          title: 'Add Expense',
          presentation: 'modal',
        }}
      />
      
      <Stack.Screen
        name="ExpenseDetail"
        component={ExpenseDetailScreen}
        options={{
          title: 'Expense Details',
          presentation: 'card',
        }}
      />
      
      <Stack.Screen
        name="BalancesScreen"
        component={BalancesScreen}
        options={{
          title: 'Balances',
          presentation: 'card',
        }}
      />

      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          presentation: 'card',
        }}
      />
    </Stack.Navigator>
  );
}
