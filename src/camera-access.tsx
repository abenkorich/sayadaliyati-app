import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AppText as Text, useLanguage } from './language';
export function CameraAccess({
  disabled = false,
  revision = 0,
}: {
  disabled?: boolean;
  revision?: number;
}) {
  const { t } = useLanguage();
  const [permission, setPermission] =
    useState<ImagePicker.CameraPermissionResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const mounted = useRef(false);
  const lock = useRef(false);
  useEffect(() => {
    mounted.current = true;
    const refresh = () => {
      if (Platform.OS === 'web') return;
      void ImagePicker.getCameraPermissionsAsync()
        .then((value) => {
          if (mounted.current) {
            setPermission(value);
            setError('');
          }
        })
        .catch(() => {
          if (mounted.current)
            setError(
              'Unable to check camera permission. Try granting access again.',
            );
        });
    };
    refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      mounted.current = false;
      subscription.remove();
    };
  }, [revision]);
  async function grant() {
    if (lock.current || disabled) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      if (permission?.granted || permission?.canAskAgain === false)
        await Linking.openSettings();
      else {
        const value = await ImagePicker.requestCameraPermissionsAsync();
        if (mounted.current) setPermission(value);
      }
    } catch {
      if (mounted.current)
        setError(
          'Unable to change camera access. Open your phone settings to grant permission.',
        );
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  if (Platform.OS === 'web')
    return (
      <Text style={s.text}>
        {t('Use the mobile app to take and crop photos.')}
      </Text>
    );
  if (permission?.granted || (!permission && !error)) return null;
  return (
    <View style={s.card}>
      <Text style={s.title}>{t('Camera access')}</Text>
      <Text accessibilityLiveRegion="polite" style={s.text}>
        {t(
          permission?.canAskAgain === false
            ? 'Camera permission is blocked. Enable it in phone settings, or choose a photo from storage.'
            : 'Allow camera access to take a photo. You can also choose an existing photo without granting camera access.',
        )}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || busy }}
        disabled={disabled || busy}
        onPress={() => void grant()}
        style={[s.button, (disabled || busy) && { opacity: 0.45 }]}
      >
        <Text style={s.buttonText}>
          {t(
            busy
              ? 'Checking camera access…'
              : permission?.granted || permission?.canAskAgain === false
                ? 'Open phone settings'
                : 'Grant camera access',
          )}
        </Text>
      </Pressable>
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {t(error)}
        </Text>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  card: { gap: 12, padding: 16, borderRadius: 12, backgroundColor: '#E4F3EF' },
  title: { color: '#172321', fontSize: 16, fontWeight: '600' },
  text: { color: '#667371', fontSize: 14, lineHeight: 21 },
  button: {
    backgroundColor: '#087F7B',
    padding: 14,
    minHeight: 48,
    borderRadius: 12,
  },
  buttonText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  error: { color: '#8C2926', lineHeight: 21 },
});
