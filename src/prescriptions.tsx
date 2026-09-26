import { AppText as Text, useLanguage } from './language';
import { DateTimeField, DailyTimePicker } from './date-time-field';
import { KeyboardTextInput as TextInput } from './keyboard';
import { MedicineSearch } from './medicine-search';
import { PrescriptionScan } from './prescription-scan';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSession } from './session';
import {
  blank,
  fields,
  inputValues,
  createBody,
  reviewBody,
  confirmationBody,
  confirmationProblem,
  nextPage,
  uploadError,
  type Inputs,
  type Medication,
  type Request,
  type Result,
} from './prescription-model';
import { usePrescriptions } from './use-prescriptions';
function Button({
  title,
  onPress,
  disabled = false,
}: {
  title: string;
  onPress(): void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[s.button, disabled && { opacity: 0.45 }]}
    >
      <Text style={s.buttonText}>{title}</Text>
    </Pressable>
  );
}
function Field({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange(value: string): void;
  disabled?: boolean;
}) {
  const { t } = useLanguage();
  return (
    <View style={s.stack}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        editable={!disabled}
        onChangeText={onChange}
        style={s.input}
        autoCapitalize="none"
        placeholder={t('Unknown if blank')}
        multiline={label === t('Instructions')}
      />
    </View>
  );
}
function MedicinePicker({
  value,
  disabled,
  onChange,
  api,
}: {
  value: string;
  disabled: boolean;
  onChange(id: string): void;
  api: Request;
}) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  return (
    <View>
      <Text>
        {value
          ? t('Catalog medicine linked. Search to replace it.')
          : t('Choose a medicine or keep the written name.')}
      </Text>
      <MedicineSearch
        value={query}
        onChange={setQuery}
        api={api}
        disabled={disabled}
        label={t('Search catalog')}
        onSelect={(m) => onChange(m.id)}
      />
      {!!value && (
        <Button
          title={t('Clear catalog link')}
          disabled={disabled}
          onPress={() => onChange('')}
        />
      )}
    </View>
  );
}

function Editor({
  value,
  onChange,
  checked,
  onCheck,
  api,
  disabled,
}: {
  value: Inputs;
  onChange(value: Inputs): void;
  checked?: Record<string, boolean>;
  onCheck?(name: string, checked: boolean): void;
  api: Request;
  disabled: boolean;
}) {
  const { t } = useLanguage();
  return (
    <View style={s.stack}>
      <PrescriptionScan
        mode="box"
        disabled={disabled}
        report={() => {}}
        onApply={(preview) => {
          const line = preview.medications[0];
          if (line)
            onChange({
              ...value,
              medicineId: '',
              extractedName: line.extractedName,
              strength: line.strength,
            });
        }}
      />
      {fields.map((f) => (
        <View key={f.name} style={s.field}>
          {f.kind === 'medicine' ? (
            <>
              <Text style={s.label}>{t(f.label)}</Text>
              <MedicinePicker
                value={value.medicineId}
                disabled={disabled}
                onChange={(id) => onChange({ ...value, medicineId: id })}
                api={api}
              />
            </>
          ) : f.kind === 'date' ? (
            <DateTimeField
              label={t(f.label)}
              value={value[f.name]}
              disabled={disabled}
              onChange={(v) => onChange({ ...value, [f.name]: v })}
            />
          ) : f.kind === 'times' ? (
            <DailyTimePicker
              value={value[f.name]}
              disabled={disabled}
              onChange={(v) => onChange({ ...value, [f.name]: v })}
            />
          ) : (
            <Field
              label={t(f.label)}
              value={value[f.name]}
              disabled={disabled}
              onChange={(v) => onChange({ ...value, [f.name]: v })}
            />
          )}
          {checked && (
            <View style={s.row}>
              <Text style={[s.muted, { flex: 1 }]}>
                {t('I reviewed')} {t(f.label)}
                {!value[f.name] ? t(' (unknown)') : ''}
              </Text>
              <Switch
                accessibilityLabel={`${t('I reviewed')} ${t(f.label)}`}
                value={!!checked[f.name]}
                disabled={disabled}
                onValueChange={(v) => onCheck?.(f.name, v)}
                trackColor={{ true: '#087F7B' }}
              />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}
function LineReview({
  line,
  editable,
  api,
  busy,
  save,
  reject,
  onDirty,
}: {
  line: Medication;
  editable: boolean;
  api: Request;
  busy: boolean;
  save(body: unknown): void;
  reject(): void;
  onDirty(): void;
}) {
  const { t } = useLanguage();
  const [value, setValue] = useState(() => inputValues(line)),
    [checked, setChecked] = useState<Record<string, boolean>>(() =>
      Object.fromEntries(line.fields.map((f) => [f.fieldName, f.confirmed])),
    ),
    [error, setError] = useState('');
  if (!editable)
    return (
      <View style={s.card}>
        <Text style={s.heading}>
          {line.medicine?.name ?? line.extractedName ?? t('Medicine')}
        </Text>
        <Text style={s.badge}>{t(line.confirmationStatus)}</Text>
        {fields.map((f) => (
          <View key={f.name}>
            <Text style={s.label}>{t(f.label)}</Text>
            <Text style={s.muted}>
              {f.name === 'medicineId'
                ? (line.medicine?.name ?? t('Unknown'))
                : value[f.name] || t('Unknown')}
            </Text>
          </View>
        ))}
      </View>
    );
  return (
    <View style={s.card}>
      <Text style={s.heading}>
        {line.medicine?.name ?? line.extractedName ?? t('Medicine')}
      </Text>
      <Text style={s.muted}>
        {t(
          'Review each value, including unknowns. Editing clears the field’s review check. Save each medicine’s review.',
        )}
      </Text>
      <Editor
        value={value}
        onChange={(next) => {
          onDirty();
          setChecked((previous) => ({
            ...previous,
            ...Object.fromEntries(
              fields
                .filter((f) => value[f.name] !== next[f.name])
                .map((f) => [f.name, false]),
            ),
          }));
          setValue(next);
        }}
        checked={checked}
        onCheck={(name, v) => {
          onDirty();
          setChecked({ ...checked, [name]: v });
        }}
        api={api}
        disabled={busy}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      <Button
        title={t('Save this medicine review')}
        disabled={busy}
        onPress={() => {
          try {
            const body = reviewBody(line, value, checked);
            setError('');
            save(body);
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      />
      <Button
        title={t('Reject this medicine line')}
        disabled={busy}
        onPress={reject}
      />
    </View>
  );
}
export function Prescriptions({
  report,
  revision,
  onViewChange,
  onBackChange,
}: {
  report(e: unknown): void;
  revision: number;
  onViewChange(): void;
  onBackChange(handler: (() => boolean) | null): void;
}) {
  const { t } = useLanguage();
  const { client } = useSession();
  const api: Request = useCallback(
    <T,>(path: string, method = 'GET', body?: unknown) =>
      client.request<Result<T>>(path, method, body),
    [client],
  );
  const r = usePrescriptions(api, report, revision);
  const [lines, setLines] = useState<Inputs[]>([blank()]),
    [date, setDate] = useState(''),
    [until, setUntil] = useState('');
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const rx = r.detail;
  const hasEdits = !!rx?.medications.some(
    (line) => dirty[line.fields.map((f) => f.id).join(':')],
  );
  const viewKey = r.creating ? 'new' : (rx?.id ?? 'list');
  useEffect(() => {
    onViewChange();
  }, [viewKey, onViewChange]);
  const backToList = useCallback(() => {
    if (r.busy) return true;
    if (!rx && !r.creating) return false;
    if (r.creating || hasEdits) {
      Alert.alert(
        t('Leave unsaved changes?'),
        t('Unsaved entries will be lost.'),
        [
          { text: t('Keep editing'), style: 'cancel' },
          { text: t('Leave'), onPress: r.list },
        ],
      );
    } else r.list();
    return true;
  }, [r.busy, r.creating, r.list, rx, hasEdits]);
  useEffect(() => {
    onBackChange(backToList);
    return () => onBackChange(null);
  }, [backToList, onBackChange]);
  const editable = rx?.status === 'DRAFT' && !r.blocked;
  const confirm = (
    title: string,
    message: string,
    body: unknown,
    method = 'PATCH',
  ) =>
    Alert.alert(title, message, [
      { text: t('Cancel'), style: 'cancel' },
      { text: t('Confirm'), onPress: () => void r.mutate(body, method) },
    ]);
  async function attach() {
    if (!rx) return;
    try {
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        quality: 1,
        exif: false,
      });
      if (picked.canceled) return;
      const file = picked.assets[0];
      if (!file) return;
      const mime =
        file.mimeType ??
        (/\.png$/i.test(file.uri)
          ? 'image/png'
          : /\.jpe?g$/i.test(file.uri)
            ? 'image/jpeg'
            : '');
      const problem = uploadError(mime, file.fileSize ?? 0);
      if (problem) {
        r.setError(problem);
        return;
      }
      if (file.width * file.height > 20000000) {
        r.setError('Choose an image with no more than 20 million pixels.');
        return;
      }
      const form = new FormData();
      form.append('file', {
        uri: file.uri,
        type: mime,
        name: mime === 'image/png' ? 'prescription.png' : 'prescription.jpg',
      } as unknown as Blob);
      form.append('pageNumber', String(nextPage(rx)));
      await r.upload(form);
    } catch {
      r.setError(
        'The image could not be selected. Try a JPEG or PNG from your library.',
      );
    }
  }
  return (
    <View style={s.stack}>
      {!!r.error && (
        <Text accessibilityRole="alert" style={s.error}>
          {t(r.error)}
        </Text>
      )}
      {!!r.notice && (
        <Text accessibilityLiveRegion="polite" style={s.muted}>
          {t(r.notice)}
        </Text>
      )}
      {(rx || r.creating) && (
        <Button
          title={t('Back to prescriptions')}
          disabled={r.busy}
          onPress={backToList}
        />
      )}
      {!rx && !r.creating && (
        <>
          <Text style={s.muted}>
            {t(
              'Save prescription details, attach images, and review what you entered.',
            )}
          </Text>
          <Button
            title={t('New prescription')}
            disabled={r.busy}
            onPress={() => {
              setLines([blank()]);
              setDate('');
              setUntil('');
              r.setError('');
              r.setCreating(true);
            }}
          />
          <View style={s.filters}>
            {['', 'DRAFT', 'CONFIRMED', 'ARCHIVED'].map((status) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: r.filter === status }}
                key={status}
                disabled={r.busy}
                style={[
                  s.chip,
                  r.filter === status && { backgroundColor: '#DDF4F1' },
                ]}
                onPress={() => {
                  r.setPage(1);
                  r.setFilter(status);
                }}
              >
                <Text>{t(status || 'Current')}</Text>
              </Pressable>
            ))}
          </View>
          {r.rows.map((row) => (
            <Pressable
              accessibilityRole="button"
              key={row.id}
              style={s.card}
              disabled={r.busy}
              onPress={() => void r.open(row.id)}
            >
              <Text style={s.heading}>
                {t('Prescription ·')}{' '}
                {row.prescriptionDate ?? row.createdAt.slice(0, 10)}
              </Text>
              <Text style={s.badge}>{t(row.status)}</Text>
              <Text style={s.muted}>
                {row.medicationCount} {t('medicine lines')}
              </Text>
            </Pressable>
          ))}
          {r.loading && (
            <Text style={s.muted}>{t('Loading prescriptions…')}</Text>
          )}
          {!r.loading && !r.rows.length && !r.error && (
            <Text style={s.muted}>
              {t('No prescriptions yet. Create a manual draft to get started.')}
            </Text>
          )}
          <View style={s.row}>
            <Button
              title={t('Previous')}
              disabled={r.page <= 1 || r.busy}
              onPress={() => r.setPage(r.page - 1)}
            />
            <Text>
              {r.page} / {Math.max(1, r.pages)}
            </Text>
            <Button
              title={t('Next')}
              disabled={r.page >= r.pages || r.busy}
              onPress={() => r.setPage(r.page + 1)}
            />
          </View>
        </>
      )}
      {r.creating && (
        <>
          <Text style={s.heading}>{t('New prescription')}</Text>
          <PrescriptionScan
            disabled={r.busy || r.blocked}
            report={report}
            onApply={(preview) => {
              setLines(preview.medications);
              setDate(preview.prescriptionDate);
              setUntil(preview.validUntil);
            }}
          />
          <Text style={s.muted}>
            {t(
              'Review or enter the prescription details below. Unknown values stay blank. Saving creates a draft, never a confirmed treatment.',
            )}
          </Text>
          <DateTimeField
            label={t('Prescription date (optional)')}
            value={date}
            onChange={setDate}
            disabled={r.busy || r.blocked}
          />
          <DateTimeField
            label={t('Valid until (optional)')}
            value={until}
            onChange={setUntil}
            disabled={r.busy || r.blocked}
          />
          {lines.map((line, index) => (
            <View style={s.card} key={index}>
              <Text style={s.heading}>
                {t('Medicine')} {index + 1}
              </Text>
              <Editor
                value={line}
                onChange={(v) =>
                  setLines(lines.map((old, i) => (i === index ? v : old)))
                }
                api={api}
                disabled={r.busy || r.blocked}
              />
              {lines.length > 1 && (
                <Button
                  title={t('Remove medicine {number}', { number: index + 1 })}
                  disabled={r.busy || r.blocked}
                  onPress={() => setLines(lines.filter((_, i) => i !== index))}
                />
              )}
            </View>
          ))}
          <Button
            title={t('Add another medicine')}
            disabled={r.busy || r.blocked || lines.length >= 20}
            onPress={() => setLines([...lines, blank()])}
          />
          <Button
            title={t('Save draft')}
            disabled={r.busy || r.blocked}
            onPress={() => {
              try {
                const body = createBody(lines, date, until);
                void r.create(body);
              } catch (e) {
                r.setError((e as Error).message);
              }
            }}
          />
        </>
      )}
      {rx && (
        <>
          <View style={s.card}>
            <Text style={s.heading}>
              {t('Prescription ·')}
              {rx.prescriptionDate ?? rx.createdAt.slice(0, 10)}
            </Text>
            <Text style={s.badge}>{t(rx.status)}</Text>
            <Text style={s.muted}>
              {t('Valid until:')}
              {rx.validUntil ?? t('Not recorded')}
            </Text>
            <Button
              title={t('Reload prescription')}
              disabled={r.busy}
              onPress={() =>
                Alert.alert(
                  t('Reload saved values?'),
                  t('Unsaved edits will be discarded.'),
                  [
                    { text: t('Cancel'), style: 'cancel' },
                    {
                      text: 'Reload',
                      onPress: () =>
                        void r.open(rx.id).then(() => setDirty({})),
                    },
                  ],
                )
              }
            />
          </View>
          <View style={s.card}>
            <Text style={s.heading}>{t('Original images')}</Text>
            <Text style={s.muted}>
              {t(
                'JPEG or PNG, up to 5 MiB and 20 million pixels per page. No text extraction. Original images may include location metadata; remove unwanted metadata before selecting a file.',
              )}
            </Text>
            {rx.documents.map((d) => (
              <Button
                key={d.id}
                title={t('Open page {number}', { number: d.pageNumber })}
                disabled={r.busy}
                onPress={() =>
                  void r.run(async () => {
                    const result = await api<{ url: string }>(
                      `/me/prescriptions/${rx.id}/documents/${d.id}/download`,
                    );
                    const url = new URL(result.data.url);
                    if (!['https:', 'http:'].includes(url.protocol))
                      throw new Error('Invalid document link.');
                    await Linking.openURL(url.href);
                  })
                }
              />
            ))}
            {!rx.documents.length && (
              <Text style={s.muted}>{t('No images attached.')}</Text>
            )}
            {editable && rx.documents.length < 20 && (
              <Button
                title={t('Attach image page {number}', {
                  number: nextPage(rx),
                })}
                disabled={r.busy}
                onPress={() => void attach()}
              />
            )}
          </View>
          {rx.medications.map((line) => (
            <LineReview
              key={`${line.id}:${line.fields.map((f) => f.id).join(':')}:${r.blocked}`}
              onDirty={() =>
                setDirty((previous) => ({
                  ...previous,
                  [line.fields.map((f) => f.id).join(':')]: true,
                }))
              }
              line={line}
              editable={!!editable && line.confirmationStatus !== 'REJECTED'}
              api={api}
              busy={r.busy}
              save={(body) => void r.mutate(body)}
              reject={() =>
                confirm(
                  t('Reject this medicine?'),
                  t(
                    'It remains in history and cannot be restored through this workflow.',
                  ),
                  { rejectedMedicationIds: [line.id] },
                )
              }
            />
          ))}
          {editable && (
            <View style={s.card}>
              <Text style={s.heading}>
                {t('Confirm reviewed prescription')}
              </Text>
              <Text style={s.muted}>
                {t(
                  'This confirms your entered information. It is not professional verification and does not create or activate a treatment.',
                )}
              </Text>
              {hasEdits && (
                <Text style={s.muted}>
                  {t('Save your edited medicine reviews before confirming.')}
                </Text>
              )}
              {!!confirmationProblem(rx) && (
                <Text style={s.muted}>{confirmationProblem(rx)}</Text>
              )}
              <Button
                title={t('Confirm prescription')}
                disabled={r.busy || hasEdits || !!confirmationProblem(rx)}
                onPress={() =>
                  confirm(
                    t('Confirm prescription?'),
                    t(
                      'The saved review will be finalized and cannot be edited. No treatment is started.',
                    ),
                    confirmationBody(rx),
                  )
                }
              />
            </View>
          )}
          {rx.status !== 'ARCHIVED' && (
            <Button
              title={t('Archive prescription')}
              disabled={r.busy || r.blocked}
              onPress={() =>
                confirm(
                  t('Archive prescription?'),
                  t(
                    'Documents and history are preserved. Restoring is not available.',
                  ),
                  {},
                  'DELETE',
                )
              }
            />
          )}
        </>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  stack: { gap: 12 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E4EAE8',
    borderRadius: 18,
    padding: 18,
    gap: 16,
  },
  heading: { fontSize: 19, fontWeight: '600', color: '#172321' },
  label: { fontSize: 14, fontWeight: '600', color: '#172321' },
  muted: { fontSize: 14, lineHeight: 22, color: '#667371' },
  input: {
    borderWidth: 1,
    borderColor: '#E4EAE8',
    borderRadius: 10,
    padding: 13,
    fontSize: 16,
    color: '#172321',
    backgroundColor: '#fff',
    minHeight: 48,
  },
  button: {
    backgroundColor: '#DDF4F1',
    padding: 14,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  buttonText: { color: '#087F7B', fontWeight: '600', textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    padding: 12,
    borderRadius: 20,
    minHeight: 44,
    backgroundColor: '#fff',
  },
  badge: { color: '#087F7B', fontWeight: '600' },
  field: {
    gap: 10,
    borderBottomWidth: 1,
    borderColor: '#E4EAE8',
    paddingBottom: 16,
  },
  error: {
    color: '#8C2926',
    backgroundColor: '#FCEDEC',
    padding: 14,
    borderRadius: 10,
  },
});
