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

`pnpm check` runs format, lint, TypeScript and session, registration and stock-validation tests.
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

Current screens: registration/login; a personalized home dashboard with live stock
and active-treatment summaries; My Pharmacy with All / Low stock / Expired filters;
medicine search/detail and add-to-pharmacy quantity/unit/expiry form; existing
treatments and dose recording; reminder inbox and preferences. The bottom action
bar provides Home, Pharmacy, Add, Treatments and More, with header shortcuts for
reminders and settings. Dashboard counts represent stock entries, not distinct
medicines. Stock creation does not change treatment schedules or record doses.

The teal palette, rounded cards, icon navigation and quick-action sheet follow the
original design assets. The central Add action opens available actions; camera
scanning, AI assistance, doctors/community sharing, treatment
creation, stock editing and phone push remain future work. The app supports English, French and Arabic, with a saved language choice and right-to-left Arabic layout.
Push requires Expo/Firebase provisioning and native-device testing.

The original monorepo is preserved. No remote, commit or push was created automatically.

## Welcome screen

Each fresh app launch opens the public landing screen, adapted from the web
landing page's English, French and Arabic copy, teal styling, illustrative pharmacy preview, feature
sections, getting-started steps and FAQ. Create-account and sign-in actions open
the existing authentication form; restored sessions get a Continue action without
signing in again. Returning from the background keeps the current screen.
The preview is explicitly illustrative and never displays private account data.
Landing copy is kept locally in src/landing-copy.ts so no sibling repo is required.

## Prescriptions

Both mobile and web now support manual drafts, catalog linking, image attachments,
field review, confirmation and archive. Open **More → My Prescriptions** or the
**Add** menu. See [Prescription management](docs/PRESCRIPTIONS.md) for supported
regimens, attachment configuration and the required native rebuild.

## Language, date/time inputs and navigation

The language selector is available on the welcome screen and inside the app.
Its device preference survives restarts and is used for new account registration.
Medicine names, prescribed instructions and user-entered data retain their original text.

Prescription dates, treatment dates, stock expiry dates and daily dose times use
native date/time selectors. Optional fields can be cleared, and daily times can
be added or removed. API values remain local calendar dates (`YYYY-MM-DD`) and
24-hour times (`HH:mm`), with existing validation preserved.

Focused inputs scroll above the keyboard, and the bottom navigation hides while
typing. Back controls and Android Back return through screen history; prescription
drafts and edited reviews retain their confirmation before discarding changes.

Rebuild and reinstall the native app after updating dependencies: the date/time
picker adds a native module, so refreshing an older installed binary is insufficient.
