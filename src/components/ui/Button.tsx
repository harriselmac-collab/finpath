/* eslint-disable react-hooks/immutability */
import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'text' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const scale = useSharedValue(1);

  const getButtonStyles = (): ViewStyle[] => {
    const stylesList: ViewStyle[] = [styles.baseButton];

    switch (variant) {
      case 'primary':
        stylesList.push(styles.primaryButton);
        break;
      case 'secondary':
        stylesList.push(styles.secondaryButton);
        break;
      case 'text':
        stylesList.push(styles.textButton);
        break;
      case 'destructive':
        stylesList.push(styles.destructiveButton);
        break;
    }

    if (disabled || loading) {
      stylesList.push(styles.disabledButton);
    }

    if (style) {
      stylesList.push(style);
    }

    return stylesList;
  };

  const getTextStyle = (): TextStyle[] => {
    const stylesList: TextStyle[] = [styles.baseText];

    switch (variant) {
      case 'primary':
        stylesList.push(styles.primaryText);
        break;
      case 'secondary':
        stylesList.push(styles.secondaryText);
        break;
      case 'text':
        stylesList.push(styles.textText);
        break;
      case 'destructive':
        stylesList.push(styles.destructiveText);
        break;
    }

    if (disabled) {
      stylesList.push(styles.disabledText);
    }

    if (textStyle) {
      stylesList.push(textStyle);
    }

    return stylesList;
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[...getButtonStyles(), animatedStyle]}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'destructive' ? COLORS.white : COLORS.primary}
        />
      ) : (
        <Text style={getTextStyle()}>{title}</Text>
      )}
    </AnimatedPressable>
  );
};


const styles = StyleSheet.create({
  baseButton: {
    height: 52,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondaryContainer,
  },
  textButton: {
    backgroundColor: 'transparent',
    height: 'auto',
    paddingHorizontal: 0,
    paddingVertical: SPACING.xs,
  },
  destructiveButton: {
    backgroundColor: COLORS.error,
  },
  disabledButton: {
    backgroundColor: COLORS.outlineVariant,
    borderColor: COLORS.outlineVariant,
  },
  baseText: {
    ...TYPOGRAPHY.buttonText,
  },
  primaryText: {
    color: COLORS.white,
  },
  secondaryText: {
    color: COLORS.onSecondaryContainer,
  },
  textText: {
    color: COLORS.primary,
  },
  destructiveText: {
    color: COLORS.white,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
});
