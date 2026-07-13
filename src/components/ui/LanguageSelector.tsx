import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export interface LanguageOption {
  key: string;
  label: string;
  shortLabel: string;
  flag: string;
}

const LANGUAGES: LanguageOption[] = [
  { key: 'en', label: 'English', shortLabel: 'EN', flag: '🇺🇸' },
  { key: 'fr', label: 'Français', shortLabel: 'FR', flag: '🇫🇷' },
  { key: 'ar', label: 'العربية', shortLabel: 'AR', flag: '🇲🇦' },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
  disabled?: boolean;
  style?: any;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onSelectLanguage,
  disabled = false,
  style,
}) => {
  const currentLang = (selectedLanguage || 'en').substring(0, 2).toLowerCase();

  return (
    <View style={[styles.container, style]}>
      {LANGUAGES.map((lang) => {
        const isSelected = lang.key === currentLang;
        return (
          <TouchableOpacity
            key={lang.key}
            onPress={() => !disabled && onSelectLanguage(lang.key)}
            disabled={disabled}
            activeOpacity={isSelected ? 1 : 0.7}
            style={[
              styles.optionBtn,
              isSelected && styles.optionBtnSelected,
              disabled && styles.disabledBtn,
            ]}
          >
            <Text style={styles.flagText}>{lang.flag}</Text>
            <Text style={[styles.labelStyle, isSelected && styles.labelStyleSelected]}>
              {lang.shortLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLow,
    gap: 4,
  },
  optionBtnSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.secondaryContainer,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  flagText: {
    fontSize: 14,
  },
  labelStyle: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  labelStyleSelected: {
    color: COLORS.onSecondaryContainer,
  },
});

export { LANGUAGES };
export default LanguageSelector;
