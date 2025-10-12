/**
 * Split4Us Tab Navigator
 * 
 * Bottom tab navigation för Split4Us feature
 */

import React from 'react';
import { Platform, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { Split4UsTabParamList } from '../types/navigation';

// Import screens
import DashboardScreen from '../screens/split4us/DashboardScreen';
import GroupsScreen from '../screens/split4us/GroupsScreen';
import ExpensesScreen from '../screens/split4us/ExpensesScreen';
import SettingsScreen from '../screens/split4us/SettingsScreen';

const Tab = createBottomTabNavigator<Split4UsTabParamList>();

export default function Split4UsTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
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
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="🏠" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Split4UsGroups"
        component={GroupsScreen}
        options={{
          title: 'Groups',
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="👥" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Split4UsExpenses"
        component={ExpensesScreen}
        options={{
          title: 'Expenses',
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="📊" color={color} size={size} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Split4UsSettings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <TabIcon emoji="⚙️" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Simple emoji icon component
function TabIcon({ emoji, color, size }: { emoji: string; color: string; size: number }) {
  return (
    <span style={{ fontSize: size, opacity: color === '#3B82F6' ? 1 : 0.6 }}>
      {emoji}
    </span>
  );
}
