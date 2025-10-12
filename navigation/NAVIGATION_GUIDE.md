# Split4Us Navigation Setup Guide

## ✅ Navigation Structure Complete!

### 📁 Files Created

```
mobile/navigation/
├── types.ts                    # TypeScript type definitions
├── Split4UsTabNavigator.tsx    # Bottom tab navigator (4 tabs)
├── RootStackNavigator.tsx      # Main stack navigator
└── index.ts                    # Export index
```

## 🏗️ Navigation Architecture

### Structure
```
RootStackNavigator
├── MainTabs (no header)
│   ├── Dashboard Tab
│   ├── Groups Tab
│   ├── Expenses Tab
│   └── Settings Tab
├── GroupDetail (card presentation)
├── CreateGroup (modal presentation)
├── CreateExpense (modal presentation)
├── ExpenseDetail (card presentation)
└── BalancesScreen (card presentation)
```

### Navigation Flow

```
┌─────────────────────────────────┐
│      Bottom Tab Navigator       │
├─────────────────────────────────┤
│  🏠 Dashboard  👥 Groups        │
│  📊 Expenses   ⚙️ Settings      │
└─────────────────────────────────┘
         │
         ├─→ Dashboard Tab
         │   └─→ Can navigate to:
         │       - CreateExpense (modal)
         │       - ExpenseDetail (card)
         │
         ├─→ Groups Tab
         │   ├─→ CreateGroup (modal)
         │   └─→ GroupDetail (card)
         │       ├─→ CreateExpense (modal)
         │       ├─→ ExpenseDetail (card)
         │       └─→ BalancesScreen (card)
         │
         ├─→ Expenses Tab
         │   └─→ ExpenseDetail (card)
         │
         └─→ Settings Tab
             └─→ Profile, Preferences, etc.
```

## 🔧 Integration Steps

### 1. Update App.tsx

Replace navigation setup in `App.tsx`:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackNavigator } from './navigation';

export default function App() {
  return (
    <NavigationContainer>
      <RootStackNavigator />
    </NavigationContainer>
  );
}
```

### 2. Fix Screen Imports (DONE ✅)

Updated screens to use proper navigation types:
- ✅ DashboardScreen
- ✅ GroupsScreen
- 🔄 Other screens (use same pattern)

### 3. Navigation Type Pattern

For any screen that needs navigation:

```typescript
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MyScreen() {
  const navigation = useNavigation<NavigationProp>();
  
  // Navigate with params
  navigation.navigate('GroupDetail', { groupId: '123' });
  
  // Navigate without params
  navigation.navigate('CreateGroup');
  
  // Go back
  navigation.goBack();
}
```

## 📝 Navigation Examples

### From Dashboard

```typescript
// Add expense (modal)
navigation.navigate('CreateExpense', {});

// View expense detail
navigation.navigate('ExpenseDetail', { expenseId: '123' });

// Switch to Groups tab
navigation.navigate('MainTabs', { screen: 'Groups' });
```

### From Groups List

```typescript
// View group detail
navigation.navigate('GroupDetail', { groupId: '123' });

// Create new group (modal)
navigation.navigate('CreateGroup');
```

### From Group Detail

```typescript
// Add expense to this group
navigation.navigate('CreateExpense', { groupId: group.id });

// View balances
navigation.navigate('BalancesScreen', { groupId: group.id });

// View expense
navigation.navigate('ExpenseDetail', { expenseId: expense.id });
```

### From Expenses List

```typescript
// View expense detail
navigation.navigate('ExpenseDetail', { expenseId: expense.id });

// Create new expense
navigation.navigate('CreateExpense', {});
```

## 🎨 Tab Bar Customization

The tab bar is configured with:
- **Active color:** `#3B82F6` (Blue)
- **Inactive color:** `#9CA3AF` (Gray)
- **Icons:** Emoji-based (🏠 👥 📊 ⚙️)
- **Platform-specific heights:**
  - iOS: 85px (includes safe area)
  - Android: 60px

### Changing Icons

Edit `Split4UsTabNavigator.tsx`:

```typescript
<Tab.Screen
  name="Dashboard"
  component={DashboardScreen}
  options={{
    title: 'Dashboard',
    tabBarIcon: ({ color, size }) => (
      <YourCustomIcon color={color} size={size} />
    ),
  }}
/>
```

## 🔄 Screen Transitions

### Modal Presentation
Used for create/add screens:
- `CreateGroup`
- `CreateExpense`

Slides up from bottom on iOS, regular push on Android.

### Card Presentation
Used for detail screens:
- `GroupDetail`
- `ExpenseDetail`
- `BalancesScreen`

Standard push transition.

## 🐛 Common Issues & Fixes

### Issue: Navigation not working

**Solution:** Make sure `NavigationContainer` wraps your app:

```typescript
<NavigationContainer>
  <RootStackNavigator />
</NavigationContainer>
```

### Issue: Type errors on navigation.navigate()

**Solution:** Import and use proper types:

```typescript
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
const navigation = useNavigation<NavigationProp>();
```

### Issue: Screen not found

**Solution:** Check that screen name matches exactly in:
1. `RootStackParamList` type definition
2. `Stack.Screen name` prop
3. `navigation.navigate()` call

## 📊 Navigation State

### Get Current Route

```typescript
import { useRoute } from '@react-navigation/native';

const route = useRoute();
console.log(route.name); // Current screen name
console.log(route.params); // Route parameters
```

### Check if Can Go Back

```typescript
const navigation = useNavigation();

if (navigation.canGoBack()) {
  navigation.goBack();
} else {
  navigation.navigate('Dashboard');
}
```

### Listen to Focus Events

```typescript
import { useFocusEffect } from '@react-navigation/native';

useFocusEffect(
  React.useCallback(() => {
    // Screen focused, reload data
    loadData();
    
    return () => {
      // Screen unfocused, cleanup
    };
  }, [])
);
```

## 🚀 Testing Navigation

### Manual Test Checklist

- [ ] Dashboard → Create Expense (modal)
- [ ] Dashboard → View Expense Detail
- [ ] Groups → Create Group (modal)
- [ ] Groups → Group Detail
- [ ] Group Detail → Add Expense
- [ ] Group Detail → View Balances
- [ ] Group Detail → View Expense
- [ ] Expenses → View Expense Detail
- [ ] All tab switches work
- [ ] Back button works everywhere
- [ ] Deep linking (future)

### Test Each Flow

```typescript
// Example test flow
1. Open app → Dashboard tab ✅
2. Tap Groups tab → Groups list ✅
3. Tap group → Group detail ✅
4. Tap "Add Expense" → Create expense modal ✅
5. Fill form → Submit → Back to group ✅
6. Tap expense → Expense detail ✅
7. Tap back → Back to group ✅
8. Tap "Balances" → Balances screen ✅
```

## 🎯 Next Steps

### Immediate
1. ✅ Navigation structure created
2. ✅ Type definitions added
3. ✅ Tab navigator configured
4. ✅ Stack navigator configured
5. 🔄 Update remaining screens with types
6. 🔄 Test all navigation flows

### Future Enhancements
- [ ] Deep linking support
- [ ] Navigation persistence
- [ ] Custom transitions
- [ ] Tab bar badges (notifications count)
- [ ] Gesture navigation
- [ ] Screen tracking analytics

## 📚 Resources

- [React Navigation Docs](https://reactnavigation.org/docs/getting-started)
- [TypeScript Guide](https://reactnavigation.org/docs/typescript)
- [Tab Navigator](https://reactnavigation.org/docs/bottom-tab-navigator)
- [Stack Navigator](https://reactnavigation.org/docs/native-stack-navigator)

---

**Status:** 85% Complete  
**Last Updated:** 11 Oktober 2025  
**Next:** Test all flows and polish UI
