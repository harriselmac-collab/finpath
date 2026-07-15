# Google Play Account Deletion Declaration: FinPath

Google Play requires that apps supporting account creation must provide both in-app account deletion and an external web page where deletion can be requested.

---

## 1. In-App Deletion Flow
* **Path**: Profile > Privacy Centre > Delete My Account.
* **Flow**:
  1. Warning page detailing that all income, expenses, debts, goals, and login credentials will be permanently purged.
  2. Input verification: The user must type "DELETE" in capital letters to confirm.
  3. Action: Calls the secure `delete_user_account()` PostgreSQL function, purges all rows cascadingly, deletes the auth user from `auth.users`, invalidates local sessions, and redirects to the sign-in screen.

---

## 2. Web Portal Deletion Request
A public, web-accessible page template must be hosted at:
`https://YOUR-DOMAIN.com/delete-account`

### Required Content on Web Page:
* **Identification**: FinPath app developed by `[LEGAL ENTITY NAME]`.
* **Data Deleted**: Complete profile metadata, onboarding assessment logs, transactions ledger, debts, goals, and active auth credentials.
* **Retention Justification**: None. FinPath does not retain any financial information post-deletion.
* **Request Submission**: A secure submission form where authenticated or verified users can request manual database purge.
