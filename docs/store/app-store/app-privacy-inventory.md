# App Store Privacy Inventory: Pocket Ahead

Apple requires developers to submit an App Privacy report detailing data collection categories, usage, and user tracking settings.

---

## 1. Data Collection & Linkage

| Data Category | Linked to User | Used for Tracking | Purpose |
| :--- | :--- | :--- | :--- |
| **Contact Info** (Email, Name) | Yes | No | Account setup and authentication |
| **Financial Info** (Transactions, Debts, Goals) | Yes | No | App core budget and savings tracker |
| **Sensitive Info** (Religion, optional) | Yes | No | Event notifications |

---

## 2. In-App Account Deletion
* **Requirement**: Apple App Store Guideline 5.1.1(v) requires apps that allow account creation to support in-app account deletion.
* **Pocket Ahead Support**: Implemented in `src/app/profile/delete-account.tsx`. Tapping the button deletes user columns by cascade and removes the Supabase authentication user before clearing the local session.
