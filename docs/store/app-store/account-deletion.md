# App Store Account Deletion: FinPath

App Store account deletion documentation.

---

## 1. Compliance Details
* **In-App Account Deletion**: Implemented in `src/app/profile/delete-account.tsx`.
* **Database Purple Flow**: Calls `delete_user_account()` rpc trigger in Supabase, which cascadingly deletes all entries inside profiles, onboarding answers, debts, goals, and transactions, immediately signing out the session.
* **Storage Purification**: Clear AsyncStorage settings cache and local authentication tokens via `Expo SecureStore`.
