import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, FadeIn, FadeOut, FadeInUp } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';

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
        shadow !== 'none' && { borderWidth: 0 },
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
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const SelectionCard: React.FC<SelectionCardProps> = ({
  label,
  selected,
  onPress,
  style,
}) => {
  const scale = useSharedValue(1);
  const pressedScale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSpring(selected ? 1.02 : 1, { damping: 15, stiffness: 200 });
  }, [selected, scale]);

  const handlePressIn = () => {
    pressedScale.value = withSpring(0.98, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    pressedScale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };


  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value * pressedScale.value }
      ],
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
      <Text
        style={[
          styles.selectionText,
          selected && styles.selectedSelectionText,
        ]}
      >
        {label}
      </Text>
      <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
        {selected && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
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
          backgroundColor: '#FFF8EA',
          borderLeftColor: COLORS.warning,
          borderColor: 'rgba(245, 185, 66, 0.1)',
        };
      case 'danger':
        return {
          backgroundColor: '#FFF2F2',
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
      entering={FadeInUp.duration(300)}
      style={[styles.alertCard, getCardStyle(), style]}
    >
      <Text style={[styles.alertTitle, { color: getTitleColor() }]}>{title}</Text>
      <Text style={styles.alertDescription}>{description}</Text>
    </Animated.View>
  );
};

export interface PressableCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  shadow?: 'sm' | 'md' | 'lg' | 'none';
}

export const PressableCard: React.FC<PressableCardProps> = ({
  children,
  onPress,
  style,
  shadow = 'md',
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 12, stiffness: 250 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 12, stiffness: 250 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
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
        shadow !== 'none' && { borderWidth: 0 },
        style,
        animatedStyle,
      ]}
      accessibilityRole="button"
    >
      {children}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(7, 30, 61, 0.08)',
  },
  selectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1.5,
    borderColor: 'rgba(7, 30, 61, 0.08)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    height: 56,
  },
  selectedSelectionCard: {
    borderColor: COLORS.emerald,
    backgroundColor: COLORS.mintBackground,
  },
  selectionText: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
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
    ...TYPOGRAPHY.bodySemiBold,
    marginBottom: SPACING.xs,
  },
  alertDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textPrimary,
  },
});

