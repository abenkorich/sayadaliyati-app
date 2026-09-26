import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { AppText as Text, useLanguage } from './language';
import { CameraAccess } from './camera-access';
import { scanSettingsError } from './scan-errors';
import { useSession } from './session';
type Preferences = { configured: boolean; processingConsent: boolean };
const Context = createContext<{
  preferences: Preferences | null;
  loading: boolean;
  error: string;
  reload(): void;
  save(consent: boolean): Promise<void>;
} | null>(null);
export function ScanSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { client, signedIn } = useSession();
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const generation = useRef(0);
  useEffect(() => {
    const epoch = ++generation.current;
    setPreferences(null);
    setError('');
    if (!signedIn) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void client
      .request<{ data: Preferences }>('/me/scan-preferences')
      .then((r) => {
        if (generation.current === epoch) setPreferences(r.data);
      })
      .catch((error: unknown) => {
        if (generation.current === epoch) setError(scanSettingsError(error));
      })
      .finally(() => {
        if (generation.current === epoch) setLoading(false);
      });
    return () => {
      generation.current++;
    };
  }, [client, signedIn, revision]);
  const save = useCallback(
    async (consent: boolean) => {
      const epoch = generation.current;
      const r = await client.request<{ data: Preferences }>(
        '/me/scan-preferences',
        'PATCH',
        { processingConsent: consent },
      );
      if (generation.current !== epoch) throw new Error('Session changed');
      setPreferences(r.data);
    },
    [client],
  );
  return (
    <Context.Provider
      value={{
        preferences,
        loading,
        error,
        save,
        reload: () => setRevision((n) => n + 1),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useScanSettings() {
  const context = useContext(Context);
  if (!context) throw new Error('Scan settings unavailable');
  return context;
}
export function ScanSettings({ onDone }: { onDone?: () => void }) {
  const { t } = useLanguage();
  const { preferences, loading, error, reload, save } = useScanSettings();
  const [consent, setConsent] = useState(
    preferences?.processingConsent ?? false,
  );
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState('');
  const lock = useRef(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setConsent(preferences?.processingConsent ?? false);
  }, [preferences]);
  async function submit() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setSaveError('');
    setSaved(false);
    try {
      await save(consent);
      setSaved(true);
      onDone?.();
    } catch (error) {
      setSaveError(scanSettingsError(error, true));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <View style={s.card}>
      <Text style={s.title}>{t('Scan settings')}</Text>
      <Text style={s.text}>
        {t(
          'Saved to your account for medicine and prescription scans. Change these anytime in your profile.',
        )}
      </Text>
      {loading && <ActivityIndicator color="#087F7B" />}
      {!!error && (
        <>
          <Text accessibilityRole="alert" style={s.error}>
            {t(error)}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={reload}
            style={s.button}
          >
            <Text style={s.buttonText}>{t('Try again')}</Text>
          </Pressable>
        </>
      )}
      {preferences && (
        <>
          <View style={s.row}>
            <Text style={[s.text, { flex: 1 }]}>
              {t(
                'Allow cropped medicine images to be sent to Saydaliyati and OpenAI for processing.',
              )}
            </Text>
            <Switch
              accessibilityLabel={t('Agree to server and OpenAI processing')}
              value={consent}
              disabled={busy}
              onValueChange={(value) => {
                setConsent(value);
                setSaved(false);
              }}
              trackColor={{ true: '#087F7B' }}
            />
          </View>
          <Text style={s.text}>
            {t(
              'Only the crop you approve is uploaded. You can turn this permission off anytime.',
            )}
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() => void submit()}
            style={s.button}
          >
            <Text style={s.buttonText}>
              {busy
                ? t('Saving…')
                : onDone
                  ? t('Save and continue')
                  : t('Save preferences')}
            </Text>
          </Pressable>
        </>
      )}
      {saved && (
        <Text accessibilityLiveRegion="polite" style={s.text}>
          {t('Preferences saved')}
        </Text>
      )}
      {!!saveError && (
        <Text accessibilityRole="alert" style={s.error}>
          {t(saveError)}
        </Text>
      )}
      <CameraAccess disabled={busy} />
    </View>
  );
}
const s = StyleSheet.create({
  card: { padding: 20, borderRadius: 20, gap: 16, backgroundColor: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#172321' },
  text: { fontSize: 14, lineHeight: 21, color: '#667371' },
  error: { color: '#8C2926' },
  button: {
    padding: 16,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#087F7B',
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  secondary: { paddingVertical: 12, minHeight: 48 },
});
