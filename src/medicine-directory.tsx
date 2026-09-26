import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  View,
  StyleSheet,
  Linking,
} from 'react-native';
import { AppText as Text, useLanguage } from './language';
import { KeyboardTextInput as TextInput } from './keyboard';
import type { Request } from './prescription-model';
export type DirectoryFilters = {
  laboratory: string;
  holderCountry: string;
  dosageForm: string;
  registrationStatus: string;
};
export const emptyDirectoryFilters: DirectoryFilters = {
  laboratory: '',
  holderCountry: '',
  dosageForm: '',
  registrationStatus: 'ACTIVE',
};
export function directoryParams(
  filters: DirectoryFilters,
  suggestions = false,
) {
  const params = new URLSearchParams();
  for (const key of ['laboratory', 'holderCountry', 'dosageForm'] as const)
    if (filters[key]) params.set(key, filters[key]);
  if (!suggestions && filters.registrationStatus !== 'ACTIVE') {
    params.set('status', 'ALL');
    if (filters.registrationStatus !== 'ALL')
      params.set('regulatoryStatus', filters.registrationStatus);
  }
  return params.size ? `&${params}` : '';
}
export type DirectoryDetails = {
  registrationHolder?: string | null;
  holderCountry?: string | null;
  registrationNumber?: string | null;
  packageSize?: string | null;
  route?: string | null;
  status?: string;
  regulatoryStatus?: string | null;
  manufacturer?: { name: string } | null;
  sourceVersion?: string | null;
  barcodes?: { barcode: string; barcodeType: string }[];
  miph?: {
    sourceUrl: string | null;
    sheet: string | null;
    row: number | null;
    checksum: string | null;
    fields: { name: string; displayValue: string | null }[];
  } | null;
};

function FilterChoice({
  label,
  value,
  choices,
  onChange,
}: {
  label: string;
  value: string;
  choices: { value: string; label: string }[];
  onChange(value: string): void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false),
    [query, setQuery] = useState('');
  return (
    <View style={s.stack}>
      <Text>{t(label)}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${t(label)}: ${t(choices.find((c) => c.value === value)?.label ?? value)}`}
        style={s.input}
        onPress={() => {
          setQuery('');
          setOpen(true);
        }}
      >
        <Text>
          {t(choices.find((c) => c.value === value)?.label ?? value)} ▾
        </Text>
      </Pressable>
      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
        presentationStyle="pageSheet"
      >
        <View style={s.modal}>
          <Text style={s.title}>{t(label)}</Text>
          <Pressable accessibilityRole="button" onPress={() => setOpen(false)}>
            <Text>{t('Close')}</Text>
          </Pressable>
          <TextInput
            accessibilityLabel={t('Filter options')}
            placeholder={t('Filter options')}
            value={query}
            onChangeText={setQuery}
            style={s.input}
          />
          <ScrollView keyboardShouldPersistTaps="handled">
            {choices
              .filter((c) =>
                t(c.label)
                  .toLocaleLowerCase()
                  .includes(query.trim().toLocaleLowerCase()),
              )
              .map((c) => (
                <Pressable
                  key={c.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: value === c.value }}
                  style={s.option}
                  onPress={() => {
                    onChange(c.value);
                    setOpen(false);
                  }}
                >
                  <Text>
                    {t(c.label)}
                    {value === c.value ? ' ✓' : ''}
                  </Text>
                </Pressable>
              ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
export function DirectoryFilterFields({
  api,
  value,
  onChange,
}: {
  api: Request;
  value: DirectoryFilters;
  onChange(value: DirectoryFilters): void;
}) {
  const { t } = useLanguage();
  const [options, setOptions] = useState<{
    laboratories: string[];
    countries: string[];
    dosageForms: string[];
  }>({ laboratories: [], countries: [], dosageForms: [] });
  const [failed, setFailed] = useState(false),
    [expanded, setExpanded] = useState(false);
  useEffect(() => {
    let active = true;
    void api<typeof options>('/medicines/filters')
      .then((r) => {
        if (active) {
          setOptions(r.data);
          setFailed(false);
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [api]);
  const count = Object.entries(value).filter(
    ([key, v]) => v && !(key === 'registrationStatus' && v === 'ACTIVE'),
  ).length;
  return (
    <View style={s.stack}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={s.input}
        onPress={() => setExpanded((v) => !v)}
      >
        <Text>
          {t('Directory filters')} {count ? `(${count})` : ''}{' '}
          {expanded ? '▴' : '▾'}
        </Text>
      </Pressable>
      {expanded && (
        <>
          <FilterChoice
            label="Laboratory (registration holder)"
            value={value.laboratory}
            choices={[
              { value: '', label: 'All' },
              ...(options.laboratories ?? []).map((v) => ({
                value: v,
                label: v,
              })),
            ]}
            onChange={(laboratory) => onChange({ ...value, laboratory })}
          />
          <FilterChoice
            label="Laboratory country"
            value={value.holderCountry}
            choices={[
              { value: '', label: 'All' },
              ...(options.countries ?? []).map((v) => ({ value: v, label: v })),
            ]}
            onChange={(holderCountry) => onChange({ ...value, holderCountry })}
          />
          <FilterChoice
            label="Dosage form"
            value={value.dosageForm}
            choices={[
              { value: '', label: 'All' },
              ...(options.dosageForms ?? []).map((v) => ({
                value: v,
                label: v,
              })),
            ]}
            onChange={(dosageForm) => onChange({ ...value, dosageForm })}
          />
          <FilterChoice
            label="Registration status"
            value={value.registrationStatus}
            choices={[
              { value: 'ACTIVE', label: 'Active medicines' },
              { value: 'ALL', label: 'All records' },
              { value: 'NOT_RENEWED', label: 'Not renewed' },
              { value: 'WITHDRAWN', label: 'Withdrawn' },
            ]}
            onChange={(registrationStatus) =>
              onChange({ ...value, registrationStatus })
            }
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => onChange(emptyDirectoryFilters)}
          >
            <Text>{t('Reset details filters')}</Text>
          </Pressable>
          {failed && (
            <Text accessibilityRole="alert">
              {t(
                'Filter options unavailable. You can still search by laboratory or other details.',
              )}
            </Text>
          )}
        </>
      )}
    </View>
  );
}
export function MedicineDirectoryDetails({
  medicine,
}: {
  medicine: DirectoryDetails;
}) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={s.stack}>
      {[
        ['Registration status', medicine.regulatoryStatus ?? medicine.status],
        ['Laboratory (registration holder)', medicine.registrationHolder],
        ['Laboratory country', medicine.holderCountry],
        ['Manufacturer', medicine.manufacturer?.name],
        ['Registration number', medicine.registrationNumber],
        ['Packaging', medicine.packageSize],
        ['Route', medicine.route],
        ['Source version', medicine.sourceVersion],
      ].map(([label, value]) => (
        <View key={label}>
          <Text style={s.label}>{t(label ?? '')}</Text>
          <Text selectable>{value ?? t('Not supplied')}</Text>
        </View>
      ))}
      <Text style={s.label}>{t('Package barcodes')}</Text>
      <Text selectable>
        {medicine.barcodes?.length
          ? medicine.barcodes
              .map((b) => `${b.barcode} (${b.barcodeType})`)
              .join(' · ')
          : t(
              'No package barcode supplied. MIPH codes are nomenclature codes, not package barcodes.',
            )}
      </Text>
      {medicine.miph && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded }}
            style={s.input}
            onPress={() => setExpanded((v) => !v)}
          >
            <Text>
              {t('All MIPH source fields')} {expanded ? '▴' : '▾'}
            </Text>
          </Pressable>
          {expanded && (
            <>
              <Text>
                {medicine.miph.sheet} · {t('Row')} {medicine.miph.row}
              </Text>
              {medicine.miph.fields.map((f) => (
                <View key={f.name}>
                  <Text style={s.label}>{f.name}</Text>
                  <Text selectable>{f.displayValue ?? t('Not supplied')}</Text>
                </View>
              ))}
              {medicine.miph.sourceUrl && (
                <Pressable
                  accessibilityRole="link"
                  onPress={() => {
                    void Linking.openURL(medicine.miph!.sourceUrl!).catch(
                      () => {},
                    );
                  }}
                >
                  <Text>{t('Official MIPH source workbook')}</Text>
                </Pressable>
              )}
            </>
          )}
        </>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  stack: { gap: 12 },
  title: { fontSize: 22, fontWeight: '600' },
  label: { fontSize: 12, color: '#526D69', marginBottom: 3 },
  input: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#CCDAD7',
    borderRadius: 12,
    backgroundColor: 'white',
    color: '#172321',
  },
  modal: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
    gap: 16,
    backgroundColor: '#F7FBFA',
  },
  option: { paddingVertical: 16, borderBottomWidth: 1, borderColor: '#DFEAE7' },
});
