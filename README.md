# sayadaliyati-app

Independent Expo Android/iOS client for Saydaliyati. No API source, database package,
server secret or sibling checkout is required. The backend is sayadaliyati-api and
is accessed exclusively through the configured HTTP API.

## Setup

Use Node 24.21.0 and pnpm 11.24.0.

```sh
pnpm install --frozen-lockfile
cp .env.example .env
# Set EXPO_PUBLIC_API_URL to your API's /api/v1 endpoint.
pnpm start
```

For your VPS, use `https://your-development-domain/api/v1`. This value is public,
not a secret. Release builds reject HTTP. Restart Metro after changing it.

## Android build and install

With Android SDK/JDK configured and a USB-debugging phone connected:

```sh
adb devices
# For a locally running split API only:
adb reverse tcp:3001 tcp:3001
adb reverse tcp:8081 tcp:8081
pnpm android:install
```

This builds and installs a debug app and starts Metro. For a remote HTTPS API,
no API-port forwarding is needed. `pnpm android` starts Expo and opens Android;
`pnpm bundle:android` checks the JS/assets bundle but does not generate an APK.
Native build outputs, credentials and signing keys are ignored.

## Checks

`pnpm check` runs format, lint, TypeScript and six session-client tests.
For an optional running-API smoke test, copy .env.test.example to .env.test and
configure an existing dedicated patient account, then run `pnpm test:integration`.
This test uses HTTP only. It creates its own session, rotates/revokes it and reads
profile/catalog/inbox/preferences; it does not create an account or edit health data.
Test credentials are never needed to install or build the app.

## Contracts and scope

contracts/api.openapi.json is the API contract snapshot at the split. Update it
explicitly from sayadaliyati-api/docs/api.openapi.json after backend contract
changes; review compatibility and run the HTTP smoke test. Both repos install
independently; there are no workspace links across repositories. Automatic type
generation from OpenAPI is not installed yet.

Current screens: registration/login, medicine search/detail, existing treatments,
dose recording, reminder inbox and preferences. The UI is English. Mobile treatment
creation, inventory/prescription screens and phone push remain future work. Push
requires Expo/Firebase provisioning and native-device testing.

The original monorepo is preserved. No remote, commit or push was created automatically.
