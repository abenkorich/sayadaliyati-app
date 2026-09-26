import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Directory, File, Paths } from 'expo-file-system';
import { AppText as Text, useLanguage } from './language';
export type ViewedImage = {
  title: string;
  mimeType?: string;
  uri?: string;
  loadUrl?: () => Promise<string>;
};
export function ImageViewer({
  image,
  onClose,
}: {
  image: ViewedImage;
  onClose(): void;
}) {
  const { t } = useLanguage();
  const [uri, setUri] = useState<string | null>(image.uri ?? null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [revision, setRevision] = useState(0);
  const lock = useRef(false);
  useEffect(() => {
    let active = true;
    let cached: File | undefined;
    setError('');
    if (image.uri) return;
    void (async () => {
      try {
        const url = new URL(await image.loadUrl!());
        if (!['https:', 'http:'].includes(url.protocol))
          throw new Error('Invalid image URL');
        cached = new File(
          Paths.cache,
          `original-${Date.now()}-${Math.random().toString(36).slice(2)}.${image.mimeType === 'image/png' ? 'png' : 'jpg'}`,
        );
        await File.downloadFileAsync(url.href, cached);
        if (active) setUri(cached.uri);
        else if (cached.exists) cached.delete();
      } catch {
        if (active) setError('Unable to open this image. Try again.');
      }
    })();
    return () => {
      active = false;
      if (cached?.exists) cached.delete();
    };
  }, [image, revision]);
  async function download() {
    if (!uri || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const directory = await Directory.pickDirectoryAsync();
      new File(uri).copy(
        new File(
          directory,
          `saydaliyati-original-${Date.now()}.${image.mimeType === 'image/png' ? 'png' : 'jpg'}`,
        ),
      );
      setSaved(true);
    } catch {
      setError('Image was not saved. Choose a folder and try again.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return (
    <Modal
      visible
      animationType="slide"
      onRequestClose={() => {
        if (!busy) onClose();
      }}
    >
      <SafeAreaView style={s.screen}>
        <View style={s.header}>
          <Text style={s.title}>{image.title}</Text>
          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={onClose}
            style={s.button}
          >
            <Text>{t('Close')}</Text>
          </Pressable>
        </View>
        {uri ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            minimumZoomScale={1}
            maximumZoomScale={4}
            centerContent
          >
            <Image
              source={{ uri }}
              resizeMode="contain"
              style={{ flex: 1, minHeight: 400, width: '100%' }}
              onError={() => setError('Unable to open this image. Try again.')}
            />
          </ScrollView>
        ) : (
          !error && <ActivityIndicator color="#087F7B" />
        )}
        {!!error && (
          <Text accessibilityRole="alert" style={s.error}>
            {t(error)}
          </Text>
        )}
        {!uri && !!error && (
          <Pressable
            accessibilityRole="button"
            onPress={() => setRevision((n) => n + 1)}
            style={s.button}
          >
            <Text>{t('Try again')}</Text>
          </Pressable>
        )}
        {saved && (
          <Text accessibilityLiveRegion="polite">
            {t('Image saved to the selected folder.')}
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          disabled={!uri || busy}
          onPress={() => void download()}
          style={[s.download, (!uri || busy) && { opacity: 0.4 }]}
        >
          <Text
            style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}
          >
            {t(busy ? 'Saving…' : 'Download image')}
          </Text>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAF9', padding: 20, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { flex: 1, fontSize: 20, fontWeight: '700' },
  button: {
    padding: 14,
    minHeight: 48,
    backgroundColor: '#E4F3EF',
    borderRadius: 12,
  },
  download: {
    padding: 16,
    minHeight: 48,
    backgroundColor: '#087F7B',
    borderRadius: 12,
  },
  error: { color: '#8C2926' },
});
