import React, { useEffect } from 'react';
import { I18nManager, View, StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, RADIUS } from '../../constants/theme';

export interface ProgressBarProps {
  progress: number; // between 0 and 1
  height?: number;
  color?: string;
  trackColor?: string;
  accessibilityLabel?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  color,
  trackColor,
  accessibilityLabel,
}) => {
  const animatedProgress = useSharedValue(0);
  const reducedMotion = useReducedMotion();
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  useEffect(() => {
    if (reducedMotion) {
      animatedProgress.value = clampedProgress;
      return;
    }
    animatedProgress.value = withTiming(clampedProgress, {
      duration: 240,
      easing: Easing.bezier(0.23, 1, 0.32, 1),
    });
  }, [clampedProgress, reducedMotion, animatedProgress]);


  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scaleX: animatedProgress.value }],
    };
  });

  return (
    <View
      style={[styles.container, { height, backgroundColor: trackColor || COLORS.outlineVariant }]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clampedProgress * 100) }}
    >
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: color || COLORS.emerald,
            transformOrigin: I18nManager.isRTL ? 'right center' : 'left center',
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: RADIUS.round,
    overflow: 'hidden',
  },
  fill: {
    width: '100%',
    borderRadius: RADIUS.round,
  },
});

