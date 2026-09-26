import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text as NativeText,
  View,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  languages,
  languageNames,
  translate,
  type Language,
} from './translations';
const storageKey = 'saydaliyati.language.v1';
const Context = createContext<{
  language: Language;
  isRTL: boolean;
  ready: boolean;
  setLanguage(language: Language): Promise<void>;
  t(key: string, values?: Record<string, string | number>): string;
} | null>(null);
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, updateLanguage] = useState<Language>('en');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let active = true;
    const restore = async () => {
      try {
        const saved =
          Platform.OS === 'web'
            ? localStorage.getItem(storageKey)
            : await SecureStore.getItemAsync(storageKey);
        if (active && languages.includes(saved as Language))
          updateLanguage(saved as Language);
      } catch {
        // English remains available if device storage cannot be read.
      } finally {
        if (active) setReady(true);
      }
    };
    void restore();
    return () => {
      active = false;
    };
  }, []);
  const setLanguage = useCallback(async (value: Language) => {
    if (Platform.OS === 'web') localStorage.setItem(storageKey, value);
    else await SecureStore.setItemAsync(storageKey, value);
    updateLanguage(value);
  }, []);
  const t = useCallback(
    (key: string, values?: Record<string, string | number>) =>
      translate(language, key, values),
    [language],
  );
  return (
    <Context.Provider
      value={{ language, isRTL: language === 'ar', ready, setLanguage, t }}
    >
      <View style={{ flex: 1, direction: language === 'ar' ? 'rtl' : 'ltr' }}>
        {ready ? children : <ActivityIndicator />}
      </View>
    </Context.Provider>
  );
}
export function useLanguage() {
  const context = useContext(Context);
  if (!context) throw new Error('Language provider unavailable');
  return context;
}

export function AppText({
  style,
  ...props
}: React.ComponentProps<typeof NativeText>) {
  const { isRTL } = useLanguage();
  return (
    <NativeText
      {...props}
      style={[
        {
          textAlign: isRTL ? 'right' : 'left',
          writingDirection: isRTL ? 'rtl' : 'ltr',
        },
        style,
      ]}
    />
  );
}
export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();
  const [saving, setSaving] = useState(false);
  return (
    <View style={{ gap: 6, paddingVertical: 8 }}>
      <AppText>{t('Language')}</AppText>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {languages.map((value) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityLabel={languageNames[value]}
            accessibilityState={{
              checked: language === value,
              disabled: saving,
            }}
            disabled={saving}
            onPress={() => {
              setSaving(true);
              void setLanguage(value)
                .catch(() =>
                  Alert.alert(
                    t('Language could not be saved. Please try again.'),
                  ),
                )
                .finally(() => setSaving(false));
            }}
            style={{
              flex: 1,
              minHeight: 44,
              justifyContent: 'center',
              borderRadius: 8,
              padding: 8,
              backgroundColor: language === value ? '#087F7B' : '#DDF4F1',
            }}
          >
            <AppText
              style={{
                textAlign: 'center',
                color: language === value ? '#fff' : '#087F7B',
              }}
            >
              {languageNames[value]}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
