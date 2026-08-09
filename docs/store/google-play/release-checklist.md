# Google Play Release Checklist: Pocket Ahead

## Automated checks

- [x] `npx expo-doctor` (20/20 checks passed on 2026-08-09)
- [x] `npx expo install --check` (dependencies match Expo SDK 57)
- [x] `npx tsc --noEmit`
- [x] `npm run lint`
- [x] `npm test -- --runInBand` (31 suites, 151 tests)
- [x] `npx expo export --platform web --clear` (47 static routes)
- [x] Live Supabase project is `ACTIVE_HEALTHY`; all 20 public tables have RLS enabled with authenticated per-user ownership policies. Google auth logs show a successful token exchange and user validation on 2026-08-09.
- [x] Clean Android prebuild and inspect the merged release manifest.
- [x] Build and install a debug Android APK on the API 37 emulator; verify a cold start without native or JavaScript errors.
- [x] Build release-mode APK and AAB packages from a clean short-path checkout; release lint and all 683 Gradle tasks passed. Install the APK on the API 37 emulator and verify an offline cold start with persisted data. These local artifacts are debug-signed for QA only, not Play distribution.
- [x] Rebuild the final release-mode APK and AAB after the responsive dashboard and app-icon corrections; all 739 clean APK tasks and the subsequent AAB packaging passed. Install the APK on the API 37 emulator and verify a standalone launch without Metro or fatal runtime errors.
- [ ] Build a signed production AAB with EAS and install an internal-test APK on a physical Android device.

## Runtime checks

- [x] Guest welcome, language selection and first onboarding step; dashboard layout after native Google sign-in.
- [x] Complete guest onboarding and verify the native income date picker through plan completion and cold restart.
- [ ] Email sign-up, verification, sign-in, password recovery and password update deep link.
- [x] Google sign-in with the debug package and debug signing certificate.
- [ ] Google sign-in with the signed release package and production signing certificate.
- [x] Create/edit/delete transactions, bills, debts and goals; restart the app; verify encrypted local persistence.
- [ ] Verify authenticated Supabase synchronization for transactions, bills, debts, goals and preferences.
- [ ] Offline edits followed by reconnect and conflict synchronization.
- [x] Native system light/dark startup and the language selector's flag rendering.
- [x] Arabic RTL/Cairo typography, including the welcome screen and language-change restart prompt.
- [ ] Full manual walkthroughs in the other eight languages, font scaling and reduced motion.
- [x] Profile image upload/change and cold-restart persistence.
- [x] JSON data export opens the native Android share sheet.
- [ ] Account deletion removes remote and local data.

## Play Console and owner inputs

- [ ] Expo/EAS account linked; production signing credentials secured.
- [ ] Monitored support/privacy/account-deletion email configured in EAS.
- [ ] Publisher legal identity, address and governing law finalized in the app and privacy page.
- [x] Functional HTTPS URLs hosted and verified with HTTP 200:
  - Privacy policy: `https://harriselmac-collab.github.io/pocket-ahead-legal/privacy-policy.html`
  - Account deletion: `https://harriselmac-collab.github.io/pocket-ahead-legal/delete-account.html`
- [ ] Supabase allowed redirect URLs include exactly:
  - `pocketahead://auth`
  - `pocketahead://auth/update-password`
  - `https://harriselmac-collab.github.io/pocket-ahead-legal/delete-account.html`
- [ ] Supabase leaked-password protection enabled.
- [ ] Data safety, Financial features, Content rating and App access forms match the release build.
- [x] Store icon, feature graphic and four 1080 x 1920 phone screenshots prepared and validated in `docs/store/google-play/assets`.
- [ ] Store screenshots, feature graphic and icon uploaded in Play Console.
- [ ] Internal test completed before production rollout.

## Known release-engineering caveat

- `npm audit --omit=dev` reports 25 moderate/high findings rooted in the current Expo/Metro/React Native Node build toolchain. Its proposed automatic fix is an incompatible downgrade to Expo 53 and React Native 0.72, so no automatic downgrade was applied. The release APK nevertheless completed native compilation and Android release lint successfully; re-check this audit when Expo publishes compatible patched SDK 57 packages.
