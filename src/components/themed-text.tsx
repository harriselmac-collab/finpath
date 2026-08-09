import { StyleSheet, Text, type TextProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getFontFamily, FontWeight } from '../utils/typography';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

const TYPE_WEIGHTS: Record<string, FontWeight> = {
  default: 'medium',
  title: 'bold',
  small: 'regular',
  smallBold: 'bold',
  subtitle: 'semibold',
  link: 'regular',
  linkPrimary: 'semibold',
  code: 'regular',
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const locale = i18n.language || 'en';
  const weight = TYPE_WEIGHTS[type] || 'regular';
  const resolvedFont = getFontFamily(locale, weight);

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
        { fontFamily: resolvedFont }, // Force dynamic resolved font mapping
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontFamily: 'Cairo',
    fontWeight: '400',
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    fontFamily: 'Cairo',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 20,
  },
  default: {
    fontFamily: 'Cairo',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontFamily: 'Cairo',
    fontWeight: '700',
    fontSize: 48,
    lineHeight: 52,
  },
  subtitle: {
    fontFamily: 'Cairo',
    fontWeight: '600',
    fontSize: 32,
    lineHeight: 44,
  },
  link: {
    fontFamily: 'Cairo',
    fontWeight: '400',
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    fontFamily: 'Cairo',
    fontWeight: '600',
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
  },
  code: {
    fontFamily: 'Cairo',
    fontWeight: '400',
    fontSize: 12,
  },
});
