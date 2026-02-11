/**
 * Split4Us Tab Navigator
 * 
 * Bottom tab navigation för Split4Us feature
 */

import React from 'react';
import { Platform, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { Split4UsTabParamList } from '../types/navigation';
import { useTheme } from '../contexts/ThemeContext';

// Import screens
import DashboardScreen from '../screens/split4us/DashboardScreen';
import GroupsScreen from '../screens/split4us/GroupsScreen';
import ExpensesScreen from '../screens/split4us/ExpensesScreen';
import SettingsScreen from '../screens/split4us/SettingsScreen';

const Tab = createBottomTabNavigator<Split4UsTabParamList>();

export default function Split4UsTabNavigator() {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Split4UsDashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon emoji="🏠" color={color} size={size} focused={focused} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Split4UsGroups"
        component={GroupsScreen}
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon emoji="👥" color={color} size={size} focused={focused} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Split4UsExpenses"
        component={ExpensesScreen}
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon emoji="📊" color={color} size={size} focused={focused} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Split4UsSettings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon emoji="⚙️" color={color} size={size} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Simple emoji icon component
function TabIcon({ emoji, size, focused }: { emoji: string; color: string; size: number; focused?: boolean }) {
  return (
    <Text style={{ fontSize: size, opacity: focused ? 1 : 0.5 }}>
      {emoji}
    </Text>
  );
}
