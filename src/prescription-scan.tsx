import { AppText as Text, useLanguage } from './language';
import { PrescriptionCrop, type CropSource } from './prescription-crop';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useSession } from './session';
import { scanPreview, scanUpload, type ScanPreview } from './scan-preview';
import { fields } from './prescription-model';
export function PrescriptionScan({
  disabled,
  onApply,
  report,
  mode = 'prescription',
}: {
  mode?: 'prescription' | 'box';
  disabled: boolean;
  onApply(preview: ScanPreview): void;
  report(error: unknown): void;
}) {
  const { t } = useLanguage();
  const { client } = useSession();
  const [cropSource, setCropSource] = useState<CropSource | null>(null);
  const [consent, setConsent] = useState(false);
  const [image, setImage] = useState<{ uri: string; mimeType: string } | null>(
      null,
    ),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [privacy, setPrivacy] = useState(false),
    [reviewed, setReviewed] = useState(false),
    [preview, setPreview] = useState<ScanPreview | null>(null),
    [enabled, setEnabled] = useState(false),
    [checking, setChecking] = useState(true),
    [refresh, setRefresh] = useState(0);
  const mounted = useRef(true),
    lock = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    void client
      .request<{
        data: {
          enabled: boolean;
          provider: string;
          requiresCroppedImage: boolean;
        };
      }>('/me/prescription-scan/capabilities')
      .then((r) => {
        if (active)
          setEnabled(
            r.data.enabled === true &&
              r.data.provider === 'OpenAI' &&
              r.data.requiresCroppedImage === true,
          );
      })
      .catch((e) => {
        if (active) {
          setEnabled(false);
          if (e?.status === 401) report(e);
        }
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
    };
  }, [client, refresh, report]);
  async function choose(camera: boolean) {
    if (lock.current || disabled) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      if (Platform.OS === 'web')
        throw new Error('Use the native app to crop prescription images.');
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          if (mounted.current)
            setError(
              t(
                'Camera access is needed. Enable it in phone settings or choose an image instead.',
              ),
            );
          return;
        }
      }
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsMultipleSelection: false,
        allowsEditing: false,
        quality: 1,
        exif: false,
      };
      const result = camera
        ? await ImagePicker.launchCameraAsync(options)
        : await ImagePicker.launchImageLibraryAsync(options);
      if (!mounted.current || result.canceled) return;
      const asset = result.assets[0];
      if (!asset) return;
      if (!asset.uri.startsWith('file://') || !asset.width || !asset.height)
        throw new Error('Choose a local image that can be cropped.');
      setCropSource({
        uri: asset.uri,
        width: asset.width,
        height: asset.height,
      });
      setPrivacy(false);
      setConsent(false);
      setReviewed(false);
      setPreview(null);
    } catch (e) {
      if (mounted.current)
        setError(e instanceof Error ? e.message : t('Unable to open image.'));
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  async function extract() {
    if (lock.current || disabled || !image || !privacy || !consent || !enabled)
      return;
    lock.current = true;
    setBusy(true);
    setError('');
    setPreview(null);
    setReviewed(false);
    try {
      const r = await client.request<{ data: unknown }>(
        mode === 'box' ? '/me/prescription-scan/box' : '/me/prescription-scan',
        'POST',
        scanUpload(image, privacy, consent),
      );
      if (mounted.current) {
        const next = scanPreview(r.data);
        setPreview(next);
        if (!next.medications.length)
          setError(
            t(
              'No readable medicine lines found. Try a tighter, clearer crop or enter details manually.',
            ),
          );
      }
    } catch (e) {
      if (mounted.current) {
        const code = (e as { code?: string })?.code;
        if ((e as { status?: number })?.status === 401) report(e);
        setError(
          code === 'PRESCRIPTION_SCAN_NOT_CONFIGURED'
            ? t('Your server has not configured OpenAI extraction yet.')
            : code === 'RATE_LIMITED'
              ? t('Scan limit reached. Wait before trying again.')
              : t(
                  'Extraction could not be completed. Try a clearer crop or enter details manually.',
                ),
        );
      }
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  const action = (title: string, fn: () => void, blocked = false) => (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy || blocked }}
      disabled={disabled || busy || blocked}
      onPress={fn}
      style={[s.button, (disabled || busy || blocked) && { opacity: 0.45 }]}
    >
      <Text style={s.buttonText}>{title}</Text>
    </Pressable>
  );
  return (
    <View style={s.card}>
      {cropSource && (
        <PrescriptionCrop
          source={cropSource}
          onCancel={() => setCropSource(null)}
          onDone={(cropped) => {
            setImage(cropped);
            setCropSource(null);
            setPrivacy(false);
            setConsent(false);
            setReviewed(false);
            setPreview(null);
          }}
        />
      )}
      <View style={s.row}>
        <Ionicons name="scan-outline" size={30} color="#087F7B" />
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={s.title}>
            {mode === 'box'
              ? t('Scan a medicine box')
              : t('Scan your prescription')}
          </Text>
          <Text style={s.text}>
            {t('1. Crop to medicines · 2. Check privacy · 3. Extract')}
          </Text>
        </View>
      </View>
      <Text style={s.text}>
        {t(
          'In the crop editor, keep only medicine information. Exclude names, birth dates, addresses, identifiers, barcodes and patient/doctor headers. If identifying text overlaps a medicine, use manual entry instead.',
        )}
      </Text>
      <View style={s.row}>
        {action(t('Take photo'), () => void choose(true))}
        {action(t('Choose image'), () => void choose(false))}
      </View>
      {checking ? (
        <Text style={s.text}>{t('Checking extraction availability…')}</Text>
      ) : (
        !enabled && (
          <>
            <Text style={s.text}>
              {t(
                'Automatic extraction is currently unavailable. You can enter your medicines manually. No image has been sent.',
              )}
            </Text>
            {action(t('Check again'), () => {
              setChecking(true);
              setRefresh((n) => n + 1);
            })}
          </>
        )
      )}
      {image && (
        <>
          <Image
            source={{ uri: image.uri }}
            accessibilityLabel={t(
              'Cropped medicines image — review for patient information',
            )}
            resizeMode="contain"
            style={s.preview}
          />
          <Text style={s.text}>
            {t(
              'Only this crop will be sent through your API to OpenAI. Image metadata is removed on the server. Check the visible text carefully: cropping does not automatically detect or erase personal information.',
            )}
          </Text>
          <View style={s.row}>
            <Text style={[s.text, { flex: 1 }]}>
              {t(
                'I checked this crop: only medicine information is visible, with no patient details.',
              )}
            </Text>
            <Switch
              accessibilityLabel={t(
                'Confirm crop contains no patient information',
              )}
              value={privacy}
              disabled={busy || disabled}
              onValueChange={setPrivacy}
              trackColor={{ true: '#087F7B' }}
            />
          </View>
          <View style={s.row}>
            <Text style={[s.text, { flex: 1 }]}>
              {t(
                'I agree to send only this medicines crop to the Saydaliyati server and OpenAI for processing.',
              )}
            </Text>
            <Switch
              accessibilityLabel={t('Agree to server and OpenAI processing')}
              value={consent}
              disabled={busy || disabled}
              onValueChange={setConsent}
              trackColor={{ true: '#087F7B' }}
            />
          </View>
          {action(
            t('Send medicines crop to OpenAI'),
            () => void extract(),
            !privacy || !consent || !enabled,
          )}
          {action(t('Remove crop'), () => {
            setImage(null);
            setPrivacy(false);
            setConsent(false);
            setPreview(null);
            setReviewed(false);
          })}
        </>
      )}
      {busy && (
        <ActivityIndicator
          accessibilityLabel={t('Processing medicines crop')}
          color="#087F7B"
        />
      )}
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      {preview && preview.medications.length > 0 && (
        <>
          <Text style={s.title}>{t('Review extracted suggestions')}</Text>
          <Text style={s.text}>
            {t(
              'Compare these with the crop. Unknown values stay blank. Catalog links, doses and schedules are never confirmed automatically.',
            )}
          </Text>
          {preview.warnings.map((warning, i) => (
            <Text key={i} style={s.error}>
              {warning}
            </Text>
          ))}
          {preview.medications.map((line, i) => (
            <View key={i} style={s.suggestion}>
              <Text style={s.title}>
                {t('Medicine')} {i + 1}
              </Text>
              {fields
                .filter((f) =>
                  mode === 'box'
                    ? ['extractedName', 'strength'].includes(f.name)
                    : f.name !== 'medicineId',
                )
                .map((f) => (
                  <Text key={f.name} style={s.text}>
                    {t(f.label)}: {line[f.name] || t('Unknown')}
                  </Text>
                ))}
            </View>
          ))}
          {preview.packageInfo && (
            <Text style={s.text}>
              {t('Pack quantity:')}
              {preview.packageInfo.quantity || t('Unknown')}{' '}
              {preview.packageInfo.unit}
              {t('Expiry:')}
              {preview.packageInfo.expiryDate || t('Unknown')}
              {t(
                'Check the quantity you actually have; a box count is not remaining stock.',
              )}
            </Text>
          )}
          <View style={s.row}>
            <Text style={[s.text, { flex: 1 }]}>
              {t(
                'I reviewed the suggestions. Use them to replace this draft’s current entries.',
              )}
            </Text>
            <Switch
              accessibilityLabel={t('Accept extracted suggestions for editing')}
              value={reviewed}
              disabled={busy || disabled}
              onValueChange={setReviewed}
              trackColor={{ true: '#087F7B' }}
            />
          </View>
          {action(
            t('Use suggestions in the form'),
            () => {
              onApply(preview);
              setPreview(null);
              setReviewed(false);
            },
            !reviewed,
          )}
        </>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  card: { padding: 20, gap: 16, backgroundColor: '#E4F3EF', borderRadius: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 19, fontWeight: '700', color: '#172321' },
  text: { fontSize: 14, lineHeight: 21, color: '#667371' },
  button: {
    flexGrow: 1,
    flexShrink: 1,
    padding: 14,
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: '#087F7B',
  },
  buttonText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  preview: {
    width: '100%',
    height: 340,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  suggestion: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  error: { color: '#8C2926', lineHeight: 21 },
});
