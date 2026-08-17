import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import AppText from '../Text/AppText';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  shadow?: 'sm' | 'md' | 'lg' | 'none';
}

export const Card: React.FC<CardProps> = ({ children, style, shadow = 'md' }) => {
  return (
    <View
      style={[
        styles.card,
        shadow !== 'none' && SHADOWS[shadow],
        style,
      ]}
    >
      {children}
    </View>
  );
};

export interface SelectionCardProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SelectionCard: React.FC<SelectionCardProps> = ({
  label,
  selected,
  onPress,
  style,
  icon,
}) => {
  const pressedScale = useSharedValue(1);
  const pressedOpacity = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const handlePressIn = () => {
    if (reduceMotion) {
      pressedOpacity.value = 0.72;
      return;
    }
    pressedScale.value = withTiming(0.98, {
      duration: 120,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
    });
  };

  const handlePressOut = () => {
    if (reduceMotion) {
      pressedOpacity.value = 1;
      return;
    }
    pressedScale.value = withTiming(1, {
      duration: 150,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
    });
  };


  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pressedScale.value }],
      opacity: pressedOpacity.value,
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.selectionCard,
        selected && styles.selectedSelectionCard,
        style,
        animatedStyle,
      ]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
    >
      {icon}
      <AppText
        variant="bodySemiBold"
        style={[
          styles.selectionText,
          selected && styles.selectedSelectionText,
        ]}
      >
        {label}
      </AppText>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && (
          <Animated.View
            entering={reduceMotion ? undefined : FadeIn.duration(200)}
            exiting={reduceMotion ? undefined : FadeOut.duration(150)}
            style={styles.radioInner}
          />
        )}
      </View>
    </AnimatedPressable>
  );
};

export interface AlertCardProps {
  type: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  description: string;
  style?: ViewStyle;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  type,
  title,
  description,
  style,
}) => {
  const reduceMotion = useReducedMotion();

  const getCardStyle = (): ViewStyle => {
    switch (type) {
      case 'info':
        return {
          backgroundColor: COLORS.surfaceContainerLow,
          borderLeftColor: COLORS.onPrimaryContainer,
          borderColor: 'rgba(7, 30, 61, 0.04)',
        };
      case 'success':
        return {
          backgroundColor: '#EAF8EF',
          borderLeftColor: COLORS.emerald,
          borderColor: 'rgba(72, 199, 116, 0.1)',
        };
      case 'warning':
        return {
          backgroundColor: COLORS.warningBackground,
          borderLeftColor: COLORS.warning,
          borderColor: 'rgba(245, 185, 66, 0.1)',
        };
      case 'danger':
        return {
          backgroundColor: COLORS.errorBackground,
          borderLeftColor: COLORS.error,
          borderColor: 'rgba(186, 26, 26, 0.1)',
        };
    }
  };

  const getTitleColor = (): string => {
    switch (type) {
      case 'info':
      case 'success':
        return COLORS.darkEmerald;
      case 'warning':
        return '#B27B00';
      case 'danger':
        return COLORS.error;
    }
  };

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInUp.duration(220)}
      style={[styles.alertCard, getCardStyle(), style]}
    >
      <AppText variant="bodySemiBold" style={[styles.alertTitle, { color: getTitleColor() }]}>
        {title}
      </AppText>
      <AppText variant="supporting" style={styles.alertDescription}>{description}</AppText>
    </Animated.View>
  );
};

export interface PressableCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  shadow?: 'sm' | 'md' | 'lg' | 'none';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const PressableCard: React.FC<PressableCardProps> = ({
  children,
  onPress,
  style,
  shadow = 'md',
  accessibilityLabel,
  accessibilityHint,
}) => {
  const scale = useSharedValue(1);
  const pressedOpacity = useSharedValue(1);
  const reduceMotion = useReducedMotion();

  const handlePressIn = () => {
    if (reduceMotion) {
      pressedOpacity.value = 0.72;
      return;
    }
    scale.value = withTiming(0.97, {
      duration: 120,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
    });
  };

  const handlePressOut = () => {
    if (reduceMotion) {
      pressedOpacity.value = 1;
      return;
    }
    scale.value = withTiming(1, {
      duration: 160,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: pressedOpacity.value,
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.card,
        shadow !== 'none' && SHADOWS[shadow],
        style,
        animatedStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      {children}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardSurface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  selectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardSurface,
    borderWidth: 1.5,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    minHeight: 72,
  },
  selectedSelectionCard: {
    borderColor: COLORS.emerald,
    backgroundColor: COLORS.mintBackground,
  },
  selectionText: {
    color: COLORS.textPrimary,
    flex: 1,
    paddingRight: SPACING.sm,
  },
  selectedSelectionText: {
    color: COLORS.darkEmerald,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.outlineVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.emerald,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.emerald,
  },
  alertCard: {
    borderRadius: RADIUS.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderLeftWidth: 5,
    marginBottom: SPACING.md,
  },
  alertTitle: {
    marginBottom: SPACING.xs,
  },
  alertDescription: {
    color: COLORS.textPrimary,
  },
});

