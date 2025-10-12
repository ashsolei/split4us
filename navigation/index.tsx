import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { RootStackParamList, MainTabParamList, AuthStackParamList, Split4UsTabParamList } from '../types/navigation';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import ContractsScreen from '../screens/main/ContractsScreen';
import CalendarScreen from '../screens/main/CalendarScreen';
import MoreScreen from '../screens/main/MoreScreen';

// Detail Screens
import ContractDetailScreen from '../screens/contracts/ContractDetailScreen';
import CreateContractScreen from '../screens/contracts/CreateContractScreen';
import EditContractScreen from '../screens/contracts/EditContractScreen';

// Settings Screens
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';
import WebhookSettingsScreen from '../screens/settings/WebhookSettingsScreen';
import CalendarSyncScreen from '../screens/settings/CalendarSyncScreen';
import ProfileScreen from '../screens/settings/ProfileScreen';

// Split4Us Screens
import Split4UsDashboardScreen from '../screens/split4us/DashboardScreen';
import Split4UsGroupsScreen from '../screens/split4us/GroupsScreen';
import Split4UsExpensesScreen from '../screens/split4us/ExpensesScreen';
import Split4UsSettingsScreen from '../screens/split4us/SettingsScreen';
import GroupDetailScreen from '../screens/split4us/GroupDetailScreen';
import CreateGroupScreen from '../screens/split4us/CreateGroupScreen';
import CreateExpenseScreen from '../screens/split4us/CreateExpenseScreen';
import ExpenseDetailScreen from '../screens/split4us/ExpenseDetailScreen';
import BalancesScreen from '../screens/split4us/BalancesScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Split4UsTab = createBottomTabNavigator<Split4UsTabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#fff' },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Contracts') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else {
            iconName = focused ? 'menu' : 'menu-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Översikt' }}
      />
      <Tab.Screen
        name="Contracts"
        component={ContractsScreen}
        options={{ title: 'Avtal' }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ title: 'Kalender' }}
      />
      <Tab.Screen
        name="Split4Us"
        component={Split4UsTabNavigator}
        options={{ 
          title: 'Split4Us',
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons 
              name={focused ? 'wallet' : 'wallet-outline'} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ title: 'Mer' }}
      />
    </Tab.Navigator>
  );
}

function Split4UsTabNavigator() {
  return (
    <Split4UsTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#3B82F6',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
        },
        tabBarStyle: {
          height: 85,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Split4UsTab.Screen
        name="Split4UsDashboard"
        component={Split4UsDashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={24} color={color} />
          ),
        }}
      />
      <Split4UsTab.Screen
        name="Split4UsGroups"
        component={Split4UsGroupsScreen}
        options={{
          title: 'Groups',
          tabBarLabel: 'Groups',
          tabBarIcon: ({ color }) => (
            <Ionicons name="people" size={24} color={color} />
          ),
        }}
      />
      <Split4UsTab.Screen
        name="Split4UsExpenses"
        component={Split4UsExpensesScreen}
        options={{
          title: 'Expenses',
          tabBarLabel: 'Expenses',
          tabBarIcon: ({ color }) => (
            <Ionicons name="receipt" size={24} color={color} />
          ),
        }}
      />
      <Split4UsTab.Screen
        name="Split4UsSettings"
        component={Split4UsSettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings" size={24} color={color} />
          ),
        }}
      />
    </Split4UsTab.Navigator>
  );
}

export default function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="ContractDetail"
              component={ContractDetailScreen}
              options={{ headerShown: true, title: 'Avtalsdetaljer' }}
            />
            <Stack.Screen
              name="CreateContract"
              component={CreateContractScreen}
              options={{ headerShown: true, title: 'Skapa avtal' }}
            />
            <Stack.Screen
              name="EditContract"
              component={EditContractScreen}
              options={{ headerShown: true, title: 'Redigera avtal' }}
            />
            <Stack.Screen
              name="NotificationSettings"
              component={NotificationSettingsScreen}
              options={{ headerShown: true, title: 'Notifieringar' }}
            />
            <Stack.Screen
              name="WebhookSettings"
              component={WebhookSettingsScreen}
              options={{ headerShown: true, title: 'Webhooks' }}
            />
            <Stack.Screen
              name="CalendarSync"
              component={CalendarSyncScreen}
              options={{ headerShown: true, title: 'Kalendersynk' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ headerShown: true, title: 'Profil' }}
            />
            
            {/* Split4Us Screens */}
            <Stack.Screen
              name="GroupDetail"
              component={GroupDetailScreen}
              options={{ 
                headerShown: true, 
                title: 'Group Details',
                presentation: 'card',
                headerStyle: { backgroundColor: '#3B82F6' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="CreateGroup"
              component={CreateGroupScreen}
              options={{ 
                headerShown: true, 
                title: 'Create Group',
                presentation: 'modal',
                headerStyle: { backgroundColor: '#3B82F6' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="CreateExpense"
              component={CreateExpenseScreen}
              options={{ 
                headerShown: true, 
                title: 'Add Expense',
                presentation: 'modal',
                headerStyle: { backgroundColor: '#3B82F6' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="ExpenseDetail"
              component={ExpenseDetailScreen}
              options={{ 
                headerShown: true, 
                title: 'Expense Details',
                presentation: 'card',
                headerStyle: { backgroundColor: '#3B82F6' },
                headerTintColor: '#fff',
              }}
            />
            <Stack.Screen
              name="BalancesScreen"
              component={BalancesScreen}
              options={{ 
                headerShown: true, 
                title: 'Balances',
                presentation: 'card',
                headerStyle: { backgroundColor: '#3B82F6' },
                headerTintColor: '#fff',
              }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
