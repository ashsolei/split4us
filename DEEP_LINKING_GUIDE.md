# Deep Linking Configuration for Split4Us Mobile

## Overview
Deep linking allows users to navigate directly to specific screens in the app from external links (emails, SMS, web).

## URL Scheme Structure
```
split4us://
```

## Supported Deep Links

### Groups
```
split4us://group/:groupId
split4us://group/:groupId/expenses
split4us://group/:groupId/balances
```

### Expenses
```
split4us://expense/:expenseId
split4us://create-expense?groupId=:groupId
```

### Settlements
```
split4us://settle/:groupId
split4us://payment/:settlementId
```

### Notifications
```
split4us://notifications
split4us://notification/:notificationId
```

## Configuration

### 1. app.json
```json
{
  "expo": {
    "scheme": "split4us",
    "web": {
      "bundler": "metro"
    },
    "plugins": [
      [
        "expo-linking",
        {
          "enabled": true
        }
      ]
    ],
    "ios": {
      "associatedDomains": [
        "applinks:split4us.app",
        "applinks:www.split4us.app"
      ]
    },
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "split4us.app"
            },
            {
              "scheme": "https",
              "host": "www.split4us.app"
            }
          ],
          "category": [
            "BROWSABLE",
            "DEFAULT"
          ]
        }
      ]
    }
  }
}
```

### 2. Navigation Configuration (MainNavigation.tsx)
```typescript
import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

const linking = {
  prefixes: [prefix, 'split4us://', 'https://split4us.app'],
  config: {
    screens: {
      Root: {
        screens: {
          Split4UsTabs: {
            screens: {
              Dashboard: 'dashboard',
              Groups: 'groups',
              Expenses: 'expenses',
              Balances: 'balances',
            },
          },
          GroupDetail: 'group/:groupId',
          ExpenseDetail: 'expense/:expenseId',
          CreateExpense: 'create-expense',
          SettleUp: 'settle/:groupId',
        },
      },
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
        },
      },
      NotFound: '*',
    },
  },
};

// In NavigationContainer
<NavigationContainer linking={linking}>
  {/* ... */}
</NavigationContainer>
```

### 3. Handling Deep Links
```typescript
import { useEffect } from 'react';
import * as Linking from 'expo-linking';

function useDeepLinking() {
  useEffect(() => {
    // Handle initial URL (app opened from link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Handle URL when app is running
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);
}

function handleDeepLink(url: string) {
  const { hostname, path, queryParams } = Linking.parse(url);
  
  // Extract parameters and navigate
  // Example: split4us://group/123
  if (hostname === 'group' && path) {
    const groupId = path;
    navigation.navigate('GroupDetail', { groupId });
  }
}
```

## Example Deep Links

### Email Invitation
```html
<a href="split4us://group/abc123">View Group</a>
```

### Settlement Request
```html
<a href="split4us://settle/abc123">Settle Up</a>
```

### Universal Links (Web)
```html
<a href="https://split4us.app/expense/xyz789">View Expense</a>
```

## Testing Deep Links

### iOS Simulator
```bash
xcrun simctl openurl booted "split4us://group/123"
```

### Android Emulator
```bash
adb shell am start -W -a android.intent.action.VIEW -d "split4us://group/123"
```

### Browser Testing
```
https://split4us.app/group/123
```

## Implementation Checklist
- [ ] Configure app.json with URL scheme
- [ ] Add linking configuration to NavigationContainer
- [ ] Implement deep link handler hook
- [ ] Configure iOS Associated Domains
- [ ] Configure Android Intent Filters
- [ ] Test all deep link patterns
- [ ] Update email templates with deep links
- [ ] Add deep links to notifications

## Security Considerations
- Validate all deep link parameters
- Require authentication for protected routes
- Sanitize user input from deep links
- Rate limit deep link handling
- Log deep link usage for analytics

## Future Enhancements
- QR code generation for group invites
- Share sheet integration
- Dynamic deep links for personalization
- Deep link analytics and tracking
