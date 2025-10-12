# Split4Us Integration Guide

## 🎯 Hur man integrerar Split4Us i huvudappen

Det finns två alternativ för att integrera Split4Us mobile app:

---

## Option 1: Lägg till Split4Us som en Tab (Rekommenderat)

Uppdatera `/mobile/navigation/index.tsx` för att lägga till Split4Us som en femte tab:

### Steg 1: Importera Split4Us Navigator

```typescript
// Lägg till efter andra imports
import Split4UsTabNavigator from './Split4UsTabNavigator';
```

### Steg 2: Uppdatera MainTabParamList

```typescript
// I types/navigation.ts
export type MainTabParamList = {
  Dashboard: undefined;
  Contracts: undefined;
  Calendar: undefined;
  Split4Us: undefined;  // ← Lägg till denna
  More: undefined;
};
```

### Steg 3: Lägg till Tab i MainTabNavigator

```typescript
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={...}
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
      
      {/* ← Lägg till Split4Us här */}
      <Tab.Screen
        name="Split4Us"
        component={Split4UsTabNavigator}
        options={{ 
          title: 'Split4Us',
          headerShown: false,  // Split4Us har sin egen header
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
```

### Steg 4: Lägg till Split4Us Screens i Root Stack

```typescript
export default function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            
            {/* Existing contract screens... */}
            <Stack.Screen name="ContractDetail" ... />
            <Stack.Screen name="CreateContract" ... />
            
            {/* ← Lägg till Split4Us screens här */}
            <Stack.Screen
              name="GroupDetail"
              component={GroupDetailScreen}
              options={{ headerShown: true, title: 'Group Details' }}
            />
            <Stack.Screen
              name="CreateGroup"
              component={CreateGroupScreen}
              options={{ 
                headerShown: true, 
                title: 'Create Group',
                presentation: 'modal' 
              }}
            />
            <Stack.Screen
              name="CreateExpense"
              component={CreateExpenseScreen}
              options={{ 
                headerShown: true, 
                title: 'Add Expense',
                presentation: 'modal' 
              }}
            />
            <Stack.Screen
              name="ExpenseDetail"
              component={ExpenseDetailScreen}
              options={{ headerShown: true, title: 'Expense Details' }}
            />
            <Stack.Screen
              name="BalancesScreen"
              component={BalancesScreen}
              options={{ headerShown: true, title: 'Balances' }}
            />
            
            {/* Other settings screens... */}
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Steg 5: Importera Split4Us Screens

Lägg till i toppen av filen:

```typescript
// Split4Us Screens
import Split4UsTabNavigator from './Split4UsTabNavigator';
import GroupDetailScreen from '../screens/split4us/GroupDetailScreen';
import CreateGroupScreen from '../screens/split4us/CreateGroupScreen';
import CreateExpenseScreen from '../screens/split4us/CreateExpenseScreen';
import ExpenseDetailScreen from '../screens/split4us/ExpenseDetailScreen';
import BalancesScreen from '../screens/split4us/BalancesScreen';
```

---

## Option 2: Separat Entry Point (Standalone App)

Om du vill köra Split4Us som en separat app:

### Skapa `mobile/App.Split4Us.tsx`

```typescript
import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './contexts/AuthContext';
import { RootStackNavigator } from './navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <RootStackNavigator />
        </NavigationContainer>
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
```

### Uppdatera `package.json`

```json
{
  "scripts": {
    "start": "expo start",
    "start:split4us": "EXPO_ENTRY=./App.Split4Us.tsx expo start",
    "android": "expo start --android",
    "ios": "expo start --ios"
  }
}
```

### Kör Split4Us standalone

```bash
npm run start:split4us
```

---

## Option 3: Conditional Tab (Feature Flag)

Visa Split4Us tab endast för vissa användare:

```typescript
function MainTabNavigator() {
  const { user } = useAuth();
  const hasSplit4UsAccess = user?.subscription?.includes('split4us');

  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" ... />
      <Tab.Screen name="Contracts" ... />
      <Tab.Screen name="Calendar" ... />
      
      {/* Conditional Split4Us tab */}
      {hasSplit4UsAccess && (
        <Tab.Screen
          name="Split4Us"
          component={Split4UsTabNavigator}
          options={{ title: 'Split4Us' }}
        />
      )}
      
      <Tab.Screen name="More" ... />
    </Tab.Navigator>
  );
}
```

---

## 🔧 TypeScript Type Definitions

### Uppdatera RootStackParamList

I `/mobile/types/navigation.ts`:

```typescript
export type RootStackParamList = {
  // Existing routes
  Main: undefined;
  Auth: undefined;
  ContractDetail: { contractId: string };
  CreateContract: undefined;
  EditContract: { contractId: string };
  NotificationSettings: undefined;
  WebhookSettings: undefined;
  CalendarSync: undefined;
  Profile: undefined;
  
  // Split4Us routes
  GroupDetail: { groupId: string };
  CreateGroup: undefined;
  CreateExpense: { groupId?: string };
  ExpenseDetail: { expenseId: string };
  BalancesScreen: { groupId: string };
};
```

---

## 🎨 Styling Consistency

Split4Us använder samma färgschema som huvudappen:

```typescript
const Colors = {
  primary: '#3B82F6',      // Blue
  success: '#10B981',      // Green
  warning: '#F59E0B',      // Yellow
  danger: '#EF4444',       // Red
  text: '#1F2937',         // Dark Gray
  textLight: '#6B7280',    // Light Gray
  background: '#F3F4F6',   // Light Background
  white: '#FFFFFF',
};
```

---

## 🧪 Testing Integration

### Test Checklist

- [ ] Split4Us tab visas i bottom tabs
- [ ] Navigera till Dashboard screen
- [ ] Navigera till Groups screen
- [ ] Skapa en grupp (CreateGroup modal)
- [ ] Öppna group detail
- [ ] Lägg till expense från group detail
- [ ] Navigera till Expenses tab
- [ ] Öppna expense detail
- [ ] Visa balances från group detail
- [ ] Navigera tillbaka till huvudapp
- [ ] Tab state preserved när man byter tabs

### Test Navigation Flow

```typescript
// Test 1: Complete expense flow
Dashboard Tab → Add Expense → Fill Form → Submit → Back to Dashboard

// Test 2: Group creation flow
Groups Tab → Create Group → Fill Form → Submit → Group Detail → Add Expense

// Test 3: Cross-tab navigation
Expenses Tab → Expense Detail → Edit → Update → Back to Expenses

// Test 4: Balance settlement
Groups Tab → Group → Balances → Mark Paid → Confirm → Back to Group
```

---

## 📝 Migration Checklist

- [ ] Backup current navigation code
- [ ] Update RootStackParamList types
- [ ] Import Split4Us screens
- [ ] Add Split4Us tab to MainTabNavigator
- [ ] Add Split4Us screens to root stack
- [ ] Test all navigation paths
- [ ] Verify no TypeScript errors
- [ ] Test on iOS
- [ ] Test on Android
- [ ] Update app documentation

---

## 🐛 Troubleshooting

### Issue: "Screen not found"
**Solution:** Kontrollera att screen name matchar exakt i:
1. Type definition (`RootStackParamList`)
2. Stack.Screen `name` prop
3. `navigation.navigate()` call

### Issue: Tab bar not showing
**Solution:** Kontrollera att `headerShown: false` är satt på Split4Us tab screen.

### Issue: Back button not working
**Solution:** Se till att alla modal screens har `presentation: 'modal'` i options.

### Issue: Type errors
**Solution:** Kör `npx tsc --noEmit` för att se alla TypeScript errors.

---

## 🚀 Recommended: Option 1

**Vi rekommenderar Option 1** eftersom:
- ✅ Integrerat med huvudappen
- ✅ Enkel att växla mellan features
- ✅ Delar auth state med huvudappen
- ✅ Konsistent UX
- ✅ Enkel maintenance

---

## 📞 Support

Om du stöter på problem:
1. Kolla TypeScript errors: `npx tsc --noEmit`
2. Läs NAVIGATION_GUIDE.md
3. Testa med `npx expo start --clear`

---

**Last Updated:** 11 Oktober 2025  
**Version:** 1.0  
**Status:** Ready for integration
