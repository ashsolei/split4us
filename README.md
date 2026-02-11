# Split4Us

React Native mobilapp för delning av utgifter. Byggd med Expo SDK 54, TypeScript och Supabase.

## Funktioner

### Autentisering
- E-post/lösenord inloggning
- Registrering av nya användare
- Återställning av lösenord
- Säker tokenhantering med Expo SecureStore

### Grupper
- Skapa och hantera grupper
- Bjud in medlemmar
- Se grupputgifter och balanser

### Utgifter
- Skapa utgifter med kategori, belopp och beskrivning
- Datumväljare
- Flera split-typer: lika, procent, exakt, andelar
- Exportera utgifter som CSV

### Balanser
- Se vem som är skyldig vem
- Dela balanssammanfattning
- Sortering efter belopp

### Notifikationer
- Nya utgifter, grupper och påminnelser
- Markera som läst
- Realtidsuppdateringar

## Tech Stack

| Teknologi | Version |
|-----------|---------|
| React Native | 0.81.4 |
| Expo SDK | 54 |
| React | 19.1 |
| TypeScript | 5.9.2 |
| Supabase | Auth + DB |
| React Navigation | 7 |

## Kom igång

```bash
npm install --legacy-peer-deps
cp .env.example .env
npx expo start
```

### Miljövariabler

Skapa en `.env`-fil med:

```
EXPO_PUBLIC_SUPABASE_URL=din-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=din-anon-key
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## Testning

```bash
npx jest
npx jest --coverage
```

60 tester i 3 testsviter:
- `utils.test.ts` — Formatering, kategorier, validering
- `api.test.ts` — API-klient med mockad Supabase/fetch
- `export.test.ts` — CSV-export och balanssammanfattning

## Docker

```bash
docker build --target test -t split4us:test .
docker run --rm split4us:test
docker build --target base -t split4us:dev .
```

## Projektstruktur

```
components/          # UI-komponenter
contexts/            # React Context (Auth, Theme)
lib/split4us/        # API-klient, utils, export
navigation/          # React Navigation setup
screens/auth/        # Login, Register, ForgotPassword
screens/split4us/    # Alla appskärmar
types/               # TypeScript-typer
__tests__/           # Jest-tester
```

## Licens

MIT
