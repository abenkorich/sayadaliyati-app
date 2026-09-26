import { AppText as Text, useLanguage } from './language';
import { KeyboardTextInput as TextInput } from './keyboard';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Keyboard,
  Pressable,
  ScrollView,
  View,
  StyleSheet,
} from 'react-native';
import type { Request } from './prescription-model';
export type CatalogItem = {
  id: string;
  name: string;
  strength: string | null;
  dosageForm?: string | null;
  genericName?: string | null;
  boxImageUrl?: string | null;
  category?: { id: string; name: string; slug: string } | null;
};
export function MedicineImage({
  medicine,
  small = false,
}: {
  medicine: { name: string; boxImageUrl?: string | null };
  small?: boolean;
}) {
  const { t } = useLanguage();
  const [failed, setFailed] = useState<string | null>(null);
  const src = medicine.boxImageUrl;
  return (
    <View style={[s.image, small && s.small]}>
      {src?.startsWith('https://') && src !== failed ? (
        <Image
          source={{ uri: src }}
          accessibilityLabel={`${medicine.name} box`}
          resizeMode="contain"
          style={{ width: '100%', height: '100%' }}
          onError={() => setFailed(src)}
        />
      ) : (
        <View
          accessible
          accessibilityLabel={t('Box image not available')}
          style={s.placeholder}
        >
          <Text style={s.cross}>✚</Text>
          {!small && <Text style={s.muted}>{t('No box image yet')}</Text>}
        </View>
      )}
    </View>
  );
}
export function MedicineSearch({
  value,
  onChange,
  onSelect,
  api,
  category = '',
  disabled = false,
  filters = '',
  suggestionsEnabled = true,
  label = 'Search medicines',
}: {
  value: string;
  onChange(value: string): void;
  onSelect(item: CatalogItem): void;
  api: Request;
  category?: string;
  disabled?: boolean;
  filters?: string;
  suggestionsEnabled?: boolean;
  label?: string;
}) {
  const { t } = useLanguage();
  const [focused, setFocused] = useState(false);
  const query = value.trim();
  const key = `${category}|${filters}|${query}`;
  const [state, setState] = useState<{
    key: string;
    data: CatalogItem[];
    error: string;
    loading: boolean;
  }>({ key: '', data: [], error: '', loading: false });
  useEffect(() => {
    if (!focused || disabled || !suggestionsEnabled || query.length < 2) return;
    let active = true;
    const timer = setTimeout(() => {
      setState({ key, data: [], error: '', loading: true });
      void api<CatalogItem[]>(
        `/medicines/suggestions?q=${encodeURIComponent(query)}${category ? `&category=${encodeURIComponent(category)}` : ''}${filters}`,
      )
        .then((r) => {
          if (active)
            setState({ key, data: r.data, error: '', loading: false });
        })
        .catch(() => {
          if (active)
            setState({
              key,
              data: [],
              error: 'Suggestions unavailable. You can still search.',
              loading: false,
            });
        });
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    api,
    category,
    disabled,
    filters,
    focused,
    key,
    query,
    suggestionsEnabled,
  ]);
  const visible =
    focused &&
    !disabled &&
    suggestionsEnabled &&
    state.key === key &&
    query.length >= 2;
  return (
    <View style={s.stack}>
      <Text>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityRole="combobox"
        value={value}
        maxLength={200}
        editable={!disabled}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder={t('Name, ingredient, laboratory, barcode or MIPH code')}
        style={s.input}
        onFocus={() => setFocused(true)}
        onChangeText={(q) => {
          onChange(q);
          setFocused(true);
        }}
      />
      {visible && (
        <ScrollView
          style={s.suggestions}
          contentContainerStyle={{ padding: 10, gap: 8 }}
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled
        >
          {state.loading && (
            <Text accessibilityLiveRegion="polite">
              {t('Finding medicines…')}
            </Text>
          )}
          {!!state.error && (
            <Text accessibilityRole="alert">{t(state.error)}</Text>
          )}
          {!state.loading && !state.error && !state.data.length && (
            <Text>{t('No suggestions found.')}</Text>
          )}
          {state.data.map((m) => (
            <Pressable
              key={m.id}
              accessibilityRole="button"
              accessibilityLabel={`${m.name}, ${m.strength ?? ''}, ${m.dosageForm ?? ''}`}
              style={s.result}
              onPress={() => {
                setFocused(false);
                Keyboard.dismiss();
                onChange(m.name);
                onSelect(m);
              }}
            >
              <MedicineImage medicine={m} small />
              <View style={{ flex: 1 }}>
                <Text style={s.name}>{m.name}</Text>
                <Text style={s.muted}>
                  {[m.strength, m.dosageForm].filter(Boolean).join(' · ')}
                </Text>
              </View>
            </Pressable>
          ))}
          {state.data.length > 0 && (
            <Pressable
              accessibilityRole="button"
              onPress={() => setFocused(false)}
            >
              <Text style={s.muted}>{t('Dismiss suggestions')}</Text>
            </Pressable>
          )}
        </ScrollView>
      )}
    </View>
  );
}
export function CategoryFilter({
  api,
  value,
  onChange,
}: {
  api: Request;
  value: string;
  onChange(value: string): void;
}) {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  useEffect(() => {
    let active = true;
    void api<{ id: string; name: string }[]>('/medicines/categories')
      .then((r) => {
        if (active) setCategories(r.data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [api]);
  return (
    <View style={s.stack}>
      <Text>{t('Category')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.chips}>
          {[
            { id: '', name: 'All categories' },
            { id: 'uncategorized', name: 'Uncategorized' },
            ...categories,
          ].map((c) => (
            <Pressable
              key={c.id}
              accessibilityRole="button"
              accessibilityState={{ selected: value === c.id }}
              onPress={() => onChange(c.id)}
              style={[s.chip, value === c.id && s.selected]}
            >
              <Text style={{ color: value === c.id ? 'white' : '#125F5C' }}>
                {c.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  stack: { gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#CCDAD7',
    borderRadius: 12,
    padding: 14,
    backgroundColor: 'white',
    color: '#172321',
  },
  image: {
    height: 130,
    width: '100%',
    backgroundColor: '#EFF7F5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 8,
  },
  small: { width: 48, height: 48, marginBottom: 0 },
  placeholder: { alignItems: 'center', gap: 8 },
  cross: { fontSize: 30, color: '#648C87' },
  muted: { fontSize: 12, color: '#667371' },
  name: { fontWeight: '600', color: '#172321' },
  suggestions: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#CCDAD7',
    borderRadius: 12,
    maxHeight: 300,
  },
  result: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    padding: 8,
    minHeight: 60,
  },
  chips: { flexDirection: 'row', gap: 8 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#E4F2EF',
  },
  selected: { backgroundColor: '#087F7B' },
});
