# GitHub Actions Setup Guide

## 🔧 Required Secrets

För att GitHub Actions ska fungera behöver du konfigurera följande secrets:

### 1. Expo Token
```bash
# Logga in på Expo
eas login

# Generera token
eas token:create

# Lägg till i GitHub Secrets som: EXPO_TOKEN
```

### 2. Apple Credentials (iOS)
```bash
# Apple ID
EXPO_APPLE_ID=your@email.com

# App-specific password (generera på appleid.apple.com)
EXPO_APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

### 3. Google Play Credentials (Android)
```bash
# Service Account Key (JSON)
# Skapa på Google Play Console > API Access
EXPO_ANDROID_SERVICE_ACCOUNT_KEY=path/to/key.json
```

## 📋 Setup Checklist

- [ ] Skapa GitHub repo: `Split4Us-Mobile`
- [ ] Pusha kod till GitHub
- [ ] Lägg till Expo token i GitHub Secrets
- [ ] Lägg till Apple credentials (för iOS)
- [ ] Lägg till Google Play credentials (för Android)
- [ ] Aktivera GitHub Actions i repo settings
- [ ] Testa med en PR för att verifiera preview deployment

## 🚀 Workflows

### 1. `build.yml` - Build & Test
**Triggers:**
- Push till `main` eller `develop`
- Pull Requests

**Jobs:**
- ✅ Build iOS (preview/production)
- ✅ Build Android (preview/production)
- ✅ Run tests
- ✅ Lint code
- ✅ Create preview deployment (för PRs)

### 2. `deploy.yml` - Deploy to Stores
**Triggers:**
- GitHub Release published

**Jobs:**
- ✅ Build production iOS
- ✅ Submit to App Store
- ✅ Build production Android
- ✅ Submit to Google Play
- ✅ Create release notes

## 📱 Usage

### Preview Deployment (PR)
1. Skapa Pull Request
2. GitHub Actions bygger automatiskt
3. Preview link kommenteras på PR
4. Testa i Expo Go

### Production Deployment
1. Skapa GitHub Release
2. Välj tag (ex: `v1.0.0`)
3. Skriv release notes
4. Publish release
5. GitHub Actions bygger och deployer automatiskt

## 🔍 Monitoring

### Build Status
Se status på: `https://github.com/ashsolei/Split4Us-Mobile/actions`

### Logs
Klicka på workflow run → Välj job → Se logs

### Notifications
GitHub skickar email vid:
- ✅ Successful builds
- ❌ Failed builds

## 🐛 Troubleshooting

### Build fails: "EXPO_TOKEN not found"
- Lägg till token i GitHub Secrets
- Verifiera att namnet är exakt `EXPO_TOKEN`

### iOS build fails: "Invalid credentials"
- Kontrollera Apple ID
- Regenerera app-specific password
- Verifiera i GitHub Secrets

### Android build fails: "Service account error"
- Kontrollera service account JSON
- Verifiera permissions i Google Play Console

### Preview deployment fails
- Kontrollera Expo username i workflow
- Verifiera att projektet är publicerat på Expo

## 💡 Best Practices

1. **Branch Strategy:**
   - `main` → Production builds
   - `develop` → Preview builds
   - `feature/*` → Feature branches (preview only)

2. **Versioning:**
   - Follow semantic versioning (major.minor.patch)
   - Update `app.json` version before release

3. **Testing:**
   - All tests must pass before merge
   - Preview builds för alla PRs

4. **Release Notes:**
   - Skriv tydliga release notes
   - Inkludera changelog
   - Lista nya features & bugfixes

## 📝 Example Release Notes

```markdown
## 🎉 Version 1.0.0 - Initial Release

### ✨ New Features
- Split4Us expense tracking
- Group management
- AI receipt scanning
- Multi-currency support

### 🐛 Bug Fixes
- Fixed balance calculation
- Improved performance

### 🔧 Improvements
- Better error handling
- Updated UI/UX
```

## 🔗 Links

- [Expo GitHub Actions](https://docs.expo.dev/build/building-on-ci/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
