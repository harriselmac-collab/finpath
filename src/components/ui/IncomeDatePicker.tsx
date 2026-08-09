import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { Ionicons } from '@expo/vector-icons';

import AppText from '../Text/AppText';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

type Props = {
  value: string;
  locale: string;
  label: string;
  onChange: (value: string) => void;
};

const toDate = (value: string) => {
  const date = value ? new Date(`${value}T12:00:00`) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const toIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function IncomeDatePicker({ value, locale, label, onChange }: Props) {
  const [visible, setVisible] = useState(false);
  const selectedDate = toDate(value);
  const formattedDate = value
    ? new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }).format(selectedDate)
    : label;

  if (Platform.OS === 'web') {
    return React.createElement('input', {
      type: 'date',
      value,
      min: toIsoDate(new Date()),
      'aria-label': label,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value),
      style: webStyle,
    });
  }

  return (
    <View>
      <Pressable
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}. ${value ? formattedDate : ''}`}
      >
        <Ionicons name="calendar-outline" size={22} color={COLORS.surfaceTint} />
        <AppText variant="bodyMedium" style={[styles.label, !value && styles.placeholder]}>{formattedDate}</AppText>
        <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
      </Pressable>
      {visible ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
          presentation={Platform.OS === 'android' ? 'dialog' : 'inline'}
          minimumDate={new Date()}
          locale={locale.replace('-', '_')}
          accentColor={COLORS.surfaceTint}
          onValueChange={(_, date) => {
            onChange(toIsoDate(date));
            if (Platform.OS === 'android') setVisible(false);
          }}
          onDismiss={() => setVisible(false)}
        />
      ) : null}
    </View>
  );
}

const webStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 52,
  padding: '0 16px',
  borderRadius: 12,
  border: `1px solid ${COLORS.outlineVariant}`,
  background: COLORS.surfaceContainerLowest,
  color: COLORS.textPrimary,
  font: 'inherit',
};

const styles = StyleSheet.create({
  trigger: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  pressed: { opacity: 0.78 },
  label: { flex: 1, color: COLORS.textPrimary },
  placeholder: { color: COLORS.textSecondary },
});
