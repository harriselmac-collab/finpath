# Google Play Release Checklist: Pocket Ahead

## Automated checks

- [x] `npx expo-doctor` (20/20 checks passed on 2026-08-09)
- [x] `npx expo install --check` (dependencies match Expo SDK 57)
- [x] `npx tsc --noEmit`
- [x] `npm run lint`
- [x] `npm test -- --runInBand` (29 suites, 136 tests)
- [x] `npx expo export --platform web --clear` (47 static routes)
- [x] Clean Android prebuild and inspect the merged release manifest.
- [ ] Build a signed production AAB with EAS and install an internal-test APK on a physical Android device.

## Runtime checks

- [ ] Guest onboarding, income date picker and dashboard layout.
- [ ] Email sign-up, verification, sign-in, password recovery and password update deep link.
- [ ] Google sign-in with the release package and signing certificate.
- [ ] Create/edit/delete transactions, bills, debts and goals; restart the app; verify persistence and synchronization.
- [ ] Offline edits followed by reconnect and conflict synchronization.
- [ ] Light/dark mode, all nine languages, Arabic RTL/Cairo typography, font scaling and reduced motion.
- [ ] Profile image upload/change/remove.
- [ ] JSON data export opens the native share sheet.
- [ ] Account deletion removes remote and local data.

## Play Console and owner inputs

- [ ] Expo/EAS account linked; production signing credentials secured.
- [ ] Monitored support/privacy/account-deletion email configured in EAS.
- [ ] Publisher legal identity, address and governing law finalized in the app and privacy page.
- [ ] Functional HTTPS privacy-policy and external account-deletion URLs hosted.
- [ ] Supabase allowed redirect URLs include exactly:
  - `pocketahead://auth`
  - `pocketahead://auth/update-password`
  - `https://harriselmac-collab.github.io/finpath/delete-account.html`
- [ ] Supabase leaked-password protection enabled.
- [ ] Data safety, Financial features, Content rating and App access forms match the release build.
- [ ] Store screenshots, feature graphic and icon uploaded.
- [ ] Internal test completed before production rollout.
