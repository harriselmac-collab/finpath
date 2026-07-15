# Google Play Release Checklist: FinPath

Before generating the final `.aab` Android App Bundle for deployment, complete this checklist to verify compliance with Google Play Store guidelines.

---

## 1. Technical Settings
* [ ] **Target SDK**: Ensure target SDK is set to Android 15 (API 35) or higher in `app.json` or native build configurations.
* [ ] **64-bit Architecture**: Verify support for 64-bit architectures (`arm64-v8a` and `x86_64`).
* [ ] **Version Code & Name**: Increment version codes in `app.json` for new submissions.
* [ ] **Debug Controls**: Ensure the local debug menu `Reset Onboarding Data` is fully wrapped inside `__DEV__` check so it is invisible in production.
* [ ] **Localhost / Sandbox URL**: Verify no hardcoded `http://localhost` or staging IP endpoints exist in production variables (use system env variables).

---

## 2. Play Console Declarations
* [ ] **Data Safety**: Complete the questionnaire matching `data-safety-inventory.md`.
* [ ] **Financial Features**: Submit the declaration describing budgeting features as outlined in `financial-features-declaration.md`.
* [ ] **Account Deletion**: Provide the deletion request URL: `https://YOUR-DOMAIN.com/delete-account`.
