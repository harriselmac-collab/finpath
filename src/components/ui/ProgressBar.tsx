import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { COLORS, RADIUS } from '../../constants/theme';

export interface ProgressBarProps {
  progress: number; // between 0 and 1
  height?: number;
  color?: string;
  trackColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, height = 8, color, trackColor }) => {
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, { duration: 300 });
  }, [progress, animatedProgress]);


  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedProgress.value * 100}%`,
    };
  });

  return (
    <View style={[styles.container, { height, backgroundColor: trackColor || COLORS.outlineVariant }]} accessibilityRole="progressbar">
      <Animated.View
        style={[
          styles.fill,
          {
            height,
            backgroundColor: color || COLORS.emerald,
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
    borderRadius: RADIUS.round,
  },
});

