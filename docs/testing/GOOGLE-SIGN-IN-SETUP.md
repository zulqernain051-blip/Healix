# Google sign-in setup for browser review

The Expo web login and the administrator/doctor web portal now offer **Continue with Google**. It signs in an existing Healix user whose email matches a verified Gmail or Google Workspace address. It does not create users, bypass role restrictions, or replace Healix's optional email MFA.

To enable the button, use a Google Cloud project you control:

1. In [Google Auth Platform](https://console.cloud.google.com/auth/overview), configure the app branding and audience. Choose **External** for ordinary Gmail test accounts (or **Internal** only if all testers belong to the same Workspace organization). While the app is in Testing, add each tester's Google email under **Audience → Test users**.
2. Open **Clients → Create client → Web application**. Add these **Authorized JavaScript origins** for the local browser run: `http://localhost:8081` (Expo web) and `http://localhost:5173` (portal). If the portal is opened at `http://127.0.0.1:5173`, add that origin too, or reopen it using `localhost`. Origins must match the browser address exactly. This Google Identity Services popup/callback integration does not use an authorization redirect URI.
3. Copy the resulting **Client ID** (ending in `.apps.googleusercontent.com`). It is a public identifier; do not share or enter the client secret. Use the same ID in these three environment variables:

| Location | Variable |
| --- | --- |
| Backend environment | `GOOGLE_WEB_CLIENT_ID` |
| Expo web environment | `EXPO_PUBLIC_GOOGLE_CLIENT_ID` |
| Web portal environment | `VITE_GOOGLE_CLIENT_ID` |

For local setup, put `GOOGLE_WEB_CLIENT_ID=<client-id>` in `backend/.env`, `EXPO_PUBLIC_GOOGLE_CLIENT_ID=<client-id>` in `mobile/.env`, and `VITE_GOOGLE_CLIENT_ID=<client-id>` in `web/.env.local`. Keep real environment files out of version control. Restart each development server after setting its variable. The disabled button is shown when a browser client ID is missing. The backend will reject Google credentials until its client ID is configured.

For the planned supervised live check, use a development account already provisioned in Healix with the same Gmail/Workspace email. The Google Cloud OAuth consent configuration must also allow the chosen test account. Native Android/iOS Google sign-in is a separate integration requiring platform OAuth clients and an Expo development build; this browser implementation does not cover it.

References: [Google OAuth client setup](https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid), [Google ID token verification](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).
