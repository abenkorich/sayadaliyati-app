import { ImageViewer, type ViewedImage } from './image-viewer';
import { originalUpload } from './original-image';
import type { OriginalImage } from './scan-preview';
import { AppText as Text, useLanguage } from './language';
import { DateTimeField, DailyTimePicker } from './date-time-field';
import { KeyboardTextInput as TextInput } from './keyboard';
import { MedicineSearch } from './medicine-search';
import { PrescriptionScan } from './prescription-scan';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { File } from 'expo-file-system';
import { useSession } from './session';
import {
  blank,
  fields,
  inputValues,
  createBody,
  reviewBody,
  overallReview,
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
  api,
  disabled,
  onOriginal,
}: {
  value: Inputs;
  onChange(value: Inputs): void;
  api: Request;
  disabled: boolean;
  onOriginal?(image: OriginalImage): void;
}) {
  const { t } = useLanguage();
  const [editing, setEditing] = useState<string | null>(null);
  const [more, setMore] = useState(false);
  const main = [
    'extractedName',
    'medicineId',
    'strength',
    'dosage',
    'dosageUnit',
    'scheduledTimes',
    'startDate',
    'endDate',
  ];
  return (
    <View style={s.stack}>
      {fields
        .filter((f) => more || main.includes(f.name) || !!value[f.name])
        .map((f) => (
          <View key={f.name} style={s.field}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t('Edit')} ${t(f.label)}`}
              disabled={disabled}
              onPress={() => setEditing(editing === f.name ? null : f.name)}
              style={[
                s.row,
                { minHeight: 48, justifyContent: 'space-between' },
              ]}
            >
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={s.label}>{t(f.label)}</Text>
                <Text style={s.muted}>
                  {f.name === 'medicineId'
                    ? value.medicineId
                      ? t('Catalog medicine linked')
                      : t('Not linked')
                    : value[f.name] || t('Not recorded')}
                </Text>
              </View>
              <Text style={{ color: '#087F7B' }}>
                {t(editing === f.name ? 'Done' : 'Edit')}
              </Text>
            </Pressable>
            {editing === f.name &&
              (f.kind === 'medicine' ? (
                <MedicinePicker
                  value={value.medicineId}
                  disabled={disabled}
                  onChange={(id) => onChange({ ...value, medicineId: id })}
                  api={api}
                />
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
              ))}
          </View>
        ))}
      <Button
        title={t(more ? 'Hide optional details' : 'Show optional details')}
        disabled={disabled}
        onPress={() => setMore(!more)}
      />
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
          if (preview.originalImage) onOriginal?.(preview.originalImage);
        }}
      />
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
  onOriginal,
}: {
  line: Medication;
  editable: boolean;
  api: Request;
  busy: boolean;
  save(body: unknown): void;
  reject(): void;
  onDirty(): void;
  onOriginal(image: OriginalImage): void;
}) {
  const { t } = useLanguage();
  const [value, setValue] = useState(() => inputValues(line));
  const [editing, setEditing] = useState(false);
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState('');
  const visible = fields.filter(
    (f) => f.name !== 'medicineId' && !!value[f.name],
  );
  return (
    <View style={s.card}>
      <Text style={s.heading}>
        {line.medicine?.name ?? value.extractedName ?? t('Medicine')}
      </Text>
      <Text style={s.badge}>{t(line.confirmationStatus)}</Text>
      {!editing ? (
        <>
          {visible.map((f) => (
            <Text key={f.name} style={s.muted}>
              {t(f.label)}: {value[f.name]}
            </Text>
          ))}
          <Text style={s.muted}>
            {t('Unlisted details are unknown. Review before approving.')}
          </Text>
          {editable && (
            <Button
              title={t('Edit medicine details')}
              disabled={busy}
              onPress={() => setEditing(true)}
            />
          )}
        </>
      ) : (
        <>
          <Editor
            value={value}
            onChange={(next) => {
              onDirty();
              setChanged(true);
              setValue(next);
            }}
            api={api}
            disabled={busy}
            onOriginal={onOriginal}
          />
          <Button
            title={t(changed ? 'Save reviewed changes' : 'Done')}
            disabled={busy}
            onPress={() => {
              if (!changed) {
                setEditing(false);
                return;
              }
              try {
                const body = reviewBody(
                  line,
                  value,
                  Object.fromEntries(fields.map((f) => [f.name, true])),
                );
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
        </>
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
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
  const [originals, setOriginals] = useState<OriginalImage[]>([]);
  const [viewedImage, setViewedImage] = useState<ViewedImage | null>(null);
  const [editingDates, setEditingDates] = useState(false);
  function keepOriginal(image: OriginalImage) {
    if (
      originals.length >= 20 &&
      !originals.some((item) => item.uri === image.uri)
    ) {
      r.setError(t('A prescription supports up to 20 original images.'));
      return;
    }
    setOriginals((previous) =>
      previous.some((item) => item.uri === image.uri)
        ? previous
        : [...previous, image],
    );
  }
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
  let approvalProblem = '';
  if (editable && rx) {
    try {
      overallReview(rx);
    } catch (e) {
      approvalProblem = (e as Error).message;
    }
  }
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
      form.append(
        'file',
        new File(file.uri),
        mime === 'image/png' ? 'prescription.png' : 'prescription.jpg',
      );
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
              setOriginals([]);
              setEditingDates(false);
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
              if (preview.originalImage) keepOriginal(preview.originalImage);
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
          <View style={s.card}>
            <Text style={s.heading}>{t('Prescription summary')}</Text>
            <Text style={s.muted}>
              {lines.length} {t('Medicines')} · {date || t('Date not recorded')}{' '}
              · {until || t('No end date')}
            </Text>
            <Button
              title={t(editingDates ? 'Done' : 'Edit dates')}
              disabled={r.busy || r.blocked}
              onPress={() => setEditingDates(!editingDates)}
            />
            {editingDates && (
              <>
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
              </>
            )}
          </View>
          {originals.length > 0 && (
            <View style={s.card}>
              <Text style={s.heading}>{t('Original images')}</Text>
              <Text style={s.muted}>
                {t(
                  'Original images will be attached privately when you save. Only the crop is sent to AI.',
                )}
              </Text>
              {originals.map((image, i) => (
                <View key={image.uri} style={s.row}>
                  <Button
                    title={t('Open page {number}', { number: i + 1 })}
                    onPress={() =>
                      setViewedImage({ ...image, title: t('Original images') })
                    }
                  />
                  <Button
                    title={t('Remove')}
                    disabled={r.busy || r.blocked}
                    onPress={() =>
                      setOriginals(
                        originals.filter((item) => item.uri !== image.uri),
                      )
                    }
                  />
                </View>
              ))}
            </View>
          )}
          {lines.map((line, index) => (
            <View style={s.card} key={index}>
              <Text style={s.heading}>
                {t('Medicine')} {index + 1}
              </Text>
              <Editor
                value={line}
                onOriginal={keepOriginal}
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
            title={t('Review and save draft')}
            disabled={r.busy || r.blocked}
            onPress={() => {
              try {
                const body = createBody(lines, date, until);
                void r.create(body, originals);
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
                  setViewedImage({
                    title: t('Open page {number}', { number: d.pageNumber }),
                    mimeType: d.mimeType,
                    loadUrl: async () => {
                      const result = await api<{ url: string }>(
                        `/me/prescriptions/${rx.id}/documents/${d.id}/download`,
                      );
                      return result.data.url;
                    },
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
              onOriginal={(image) => {
                try {
                  void r.upload(originalUpload(image, nextPage(rx)));
                } catch (e) {
                  r.setError((e as Error).message);
                }
              }}
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
              <Text style={s.heading}>{t('Overall summary')}</Text>
              {rx.medications
                .filter((line) => line.confirmationStatus !== 'REJECTED')
                .map((line) => {
                  const values = inputValues(line);
                  return (
                    <View key={line.id}>
                      <Text style={s.label}>
                        {line.medicine?.name ??
                          line.extractedName ??
                          t('Medicine')}
                      </Text>
                      <Text style={s.muted}>
                        {[
                          values.strength,
                          [values.dosage, values.dosageUnit]
                            .filter(Boolean)
                            .join(' '),
                          values.scheduledTimes,
                          [values.startDate, values.endDate]
                            .filter(Boolean)
                            .join(' → '),
                        ]
                          .filter(Boolean)
                          .join(' · ') || t('Not recorded')}
                      </Text>
                    </View>
                  );
                })}
              <Text style={s.muted}>
                {t(
                  'Approve all displayed medicine details, including unknown values. This does not start a treatment.',
                )}
              </Text>
              {hasEdits && (
                <Text style={s.muted}>
                  {t('Save your edited medicine reviews before confirming.')}
                </Text>
              )}
              {!!approvalProblem && (
                <Text style={s.error}>{t(approvalProblem)}</Text>
              )}
              <Button
                title={t('Approve all medicines')}
                disabled={r.busy || hasEdits || !!approvalProblem}
                onPress={() =>
                  Alert.alert(
                    t('Approve this prescription?'),
                    t(
                      'The reviewed summary will be finalized. No treatment is started.',
                    ),
                    [
                      { text: t('Cancel'), style: 'cancel' },
                      {
                        text: t('Approve all medicines'),
                        onPress: () => void r.approve(),
                      },
                    ],
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
      {viewedImage && (
        <ImageViewer image={viewedImage} onClose={() => setViewedImage(null)} />
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
