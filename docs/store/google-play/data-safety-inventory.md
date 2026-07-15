# Google Play Data Safety Inventory: FinPath

This inventory represents the data collection, sharing, and security practices of FinPath as declared in the Google Play Console.

---

## 1. Data Collection & Sharing

| Data Category | Data Type | Collected | Shared | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Personal Info** | Preferred Name | Yes | No | Account personalization |
| **Personal Info** | Email Address | Yes | No | User authentication |
| **Financial Info** | Income & Expenses | Yes | No | App functionality (budgeting, charts) |
| **Financial Info** | Debts & Goals | Yes | No | App functionality (savings projections) |
| **Sensitive Info** | Religion (Optional) | Yes | No | Optional cultural event predictions |
| **AI Processing** | Financial Summaries | Yes | Yes (Google Gemini) | Conversational explanations of budget |

---

## 2. Data Security Practices
* **Encryption in Transit**: All data is sent over encrypted HTTPS connections using TLS 1.3.
* **Encrypted Storage**: Local session keys and tokens are stored securely in macOS Keychain / iOS Keychain / Android Keystore via `Expo SecureStore`.
* **In-App Account Deletion**: Users can purge their complete profile and data entries instantly from within the app.
