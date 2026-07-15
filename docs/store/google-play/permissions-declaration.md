# Google Play Permissions Declaration: FinPath

Review of permissions declared in the Android Manifest for FinPath.

---

## 1. Declared Permissions

* **`android.permission.INTERNET`**: Required to sync transactions, fetch goals from Supabase, and get Gemini AI summaries.
* **`android.permission.ACCESS_NETWORK_STATE`**: Used by state managers to verify connection state and display cache documents if offline.

---

## 2. Excluded Sensitive Permissions
FinPath does not declare or request any of these restricted permissions:
* `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE`
* `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION`
* `READ_CONTACTS` / `READ_SMS`
* `CAMERA` (unless user uploads custom avatar, which is currently resolved locally).
