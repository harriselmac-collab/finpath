# Google Play Account Deletion Declaration: Pocket Ahead

## In-app deletion

- **Path**: Profile > Privacy centre > Delete my account.
- The user must type `DELETE` and confirm a destructive dialog.
- The app calls the authenticated `delete-account` Supabase Edge Function.
- The function requires a recent login, removes profile-picture objects and deletes the Supabase Auth user. Foreign-key cascades remove associated app records.
- The app clears local financial data, notifications and the session after server deletion succeeds.

## External deletion request

The canonical source is `docs/delete-account.html`, published at:

`https://harriselmac-collab.github.io/pocket-ahead-legal/delete-account.html`

It:

- Identifies **Pocket Ahead** and publisher **Kael Labs**.
- Authenticates an existing user with email/password or Google through Supabase.
- Requires an explicit `DELETE` confirmation.
- Calls the same authenticated `delete-account` Edge Function used by the app.
- Explains the data removed and the limited temporary retention of security logs and encrypted infrastructure backups.
- Works without reinstalling Pocket Ahead.

Before Play submission, add that exact URL to the Supabase redirect allow list for Google OAuth, verify deletion with a disposable test account, and enter the URL in the Play Console Data safety form.
