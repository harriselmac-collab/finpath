# Google Play Data Safety Inventory: Pocket Ahead

This inventory is the source of truth for the Google Play Data safety form. Re-check it against the release build before submission.

## Collection and sharing

Guest-mode data remains on the device. When a user creates or signs in to an account and synchronization is enabled, Pocket Ahead processes the following data:

| Data category | Examples | Collected | Shared | Purpose |
| --- | --- | --- | --- | --- |
| Personal info | Email address, preferred name, country, city, household details | Yes | No | Authentication, personalization and synchronization |
| Financial info | Income, expenses, bills, debts, goals and contributions | Yes | No | App functionality and cross-device synchronization |
| Photos | Optional profile picture | Optional | No | Profile personalization |
| Sensitive personal info | Optional religion/cultural preference supplied during onboarding | Optional | No | User-requested plan personalization |

Pocket Ahead does not sell user data and does not send financial data to an advertising or generative-AI provider. Supabase processes synchronized data as the app's contracted infrastructure provider.

## Security and deletion

- Data sent to the backend is encrypted in transit over HTTPS/TLS.
- Authentication tokens are stored on-device using Expo SecureStore. Financial records cached for offline use are stored in app-private local storage.
- Users can export their data from Profile > Export my data.
- Signed-in users can delete their account from Profile > Privacy centre > Delete my account.
- The account-deletion service removes the authentication user, cascaded app records and profile-picture objects. Operational security logs or infrastructure backups may remain temporarily under the service provider's documented retention controls.

## Not collected by the current release

- Contacts, SMS, call logs or precise location.
- Bank credentials or bank-account data.
- Advertising identifiers.
- Generated AI prompts or responses.
