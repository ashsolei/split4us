# 📱 Split4Us Mobile - Snabbguide för Expo Deployment

## ✅ Status: REDO FÖR DEPLOYMENT!

Alla tekniska kontroller klara. Inga TypeScript-fel. Alla dependencies installerade.

---

## 🚀 Starta Deployment (10 minuter)

### Steg 1: Installera EAS CLI
```bash
npm install -g eas-cli
```

### Steg 2: Logga in på Expo
```bash
eas login
```
Använd ditt Expo-konto (eller skapa nytt gratis på expo.dev)

### Steg 3: Initiera Expo Project
```bash
cd /home/runner/work/split4us/split4us
eas project:init
```
Detta uppdaterar `app.json` med rätt `projectId` automatiskt.

### Steg 4: Skapa Expo Token
```bash
eas token:create
```
Kopiera token och spara den - den behövs för GitHub Actions.

### Steg 5: Lägg till GitHub Secret
1. Gå till: https://github.com/ashsolei/split4us/settings/secrets/actions
2. Klicka "New repository secret"
3. Name: `EXPO_TOKEN`
4. Value: [token från steg 4]
5. Klicka "Add secret"

### Steg 6: Aktivera GitHub Actions
1. Gå till: https://github.com/ashsolei/split4us/actions
2. Klicka "I understand my workflows, go ahead and enable them"

---

## 🧪 Test Build (Rekommenderat först)

Kör en development build lokalt för att testa:

```bash
# För iOS (kräver Mac)
eas build --profile development --platform ios

# För Android
eas build --profile development --platform android
```

Vänta 10-20 minuter. Du får en länk för att ladda ner builden när den är klar.

---

## 📦 Production Build via GitHub

När test build funkar:

1. **Commit eventuella ändringar**
   ```bash
   git add .
   git commit -m "chore: Prepare for production deployment"
   git push
   ```

2. **Skapa GitHub Release**
   ```bash
   gh release create v1.0.0 \
     --title "v1.0.0 - Initial Release" \
     --notes "First production release of Split4Us Mobile"
   ```

3. **GitHub Actions kör automatiskt:**
   - Bygger iOS production build
   - Bygger Android production build
   - Submitar till App Store Connect
   - Submitar till Google Play Console

---

## 📱 App Store Requirements (iOS)

**Innan submit:**
- [ ] Apple Developer Account ($99/år)
- [ ] App skapad i App Store Connect
- [ ] Bundle ID: `com.split4us.mobile` registrerad
- [ ] App icon (1024x1024)
- [ ] Screenshots (olika skärmstorlekar)
- [ ] Privacy Policy URL
- [ ] App beskrivning

**Lägg till Apple credentials i GitHub Secrets:**
```
EXPO_APPLE_ID=din@email.com
EXPO_APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
```

Skapa App-Specific Password på: https://appleid.apple.com

---

## 🤖 Google Play Requirements (Android)

**Innan submit:**
- [ ] Google Play Developer Account ($25 engångsavgift)
- [ ] App skapad i Play Console
- [ ] Package: `com.split4us.mobile`
- [ ] App icon & feature graphic
- [ ] Screenshots (olika enheter)
- [ ] Privacy Policy URL
- [ ] App beskrivning

**Skapa Service Account:**
1. Google Play Console → API Access
2. Skapa ny service account
3. Ladda ner JSON key
4. Lägg till i GitHub Secrets:
   - Name: `EXPO_ANDROID_SERVICE_ACCOUNT_KEY`
   - Value: [hela innehållet i JSON-filen]

---

## 🔍 Verifierade Fixar

### ✅ Dependencies
- Fixed: `@react-native-community/netinfo@11.4.1` (var 12.0.1)
- Installed: 807 packages
- Vulnerabilities: 0

### ✅ Configuration
- Updated: app.json (HomeAuto → Split4Us)
- Updated: eas.json (Bundle IDs för Split4Us)
- Updated: package.json (name: split4us-mobile)

### ✅ TypeScript
- Fixed: expo-camera v16 API (Camera → CameraView)
- Fixed: Import paths (supabase/client → supabase)
- Added: types/split4us.ts för type exports
- Status: 0 errors ✅

### ✅ Documentation
- Created: .env.example
- Created: EXPO_DEPLOY_VERIFICATION.md (komplett guide)
- Updated: All permissions för receipts (inte contracts)

---

## 📊 Build Profiles

### Development
- Platform: iOS Simulator + Android APK
- Distribution: Internal
- Bundle ID: `com.split4us.mobile.dev`
- Channel: `development`

### Preview
- Platform: iOS + Android APK
- Distribution: Internal testing
- Bundle ID: `com.split4us.mobile`
- Channel: `preview`

### Production
- Platform: iOS (IPA) + Android (AAB)
- Distribution: App Stores
- Bundle ID: `com.split4us.mobile`
- Channel: `production`
- Auto-increment: Enabled

---

## ⚡ Quick Commands

```bash
# Check TypeScript
npx tsc --noEmit

# Start development server
npm start

# Build all platforms (production)
eas build --platform all --profile production

# Build and submit to stores
eas build --platform all --profile production --auto-submit

# Check build status
eas build:list

# View build logs
eas build:view [build-id]
```

---

## 🆘 Troubleshooting

### "Error: No project ID found"
**Lösning:**
```bash
eas project:init
```

### "Error: Invalid Expo token"
**Lösning:**
1. Skapa ny token: `eas token:create`
2. Uppdatera GitHub Secret

### "Build failed: Unable to resolve module"
**Lösning:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### "iOS build failed: No profiles for team"
**Lösning:** 
Lägg till Apple credentials i GitHub Secrets eller kör:
```bash
eas credentials
```

---

## 📚 Länkar

- **Expo Dashboard:** https://expo.dev
- **GitHub Actions:** https://github.com/ashsolei/split4us/actions
- **GitHub Secrets:** https://github.com/ashsolei/split4us/settings/secrets/actions
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Submit to Stores:** https://docs.expo.dev/submit/introduction/

---

## ✨ Vad Händer Efter Deploy?

1. **iOS:** Appen submitas till App Store Connect
   - Review tar 1-3 dagar
   - Du kan följa status i App Store Connect
   - När godkänd: Släpp till App Store

2. **Android:** Appen submitas till Google Play
   - Review tar några timmar till 1 dag
   - Följ status i Play Console
   - När godkänd: Släpp till produktion

3. **Updates:** Nästa gång du vill deploye:
   - Uppdatera version i `app.json`
   - Skapa ny GitHub Release
   - GitHub Actions sköter resten!

---

**Lycka till! 🚀**

Om du stöter på problem, kolla EXPO_DEPLOY_VERIFICATION.md för detaljerad felsökning.
