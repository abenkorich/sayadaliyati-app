import { AppText as Text, useLanguage } from './language';
import { PrescriptionCrop, type CropSource } from './prescription-crop';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Linking,
  ScrollView,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScanSettings, useScanSettings } from './scan-settings';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { useSession } from './session';
import { scanPreview, scanUpload, type ScanPreview } from './scan-preview';
import { CameraAccess } from './camera-access';
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
  const scroll = useRef<ScrollView>(null);
  const [cropSource, setCropSource] = useState<CropSource | null>(null);
  const { preferences } = useScanSettings();
  const consent = preferences?.processingConsent === true;
  const [open, setOpen] = useState(false);
  const [sourceTab, setSourceTab] = useState<'camera' | 'storage'>('camera');
  const [settings, setSettings] = useState(false);
  const [cameraDenied, setCameraDenied] = useState(false);
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
    setCameraDenied(false);
    try {
      if (Platform.OS === 'web')
        throw new Error('Use the native app to crop prescription images.');
      if (camera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          setCameraDenied(true);
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
        scroll.current?.scrollTo({ y: 0, animated: true });
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
  function close() {
    if (lock.current) return;
    setOpen(false);
    setImage(null);
    setCropSource(null);
    setPreview(null);
    setPrivacy(false);
    setReviewed(false);
    setError('');
    setSettings(false);
    setCameraDenied(false);
  }
  return (
    <View>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={() => {
          setSourceTab('camera');
          setOpen(true);
        }}
        style={[s.launch, disabled && { opacity: 0.45 }]}
      >
        <Ionicons name="camera-outline" size={21} color="#087F7B" />
        <Text style={s.launchText}>{t('Use camera')}</Text>
      </Pressable>
      <Modal visible={open} animationType="slide" onRequestClose={close}>
        <SafeAreaView style={s.screen}>
          <View style={s.header}>
            <Text style={[s.title, { flex: 1 }]}>
              {mode === 'box'
                ? t('Scan a medicine box')
                : t('Scan your prescription')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Close scan')}
              disabled={busy}
              onPress={close}
              style={s.close}
            >
              <Ionicons name="close" size={24} color="#172321" />
            </Pressable>
          </View>
          {cropSource ? (
            <PrescriptionCrop
              embedded
              source={cropSource}
              onCancel={() => setCropSource(null)}
              onDone={(cropped) => {
                setImage(cropped);
                setCropSource(null);
                setPrivacy(false);
                setReviewed(false);
                setPreview(null);
                setSettings(!preferences?.configured);
              }}
            />
          ) : (
            <ScrollView ref={scroll} contentContainerStyle={s.content}>
              {settings ? (
                <View style={{ gap: 12 }}>
                  <ScanSettings onDone={() => setSettings(false)} />
                  {action(t('Back'), () => setSettings(false))}
                </View>
              ) : (
                <>
                  {!image && (
                    <>
                      <View style={s.tabs}>
                        {(['camera', 'storage'] as const).map((tab) => (
                          <Pressable
                            key={tab}
                            accessibilityRole="tab"
                            accessibilityState={{ selected: sourceTab === tab }}
                            disabled={busy}
                            onPress={() => {
                              setSourceTab(tab);
                              setError('');
                              setCameraDenied(false);
                            }}
                            style={[s.tab, sourceTab === tab && s.activeTab]}
                          >
                            <Text
                              style={[
                                s.tabText,
                                sourceTab === tab && { color: '#087F7B' },
                              ]}
                            >
                              {tab === 'camera'
                                ? t('Camera')
                                : t('Phone storage')}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                      <View style={s.sourcePanel}>
                        <Ionicons
                          name={
                            sourceTab === 'camera'
                              ? 'camera-outline'
                              : 'images-outline'
                          }
                          size={44}
                          color="#087F7B"
                        />
                        <Text style={s.title}>
                          {sourceTab === 'camera'
                            ? t('Take a clear photo')
                            : t('Choose a photo from your phone')}
                        </Text>
                        <Text style={s.text}>
                          {t(
                            'Crop the medicine details next. Nothing is uploaded until you confirm.',
                          )}
                        </Text>
                      </View>
                      {sourceTab === 'camera' && (
                        <CameraAccess disabled={busy || disabled} />
                      )}
                      {sourceTab === 'storage' && (
                        <Text style={s.text}>
                          {t(
                            'Choose a photo using your phone’s picker. Camera permission is not needed.',
                          )}
                        </Text>
                      )}
                      {action(
                        sourceTab === 'camera'
                          ? t('Open camera')
                          : t('Choose image'),
                        () => void choose(sourceTab === 'camera'),
                      )}
                      {cameraDenied &&
                        action(
                          t('Open phone settings'),
                          () =>
                            void Linking.openSettings().catch(() =>
                              setError(
                                t(
                                  'Open your phone settings to manage camera access.',
                                ),
                              ),
                            ),
                        )}
                    </>
                  )}
                  {checking ? (
                    <Text style={s.text}>
                      {t('Checking extraction availability…')}
                    </Text>
                  ) : (
                    !enabled && (
                      <>
                        <Text style={s.text}>
                          {t(
                            'AI extraction is currently unavailable. You can still take or choose a photo and crop it, or enter medicines manually. No image has been sent.',
                          )}
                        </Text>
                        {action(t('Check again'), () => {
                          setChecking(true);
                          setRefresh((n) => n + 1);
                        })}
                      </>
                    )
                  )}
                  {image && !preview?.medications.length && (
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
                      {!consent && (
                        <Text style={s.text}>
                          {t('Allow processing in scan settings to continue.')}
                        </Text>
                      )}
                      {action(t('Scan settings'), () => setSettings(true))}
                      {action(
                        t('Extract medicine details'),
                        () => void extract(),
                        !privacy || !consent || !enabled,
                      )}
                      {action(t('Remove crop'), () => {
                        setImage(null);
                        setPrivacy(false);
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
                      <Text style={s.title}>
                        {t('Review extracted suggestions')}
                      </Text>
                      {image && (
                        <Image
                          source={{ uri: image.uri }}
                          accessibilityLabel={t(
                            'Cropped medicines image — review for patient information',
                          )}
                          resizeMode="contain"
                          style={s.preview}
                        />
                      )}

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
                          accessibilityLabel={t(
                            'Accept extracted suggestions for editing',
                          )}
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
                          close();
                        },
                        !reviewed,
                      )}
                    </>
                  )}
                </>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}
const s = StyleSheet.create({
  launch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 48,
    padding: 12,
    backgroundColor: '#E4F3EF',
    borderRadius: 12,
  },
  launchText: { color: '#087F7B', fontWeight: '700', fontSize: 15 },
  screen: { flex: 1, backgroundColor: '#F8FAF9' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 12,
  },
  close: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#E4EAE8',
    padding: 4,
    borderRadius: 14,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    padding: 12,
    justifyContent: 'center',
    borderRadius: 10,
  },
  activeTab: { backgroundColor: '#fff' },
  tabText: { textAlign: 'center', color: '#667371', fontWeight: '600' },
  sourcePanel: { paddingVertical: 32, alignItems: 'center', gap: 16 },
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
    height: 220,
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
