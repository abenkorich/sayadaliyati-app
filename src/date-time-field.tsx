import React, { useState } from 'react';
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AppText as Text, useLanguage } from './language';
import { dateValue, parseDate, parseTime, timeValue } from './date-time';

export function DateTimeField({
  label,
  value,
  onChange,
  disabled = false,
  mode = 'date',
}: {
  label: string;
  value: string;
  onChange(value: string): void;
  disabled?: boolean;
  mode?: 'date' | 'time';
}) {
  const { t, language, isRTL } = useLanguage();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(new Date());
  const parsed = mode === 'date' ? parseDate(value) : parseTime(value);
  const save = (date: Date) => {
    onChange(mode === 'date' ? dateValue(date) : timeValue(date));
    setOpen(false);
  };
  return (
    <View style={s.stack}>
      <Text style={s.label}>{label}</Text>
      <View style={s.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ disabled }}
          disabled={disabled}
          style={[s.input, disabled && { opacity: 0.5 }]}
          onPress={() => {
            Keyboard.dismiss();
            setDraft(parsed ?? new Date());
            setOpen(true);
          }}
        >
          <Text>
            {parsed
              ? mode === 'date'
                ? parsed.toLocaleDateString(language)
                : parsed.toLocaleTimeString(language, {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  })
              : value || t(mode === 'date' ? 'Choose date' : 'Choose time')}
          </Text>
        </Pressable>
        {!!value && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t('Clear')} ${label}`}
            disabled={disabled}
            style={s.button}
            onPress={() => onChange('')}
          >
            <Text>{t('Clear')}</Text>
          </Pressable>
        )}
      </View>
      {open && !disabled && Platform.OS === 'android' && (
        <DateTimePicker
          value={draft}
          mode={mode}
          is24Hour
          onValueChange={(_, date) => save(date)}
          onDismiss={() => setOpen(false)}
          positiveButton={{ label: t('Confirm') }}
          negativeButton={{ label: t('Cancel') }}
        />
      )}
      <Modal
        visible={open && !disabled && Platform.OS === 'ios'}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={s.overlay}>
          <SafeAreaView
            edges={['bottom']}
            style={[s.sheet, { direction: isRTL ? 'rtl' : 'ltr' }]}
          >
            <Text style={s.label}>{label}</Text>
            {Platform.OS === 'ios' && (
              <DateTimePicker
                value={draft}
                mode={mode}
                display="spinner"
                locale={language}
                themeVariant="light"
                onValueChange={(_, date) => setDraft(date)}
              />
            )}
            <View style={s.row}>
              <Pressable
                accessibilityRole="button"
                style={s.button}
                onPress={() => setOpen(false)}
              >
                <Text>{t('Cancel')}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={s.button}
                onPress={() => save(draft)}
              >
                <Text>{t('Done')}</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
export function DailyTimePicker({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange(value: string): void;
  disabled?: boolean;
}) {
  const { t } = useLanguage();
  const times = value.split(',').map((time) => time.trim());
  return (
    <View style={s.stack}>
      <Text style={s.label}>{t('Daily times')}</Text>
      {times.map((time, index) => (
        <View key={index} style={s.stack}>
          <DateTimeField
            label={t('Daily time {number}', { number: index + 1 })}
            mode="time"
            value={time}
            disabled={disabled}
            onChange={(next) =>
              onChange(
                times.map((old, i) => (i === index ? next : old)).join(','),
              )
            }
          />
          {times.length > 1 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Remove daily time {number}', {
                number: index + 1,
              })}
              disabled={disabled}
              style={s.button}
              onPress={() =>
                onChange(times.filter((_, i) => i !== index).join(','))
              }
            >
              <Text>{t('Remove')}</Text>
            </Pressable>
          )}
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        disabled={disabled || times.length >= 24 || times.some((time) => !time)}
        style={s.button}
        onPress={() => onChange([...times, ''].join(','))}
      >
        <Text>{t('Add time')}</Text>
      </Pressable>
      <Text>{t('Choose each daily dose time. Leave blank if unknown.')}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  stack: { gap: 8 },
  label: { fontWeight: '600', color: '#172321' },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E4EAE8',
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  button: {
    minHeight: 44,
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#DDF4F1',
  },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0006' },
  sheet: { backgroundColor: '#fff', padding: 20, gap: 12 },
});
