# Android testing

Follow the current [repository setup and build commands](../README.md).
The split API's fresh local setup uses port 3001. For USB testing, forward 3001 and
8081, then set EXPO_PUBLIC_API_URL=http://127.0.0.1:3001/api/v1. For an emulator,
use http://10.0.2.2:3001/api/v1. For VPS testing use its public HTTPS API endpoint.

The debug build requires Metro. A standalone release APK requires a real HTTPS
endpoint and Android signing/build configuration. No installable APK is included.
Hardware acceptance remains pending: verify secure session restoration, keyboard,
layout, catalog search, treatment records, read state and logout on the device.

Phone push is not implemented. It requires the user-owned Expo/Firebase projects,
FCM credentials and a native development build; remote push is unavailable in Expo
Go on Android. See [Expo's setup guide](https://docs.expo.dev/push-notifications/push-notifications-setup/).
