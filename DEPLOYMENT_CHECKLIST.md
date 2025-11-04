# ✅ Expo Deployment Checklist - Split4Us Mobile

Använd denna checklista för att säkerställa att deployment går smidigt.

---

## 🔧 Pre-Deployment Setup

### Expo Account
- [ ] Expo-konto skapat på https://expo.dev
- [ ] EAS CLI installerat (`npm install -g eas-cli`)
- [ ] Inloggad på Expo (`eas login`)
- [ ] Project initierat (`eas project:init`)
- [ ] Expo token skapat (`eas token:create`)

### GitHub Setup
- [ ] EXPO_TOKEN tillagd i GitHub Secrets
- [ ] GitHub Actions aktiverade
- [ ] Repository access konfigurerat

---

## 📱 iOS Deployment

### Apple Developer Account
- [ ] Apple Developer Account ($99/år)
- [ ] Betalning genomförd
- [ ] Konto aktivt

### App Store Connect
- [ ] App skapad i App Store Connect
- [ ] Bundle ID registrerat: `com.split4us.mobile`
- [ ] App namn: "Split4Us"
- [ ] Primary language: Swedish
- [ ] Category: Finance eller Productivity

### App Information
- [ ] App icon (1024x1024 PNG, no alpha)
- [ ] Screenshots iPhone (olika storlekar):
  - [ ] 6.7" (iPhone 15 Pro Max)
  - [ ] 6.5" (iPhone 11 Pro Max)
  - [ ] 5.5" (iPhone 8 Plus)
- [ ] Screenshots iPad (valfritt):
  - [ ] 12.9" (iPad Pro)
  - [ ] 11" (iPad Pro)
- [ ] App beskrivning (svensk)
- [ ] Keywords
- [ ] Support URL
- [ ] Marketing URL (valfritt)
- [ ] Privacy Policy URL (**REQUIRED**)

### Apple Credentials (för automatisk submit)
- [ ] App-Specific Password skapat på appleid.apple.com
- [ ] EXPO_APPLE_ID tillagd i GitHub Secrets
- [ ] EXPO_APPLE_APP_SPECIFIC_PASSWORD tillagd i GitHub Secrets
- [ ] Team ID och ASC App ID uppdaterade i eas.json

### Build & Submit
- [ ] Test build genomförd (`eas build --profile preview --platform ios`)
- [ ] Build funkar på testare
- [ ] Production build körd (`eas build --profile production --platform ios`)
- [ ] Submit till App Store (`eas submit --platform ios` eller via GitHub Release)
- [ ] App inskickad för review
- [ ] Review status: Waiting for Review / In Review / Ready for Sale

---

## 🤖 Android Deployment

### Google Play Console
- [ ] Google Play Developer Account ($25 engångsavgift)
- [ ] Betalning genomförd
- [ ] Konto aktivt

### Play Console App
- [ ] App skapad i Play Console
- [ ] Package namn: `com.split4us.mobile`
- [ ] App namn: "Split4Us"
- [ ] Default language: Swedish

### App Information
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots:
  - [ ] Phone (minst 2, rekommenderat 8)
  - [ ] 7-inch tablet (minst 1)
  - [ ] 10-inch tablet (minst 1)
- [ ] Short description (max 80 tecken)
- [ ] Full description (max 4000 tecken)
- [ ] App category: Finance eller Productivity
- [ ] Privacy Policy URL (**REQUIRED**)
- [ ] Contact email

### Service Account (för automatisk submit)
- [ ] Service account skapad i Google Cloud Console
- [ ] Service account tillagd i Play Console API Access
- [ ] JSON key nedladdad
- [ ] EXPO_ANDROID_SERVICE_ACCOUNT_KEY tillagd i GitHub Secrets
- [ ] Service account har rätt permissions (Release Manager)

### Content Rating
- [ ] Content rating questionnaire ifylld
- [ ] Rating certifikat erhållet

### Build & Submit
- [ ] Test build genomförd (`eas build --profile preview --platform android`)
- [ ] APK testad på olika enheter
- [ ] Production build körd (`eas build --profile production --platform android`)
- [ ] AAB submittad till Internal Testing track först
- [ ] Internal testing godkänd
- [ ] Submit till Production track (`eas submit --platform android` eller via GitHub Release)
- [ ] App inskickad för review
- [ ] Review status: Pending / In Review / Published

---

## 📄 Legal & Compliance

### Privacy Policy
- [ ] Privacy policy dokument skapat
- [ ] Inkluderar:
  - [ ] Data collection (email, name, etc.)
  - [ ] How data is used
  - [ ] Data storage and security
  - [ ] Third-party services (Supabase)
  - [ ] User rights (GDPR)
  - [ ] Contact information
- [ ] Published på publik URL
- [ ] URL tillagd i båda app stores

### Terms of Service (valfritt)
- [ ] Terms of Service dokument skapat
- [ ] Published på publik URL
- [ ] Länk i appen

### Data Protection (GDPR)
- [ ] Data processing agreement
- [ ] User consent mechanism
- [ ] Data deletion capability
- [ ] Data export capability

---

## 🧪 Testing

### Manual Testing
- [ ] Test på iOS (iPhone)
- [ ] Test på iOS (iPad)
- [ ] Test på Android (phone)
- [ ] Test på Android (tablet)
- [ ] Test på olika OS-versioner

### Functional Testing
- [ ] Registrering & inloggning
- [ ] Skapa grupp
- [ ] Lägg till medlemmar
- [ ] Skapa expense
- [ ] Scan receipt (kamera)
- [ ] Upload receipt (galleri)
- [ ] Settlements
- [ ] Notifications
- [ ] Offline mode
- [ ] Deep links

### Performance Testing
- [ ] App startar på <3 sekunder
- [ ] Smooth scrolling
- [ ] No crashes under normal usage
- [ ] Memory usage OK
- [ ] Battery usage OK

### Beta Testing
- [ ] Internal testing (team)
- [ ] Closed beta (invited users)
- [ ] Feedback collected
- [ ] Critical bugs fixed

---

## 🚀 Production Deployment

### Pre-Launch
- [ ] All checklists ovan klara
- [ ] Version number uppdaterad i app.json
- [ ] Changelog dokumenterat
- [ ] Release notes skrivna
- [ ] Support email satt upp
- [ ] Crash reporting konfigurerat (Sentry, etc.)
- [ ] Analytics konfigurerat (valfritt)

### Launch
- [ ] GitHub Release skapad
- [ ] GitHub Actions körde utan fel
- [ ] iOS build submittad
- [ ] Android build submittad
- [ ] App Store review inskickad
- [ ] Google Play review inskickad

### Post-Launch
- [ ] Monitor för crashes
- [ ] Monitor för reviews
- [ ] Respond to reviews
- [ ] Support requests svarade på
- [ ] Analytics granskad
- [ ] Performance metrics granskad

---

## 🔄 Update Deployment

För framtida updates:

### Preparation
- [ ] Changelog dokumenterat
- [ ] Version bumped i app.json
- [ ] All testing genomfört
- [ ] Release notes skrivna

### Deploy
- [ ] Skapa GitHub Release med ny version
- [ ] GitHub Actions bygger & submitar automatiskt
- [ ] iOS: Phased release eller full release?
- [ ] Android: Staged rollout (10% → 50% → 100%)

### Monitor
- [ ] Crash rate efter update
- [ ] User reviews efter update
- [ ] Support tickets relaterade till update

---

## 📊 Success Metrics

### Launch Targets
- [ ] 0 crashes dag 1
- [ ] <1% crash rate vecka 1
- [ ] 4+ star rating
- [ ] 100 downloads vecka 1 (justeras efter målgrupp)

### Ongoing Metrics
- [ ] Daily Active Users (DAU)
- [ ] Monthly Active Users (MAU)
- [ ] Retention rate (D1, D7, D30)
- [ ] Session length
- [ ] Feature adoption

---

## 🆘 Emergency Contacts

### Support
- Support email: _____________
- Support phone: _____________

### Technical
- Developer: _____________
- DevOps: _____________

### Business
- Product Owner: _____________
- Marketing: _____________

---

## 📚 Resources

### Documentation
- [ ] User guide tillgänglig
- [ ] FAQ skapad
- [ ] Support artiklar skrivna
- [ ] Video tutorials (valfritt)

### Marketing
- [ ] Landing page live
- [ ] Social media accounts
- [ ] Press kit förberett
- [ ] Launch email förberett

---

## ✅ Final Checklist

Innan du trycker på "Submit":

- [ ] All functionality testad
- [ ] No critical bugs
- [ ] Privacy policy live
- [ ] Screenshots ser bra ut
- [ ] App description är korrekt
- [ ] Contact information uppdaterad
- [ ] Support system setup
- [ ] Monitoring setup
- [ ] Backup plan om något går fel

---

**Deployment Date:** __________  
**Version:** 1.0.0  
**Deployed By:** __________

**Notes:**
_______________________________________
_______________________________________
_______________________________________
