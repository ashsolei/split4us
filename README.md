# HomeAuto Mobile App

React Native mobilapp för HomeAuto avtalshanteringssystem. Tillgänglig för både iOS och Android.

## 🚀 Funktioner

### Autentisering
- ✅ E-post/lösenord inloggning
- ✅ Registrering av nya användare
- ✅ Återställning av lösenord
- ✅ Säker tokenhantering med Expo SecureStore

### Avtalhantering
- ✅ Lista alla avtal med sök och filter
- ✅ Detaljerad avtalsvy
- ✅ Skapa nya avtal
- ✅ Redigera befintliga avtal
- ✅ Ta bort avtal
- ✅ Kategorisering och taggning
- ✅ Filuppladdning (kommande)

### Dashboard
- ✅ Översikt av alla avtal
- ✅ Statistik (totalt, aktiva, utgående)
- ✅ Månadskostnadsöversikt
- ✅ Lista på utgående avtal (3 månader)
- ✅ Snabbåtgärder

### Kalender
- ✅ Månadsvy med utgångsdatum
- ✅ Händelsevisning per dag
- ✅ Olika händelsetyper (utgång, förnyelse, påminnelse)
- ✅ Färgkodade statusar

### Inställningar
- ✅ Profilhantering
- ✅ Notifieringsinställningar
  - E-post
  - Push-notifieringar
  - Slack
  - Microsoft Teams
- ✅ Kalendersynkronisering (Google, Outlook)
- ✅ Webhook-konfiguration
- ✅ Lösenordsändring

## 📱 Teknisk Stack

### Ramverk & Bibliotek
- **React Native** (via Expo)
- **TypeScript** - Typsäkerhet
- **Expo Router** - Navigation
- **React Navigation** - Stack & Tab navigation
- **Supabase** - Backend & Autentisering
- **Expo SecureStore** - Säker datalagring
- **Date-fns** - Datumhantering

### UI-komponenter
- React Native Core Components
- Ionicons - Ikoner
- DateTimePicker - Datumväljare
- React Native Gesture Handler

## 🛠 Installation

### Förutsättningar
- Node.js 18+
- npm eller yarn
- Expo CLI
- iOS Simulator (för iOS) eller Android Studio (för Android)

### Steg 1: Installera dependencies
```bash
cd mobile
npm install
```

### Steg 2: Konfigurera Supabase
Supabase-konfigurationen finns redan i `lib/supabase.ts`. Uppdatera vid behov:
```typescript
const supabaseUrl = 'DIN_SUPABASE_URL';
const supabaseAnonKey = 'DIN_SUPABASE_ANON_KEY';
```

### Steg 3: Starta utvecklingsserver
```bash
# Starta Expo
npm start

# För iOS
npm run ios

# För Android
npm run android

# För webläsare
npm run web
```

## 📂 Projektstruktur

```
mobile/
├── app/                    # App-konfiguration
├── assets/                 # Bilder, ikoner, fonts
├── contexts/              # React Contexts
│   └── AuthContext.tsx    # Autentiseringskontext
├── lib/                   # Hjälpfunktioner
│   └── supabase.ts       # Supabase-klient
├── navigation/            # Navigation
│   └── index.tsx         # Root navigator
├── screens/              # App-skärmar
│   ├── auth/            # Autentisering
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   └── ForgotPasswordScreen.tsx
│   ├── main/            # Huvudskärmar
│   │   ├── DashboardScreen.tsx
│   │   ├── ContractsScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   └── MoreScreen.tsx
│   ├── contracts/       # Avtalsdetaljer
│   │   ├── ContractDetailScreen.tsx
│   │   ├── CreateContractScreen.tsx
│   │   └── EditContractScreen.tsx
│   └── settings/        # Inställningar
│       ├── ProfileScreen.tsx
│       ├── NotificationSettingsScreen.tsx
│       ├── CalendarSyncScreen.tsx
│       └── WebhookSettingsScreen.tsx
├── types/                # TypeScript-typer
│   └── navigation.ts     # Navigation-typer
├── App.tsx              # Root-komponent
├── app.json             # Expo-konfiguration
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript-konfiguration
```

## 🎨 Design

Appen använder ett modernt, rent designspråk med:
- **Färgschema**: Blått primärfärg (#3b82f6)
- **Typografi**: System-standard fonts
- **Komponenter**: Native iOS/Android-känsla
- **Ikoner**: Ionicons
- **Spacing**: Konsekvent 4px-grid

### Färgpalett
```
Primary: #3b82f6 (blå)
Success: #10b981 (grön)
Warning: #f59e0b (orange)
Danger: #ef4444 (röd)
Gray scale: #111827 → #f9fafb
```

## 📊 Databasschema

Appen använder följande Supabase-tabeller:

### contracts
- id, title, description
- category, supplier, contract_number
- start_date, end_date
- monthly_cost, yearly_cost
- contact_person, contact_email, contact_phone
- payment_method, auto_renewal, notice_period_days
- file_url, tags
- user_id, created_at, updated_at

### profiles
- id, email, full_name
- company, phone
- created_at, updated_at

### notification_settings
- user_id, notify_expiring_contracts
- notify_before_days
- email_notifications, push_notifications
- slack_notifications, teams_notifications

## 🔒 Säkerhet

- ✅ Supabase Row Level Security (RLS)
- ✅ Säker tokenhantering med Expo SecureStore
- ✅ Automatisk token-refresh
- ✅ HTTPS-kommunikation
- ✅ Input-validering

## 🧪 Testning

```bash
# Kör TypeScript type checking
npx tsc --noEmit

# Kör linter
npm run lint
```

## 📦 Bygg och Deploy

### iOS
```bash
# Installera EAS CLI
npm install -g eas-cli

# Logga in
eas login

# Konfigurera projekt
eas build:configure

# Bygg för iOS
eas build --platform ios
```

### Android
```bash
# Bygg för Android
eas build --platform android

# Bygg för både iOS och Android
eas build --platform all
```

### Publicera till stores
```bash
# Submit till App Store
eas submit --platform ios

# Submit till Play Store
eas submit --platform android
```

## 🐛 Felsökning

### Vanliga problem

**Problem**: "Cannot find module '@expo/vector-icons'"
```bash
npm install @expo/vector-icons
```

**Problem**: "DateTimePicker not working"
```bash
npm install @react-native-community/datetimepicker
```

**Problem**: "Navigation errors"
```bash
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
```

**Problem**: "Supabase connection errors"
- Kontrollera Supabase URL och API key
- Verifiera nätverksanslutning
- Kolla Supabase dashboard för eventuella problem

## 🚧 Kommande funktioner

- [ ] Push-notifieringar (Expo Notifications)
- [ ] Offline-support med AsyncStorage
- [ ] Filuppladdning och kameraintegration
- [ ] Biometrisk autentisering (Face ID/Touch ID)
- [ ] Delning av avtal mellan användare
- [ ] Export av rapporter (PDF)
- [ ] Mörkt tema
- [ ] Flerspråksstöd (i18n)
- [ ] Analytics och tracking

## 📝 Changelog

### Version 1.0.0 (2025-10-08)
- ✅ Initial release
- ✅ Komplett autentiseringssystem
- ✅ Avtalhantering (CRUD)
- ✅ Dashboard med statistik
- ✅ Kalendervy
- ✅ Inställningar och profil
- ✅ Notifieringsinställningar
- ✅ Integration med befintlig webb-backend

## 👥 Support

För support eller frågor:
- 📧 Email: support@homeauto.se
- 🐛 Issues: GitHub Issues
- 📖 Dokumentation: /docs/

## 📄 Licens

© 2025 HomeAuto. Alla rättigheter förbehållna.
