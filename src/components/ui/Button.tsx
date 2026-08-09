// src/components/ui/Button.tsx
/* eslint-disable react-hooks/immutability */
import React from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import AppText from '../../components/Text/AppText';

import { COLORS, SPACING, RADIUS } from '../../constants/theme';

export interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'text' | 'destructive';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
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
  const reduceMotion = useReducedMotion();

  const getButtonStyles = (): any[] => {
    const stylesList: any[] = [styles.baseButton];

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

  const getTextStyle = (): any[] => {
    const stylesList: any[] = [];

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
    if (!disabled && !loading && !reduceMotion) {
      scale.value = withTiming(0.97, {
        duration: 120,
        easing: Easing.bezier(0.23, 1, 0.32, 1),
      });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading && !reduceMotion) {
      scale.value = withTiming(1, {
        duration: 160,
        easing: Easing.bezier(0.23, 1, 0.32, 1),
      });
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
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? COLORS.onAction : variant === 'destructive' ? COLORS.onError : COLORS.primary}
        />
      ) : (
        <AppText variant="button" style={getTextStyle()}>
          {title}
        </AppText>
      )}
    </AnimatedPressable>
  );
};


const styles = StyleSheet.create({
  baseButton: {
    minHeight: 52,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: COLORS.action,
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
    backgroundColor: COLORS.surfaceDim,
    borderColor: COLORS.surfaceDim,
  },
  primaryText: {
    color: COLORS.onAction,
  },
  secondaryText: {
    color: COLORS.onSecondaryContainer,
  },
  textText: {
    color: COLORS.secondary,
  },
  destructiveText: {
    color: COLORS.onError,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
});
