# Pocket Ahead Development & Release Workflow

This document explains the standard workflow for developing new features, running quality checks, and shipping updates to Google Play and the App Store.

---

## 1. Local Development Workflow

### Starting the Dev Server
```powershell
# Start Expo development server with Metro
npm run start

# Run specifically on Android emulator / connected device
npm run android

# Run on Web for quick visual layout checks
npm run web
```

---

## 2. Quality & Validation Gates (Before Releasing)

Always run these four commands before preparing any release build:

```powershell
# 1. Type Checking (TypeScript)
npx tsc --noEmit

# 2. Test Suite (Jest Unit & Integration Tests)
npm test -- --runInBand

# 3. Linter
npm run lint

# 4. Expo Health Check
npx expo-doctor
```

---

## 3. Shipping an Update to Google Play

When you add new features and want to deploy a new version:

### Step A: Bump the Version Numbers in `app.json`
In [`app.json`](file:///c:/Users/Harris/Pictures/Pocket%20Ahead/POCKETAHEAD/app.json):
1. Increment `"versionCode"`:
   - Current: `1` → Next release: `2`, `3`, `4`, etc.
2. Increment `"version"`:
   - Current: `"1.0.0"` → Next release: `"1.0.1"` (for fixes) or `"1.1.0"` (for new features).

### Step B: Commit Changes
```powershell
git add .
git commit -m "feat: [describe your new feature] (v1.1.0)"
git push origin main
```

### Step C: Trigger Cloud Build on EAS
```powershell
npx eas-cli build --platform android --profile production
```

### Step D: Upload to Google Play Console
1. Download the newly built `.aab` from the Expo EAS link.
2. In Google Play Console, go to **Production** (or **Internal testing**).
3. Click **Create new release**, upload the `.aab`, write release notes, and click **Save and publish**.

---

## 4. Key Configuration & Service Links

* **EAS Project ID**: `d42a523f-da91-46c1-8499-152d1912bd67` (Owner: `kaelharris`)
* **Package Name**: `com.kaellabs.pocketahead`
* **Live Supabase Project**: `hvtmjkdldpijqwvbatpy` (`PocketAhead`, region `eu-west-3`)
* **Google Web Client ID**: `423722813251-ihpjde9unp70mlreq07164fubo9qcku1.apps.googleusercontent.com`
* **Privacy Policy URL**: `https://harriselmac-collab.github.io/pocket-ahead-legal/privacy-policy.html`
* **Account Deletion URL**: `https://harriselmac-collab.github.io/pocket-ahead-legal/delete-account.html`
