// src/components/Text/AppText.tsx
import React from 'react';
import { Text, TextProps, TextStyle, ViewStyle, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { TYPOGRAPHY } from '../../constants/theme';
import { getFontFamily, FontWeight } from '../../utils/typography';

type Variant = keyof typeof TYPOGRAPHY;

const VARIANT_WEIGHTS: Record<Variant, FontWeight> = {
  display: 'extrabold',
  displayLg: 'bold',
  displayLgMobile: 'bold',
  headlineMd: 'semibold',
  bodyLg: 'regular',
  bodyMd: 'regular',
  bodySemiBold: 'semibold',
  bodyMedium: 'medium',
  labelSm: 'semibold',
  amountLg: 'semibold',
  amountMd: 'semibold',
  buttonText: 'semibold',
  h1: 'bold',
  h2: 'bold',
  h3: 'semibold',
  caption: 'medium',
  arabicBody: 'regular',
  arabicBodySemiBold: 'semibold',
  arabicDisplay: 'bold',
  screenTitle: 'bold',
  sectionTitle: 'bold',
  cardTitle: 'semibold',
  body: 'regular',
  supporting: 'regular',
  button: 'semibold',
  financialAmount: 'extrabold',
  warning: 'semibold',
  legalTitle: 'bold',
  legalBody: 'regular',
  navLabel: 'medium',
  inputLabel: 'medium',
  inputValue: 'regular',
  inputFinancial: 'semibold',
};

interface Props extends TextProps {
  variant?: Variant;
  // Allow overriding specific style properties
  textStyle?: TextStyle;
  viewStyle?: ViewStyle;
  // For accessibility: allow font scaling (default true)
  adjustsFontSizeToFit?: boolean;
  minimumFontScale?: number;
}

/**
 * Centralized text component using locale-based typography.
 * Ensures consistent typography across the app.
 */
const AppText = ({
  children,
  variant = 'body',
  textStyle,
  viewStyle,
  adjustsFontSizeToFit = true,
  minimumFontScale = 0.8,
  style,
  ...textProps
}: Props) => {
  const { i18n } = useTranslation();
  const locale = i18n.language || 'en';
  const weight = VARIANT_WEIGHTS[variant] || 'regular';
  const resolvedFont = getFontFamily(locale, weight);

  const baseStyle = TYPOGRAPHY[variant] || TYPOGRAPHY.body;

  // Check if an override is explicitly provided in style or textStyle
  const hasFontOverride =
    (style && (style as any).fontFamily) ||
    (textStyle && textStyle.fontFamily);

  // Merge styles: base -> textStyle -> style (style has highest priority)
  const finalTextStyle = [
    baseStyle,
    textStyle,
    style,
    !hasFontOverride && { fontFamily: resolvedFont },
  ];

  return (
    <Text
      {...textProps}
      style={finalTextStyle}
      adjustsFontSizeToFit={adjustsFontSizeToFit}
      minimumFontScale={minimumFontScale}
    >
      {viewStyle ? <View style={viewStyle}>{children}</View> : children}
    </Text>
  );
};

export default AppText;