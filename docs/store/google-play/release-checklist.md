# Google Play Release Checklist: Pocket Ahead

## Automated checks

- [x] `npx expo-doctor` (20/20 checks passed on 2026-08-09)
- [x] `npx expo install --check` (dependencies match Expo SDK 57)
- [x] `npx tsc --noEmit`
- [x] `npm run lint`
- [x] `npm test -- --runInBand` (31 suites, 145 tests)
- [x] `npx expo export --platform web --clear` (47 static routes)
- [x] Clean Android prebuild and inspect the merged release manifest.
- [x] Build and install a debug Android APK on the API 37 emulator; verify a cold start without native or JavaScript errors.
- [ ] Build a signed production AAB with EAS and install an internal-test APK on a physical Android device.

## Runtime checks

- [x] Guest welcome, language selection and first onboarding step; dashboard layout after native Google sign-in.
- [ ] Complete guest onboarding and verify the income date picker through plan completion.
- [ ] Email sign-up, verification, sign-in, password recovery and password update deep link.
- [x] Google sign-in with the debug package and debug signing certificate.
- [ ] Google sign-in with the signed release package and production signing certificate.
- [ ] Create/edit/delete transactions, bills, debts and goals; restart the app; verify persistence and synchronization.
- [ ] Offline edits followed by reconnect and conflict synchronization.
- [x] Native system light/dark startup and the language selector's flag rendering.
- [x] Arabic RTL/Cairo typography, including the welcome screen and language-change restart prompt.
- [ ] Full manual walkthroughs in the other eight languages, font scaling and reduced motion.
- [ ] Profile image upload/change/remove.
- [ ] JSON data export opens the native share sheet.
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
- [ ] Store screenshots, feature graphic and icon uploaded.
- [ ] Internal test completed before production rollout.
