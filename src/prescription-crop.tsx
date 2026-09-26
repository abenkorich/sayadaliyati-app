import { AppText as Text, useLanguage } from './language';
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import {
  cropPixels,
  scanImageSize,
  moveCorner,
  resizeCrop,
  suggestedCrop,
  type Crop,
  type CropCorner,
} from './crop';
export type CropSource = { uri: string; width: number; height: number };
const handleSize = 48;
const gutter = handleSize / 2;
const corners: CropCorner[] = [
  'topLeft',
  'topRight',
  'bottomLeft',
  'bottomRight',
];
const cornerLabels: Record<CropCorner, string> = {
  topLeft: 'Top left crop handle',
  topRight: 'Top right crop handle',
  bottomLeft: 'Bottom left crop handle',
  bottomRight: 'Bottom right crop handle',
};
function CropHandle({
  crop,
  corner,
  width,
  height,
  busy,
  onChange,
  onDragging,
}: {
  crop: Crop;
  corner: CropCorner;
  width: number;
  height: number;
  busy: boolean;
  onChange(crop: Crop): void;
  onDragging(value: boolean): void;
}) {
  const { t } = useLanguage();
  const latest = useRef({
    crop,
    corner,
    width,
    height,
    busy,
    onChange,
    onDragging,
  });
  useLayoutEffect(() => {
    latest.current = {
      crop,
      corner,
      width,
      height,
      busy,
      onChange,
      onDragging,
    };
  }, [crop, corner, width, height, busy, onChange, onDragging]);
  const start = useRef({ crop, width, height });
  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !latest.current.busy,
        onMoveShouldSetPanResponder: () => !latest.current.busy,
        onPanResponderGrant: () => {
          const value = latest.current;
          start.current = {
            crop: value.crop,
            width: value.width,
            height: value.height,
          };
          value.onDragging(true);
        },
        onPanResponderMove: (_, gesture) => {
          const value = latest.current;
          if (value.busy || gesture.numberActiveTouches !== 1) return;
          value.onChange(
            resizeCrop(
              start.current.crop,
              value.corner,
              gesture.dx / start.current.width,
              gesture.dy / start.current.height,
            ),
          );
        },
        onPanResponderRelease: () => latest.current.onDragging(false),
        onPanResponderTerminate: () => latest.current.onDragging(false),
        onPanResponderTerminationRequest: () => false,
        onShouldBlockNativeResponder: () => true,
      }),
    [],
  );
  const left = corner === 'topLeft' || corner === 'bottomLeft';
  const top = corner === 'topLeft' || corner === 'topRight';
  return (
    <View
      {...pan.panHandlers}
      accessible
      accessibilityLabel={t(cornerLabels[corner])}
      style={[
        s.handle,
        {
          left:
            gutter + (left ? crop.left : crop.right) * width - handleSize / 2,
          top:
            gutter + (top ? crop.top : crop.bottom) * height - handleSize / 2,
        },
      ]}
    >
      <View pointerEvents="none" style={s.dot} />
    </View>
  );
}
export function PrescriptionCrop({
  source,
  embedded = false,
  onCancel,
  onDone,
}: {
  source: CropSource;
  embedded?: boolean;
  onCancel(): void;
  onDone(image: { uri: string; mimeType: string }): void;
}) {
  const { t } = useLanguage();
  const window = useWindowDimensions();
  const [availableWidth, setAvailableWidth] = useState(window.width - 48);
  const [dragging, setDragging] = useState(false);
  const scale = Math.min(
    Math.max(1, availableWidth - gutter * 2) / source.width,
    (window.height * 0.46) / source.height,
  );
  const width = source.width * scale,
    height = source.height * scale;
  const [crop, setCrop] = useState<Crop>(suggestedCrop),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const mounted = useRef(true),
    lock = useRef(false);
  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function apply() {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError('');
    try {
      const context = ImageManipulator.manipulate(source.uri);
      const pixels = cropPixels(crop, source.width, source.height);
      context.crop(pixels);
      context.resize(scanImageSize(pixels.width, pixels.height));
      const rendered = await context.renderAsync();
      const saved = await rendered.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.85,
      });
      if (mounted.current) onDone({ uri: saved.uri, mimeType: 'image/jpeg' });
    } catch {
      if (mounted.current)
        setError(
          t(
            'The crop could not be created. Adjust the selection or choose another photo.',
          ),
        );
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  const content = (
    <SafeAreaView style={s.screen}>
      <ScrollView scrollEnabled={!dragging} contentContainerStyle={s.content}>
        <Text style={s.title}>{t('Select medicines only')}</Text>
        <Text style={s.text}>
          {t(
            'The starting box is a suggested area, not automatic detection. Drag its corners or adjust the edges below. Exclude every name, address, ID, barcode and patient detail.',
          )}
        </Text>
        <View
          onLayout={(event) =>
            setAvailableWidth(event.nativeEvent.layout.width)
          }
          style={{ alignItems: 'center' }}
        >
          <View
            style={{ width: width + gutter * 2, height: height + gutter * 2 }}
          >
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                left: gutter,
                top: gutter,
                width,
                height,
              }}
            >
              <Image
                source={{ uri: source.uri }}
                style={{ width, height }}
                resizeMode="contain"
              />
              <View
                pointerEvents="none"
                style={[
                  s.mask,
                  { left: 0, top: 0, width, height: crop.top * height },
                ]}
              />
              <View
                pointerEvents="none"
                style={[
                  s.mask,
                  {
                    left: 0,
                    top: crop.bottom * height,
                    width,
                    height: (1 - crop.bottom) * height,
                  },
                ]}
              />
              <View
                pointerEvents="none"
                style={[
                  s.mask,
                  {
                    left: 0,
                    top: crop.top * height,
                    width: crop.left * width,
                    height: (crop.bottom - crop.top) * height,
                  },
                ]}
              />
              <View
                pointerEvents="none"
                style={[
                  s.mask,
                  {
                    left: crop.right * width,
                    top: crop.top * height,
                    width: (1 - crop.right) * width,
                    height: (crop.bottom - crop.top) * height,
                  },
                ]}
              />
              <View
                pointerEvents="none"
                style={[
                  s.selection,
                  {
                    left: crop.left * width,
                    top: crop.top * height,
                    width: (crop.right - crop.left) * width,
                    height: (crop.bottom - crop.top) * height,
                  },
                ]}
              />
            </View>
            {corners.map((corner) => (
              <CropHandle
                key={corner}
                crop={crop}
                corner={corner}
                width={width}
                height={height}
                busy={busy}
                onChange={setCrop}
                onDragging={setDragging}
              />
            ))}
          </View>
        </View>
        <Text style={s.text}>
          {t(
            'Only the selected area will appear in the next preview. Nothing is uploaded yet.',
          )}
        </Text>
        {(['top', 'bottom', 'left', 'right'] as const).map((edge) => (
          <View key={edge} style={s.row}>
            <Text style={[s.text, { flex: 1, textTransform: 'capitalize' }]}>
              {edge} {t('edge')}
            </Text>
            {[-1, 1].map((direction) => (
              <Pressable
                key={direction}
                accessibilityRole="button"
                accessibilityLabel={`Move ${edge} ${edge === 'top' || edge === 'bottom' ? (direction < 0 ? 'up' : 'down') : direction < 0 ? 'left' : 'right'}`}
                disabled={busy}
                style={s.smallButton}
                onPress={() =>
                  setCrop(
                    moveCorner(
                      crop,
                      edge === 'top' || edge === 'left' ? 'start' : 'end',
                      edge === 'left' || edge === 'right'
                        ? direction * 0.02
                        : 0,
                      edge === 'top' || edge === 'bottom'
                        ? direction * 0.02
                        : 0,
                    ),
                  )
                }
              >
                <Text>{direction < 0 ? '−' : '+'}</Text>
              </Pressable>
            ))}
          </View>
        ))}
        {!!error && (
          <Text accessibilityRole="alert" style={{ color: '#8C2926' }}>
            {error}
          </Text>
        )}
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          style={s.button}
          onPress={() => void apply()}
        >
          <Text style={s.buttonText}>
            {busy ? t('Creating crop…') : t('Continue with this crop')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          disabled={busy}
          style={s.smallButton}
          onPress={onCancel}
        >
          <Text>{t('Cancel — keep image on device')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
  return embedded ? (
    content
  ) : (
    <Modal
      visible
      animationType="slide"
      onRequestClose={() => {
        if (!busy) onCancel();
      }}
    >
      {content}
    </Modal>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F8FAF9' },
  content: { padding: 24, gap: 16 },
  title: { fontSize: 24, fontWeight: '700', color: '#172321' },
  text: { fontSize: 14, lineHeight: 22, color: '#667371' },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  mask: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.6)' },
  selection: { position: 'absolute', borderWidth: 2, borderColor: '#19D8BC' },
  handle: {
    position: 'absolute',
    width: handleSize,
    height: handleSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#087F7B',
    borderWidth: 3,
    borderColor: '#fff',
  },
  button: {
    backgroundColor: '#087F7B',
    borderRadius: 12,
    padding: 18,
    minHeight: 48,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600' },
  smallButton: {
    backgroundColor: '#DDF4F1',
    padding: 14,
    borderRadius: 12,
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
  },
});
