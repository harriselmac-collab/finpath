import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import {
  normalizeLanguageCode,
  SUPPORTED_LANGUAGES,
} from '../../services/localization/languages';
import { FlagIcon } from './FlagIcon';
import AppText from '../Text/AppText';

export type LanguageOption = (typeof SUPPORTED_LANGUAGES)[number];
const LANGUAGES = SUPPORTED_LANGUAGES;

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
  const currentLang = normalizeLanguageCode(selectedLanguage);

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
            accessibilityRole="radio"
            accessibilityLabel={`${lang.label}, ${lang.shortLabel}`}
            accessibilityState={{ selected: isSelected, disabled }}
            style={[
              styles.optionBtn,
              isSelected && styles.optionBtnSelected,
              disabled && styles.disabledBtn,
            ]}
          >
            <FlagIcon countryCode={lang.countryCode} size={18} />
            <AppText
              variant="labelSm"
              style={[
                styles.labelStyle,
                lang.key === 'ar' && styles.arabicLanguageText,
                isSelected && styles.labelStyleSelected,
              ]}
            >
              {lang.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    backgroundColor: COLORS.surfaceContainerLow,
    gap: 4,
  },
  optionBtnSelected: {
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondaryContainer,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  labelStyle: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  labelStyleSelected: {
    color: COLORS.onSecondaryContainer,
  },
  arabicLanguageText: {
    fontFamily: 'Cairo',
  },
});

export { LANGUAGES };
export default LanguageSelector;
