# Google Play App Access Review: FinPath

If parts of your app are restricted based on login credentials or subscriptions, you must provide instructions for the App Review team to access them.

---

## 1. Credentials for Reviewers

* **Access Requirements**: The app requires authentication to view budgeting dashboards and savings calculators.
* **Test Username / Email**: `tester@finpath.com`
* **Test Password**: `TesterPass123!`
* **OTP / 2FA**: Disabled for this testing account.

---

## 2. Walkthrough Instructions
1. Open the app. The landing view redirects to `/auth` if no active session is loaded.
2. Input the test credentials and click **Sign In**.
3. Complete or skip the onboarding questionnaire to initialize the dashboard indicators (Home screen).
4. Navigate through all tabs (Home, Plan, History, Profile).
