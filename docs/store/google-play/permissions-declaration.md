# Google Play Permissions Declaration: Pocket Ahead

## Permissions in the merged release manifest

- **`android.permission.INTERNET`**: Authentication, account synchronization, profile-picture upload and password recovery.
- **`android.permission.VIBRATE`**: User-enabled local reminder notifications.
- **`android.permission.POST_NOTIFICATIONS`**: Shown at runtime only when the user enables reminders on supported Android versions.
- **`android.permission.RECEIVE_BOOT_COMPLETED` / `WAKE_LOCK`**: Restore and deliver user-enabled scheduled reminders.
- **`android.permission.ACCESS_NETWORK_STATE`**: Connectivity awareness for network-backed services.
- **FCM receive, launcher badge and install-referrer permissions**: Added by the Expo notifications and Google Play libraries for notification delivery and badge compatibility. The app does not use these to read user content.

Profile-picture selection uses the Android system photo picker. The app does not request broad storage, camera or microphone access.

## Explicitly excluded

- `CAMERA`
- `RECORD_AUDIO`
- `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE`
- `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION`
- `READ_CONTACTS` / `READ_SMS`
- `USE_BIOMETRIC` / `USE_FINGERPRINT`
- `SYSTEM_ALERT_WINDOW`

Verify this declaration against the merged release manifest under `android/app/build/intermediates/merged_manifest/release/` after every clean prebuild.
