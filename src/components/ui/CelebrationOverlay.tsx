/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { RADIUS } from '../../constants/theme';

const CONFETTI_COLORS = ['#f2d643', '#eb5b56', '#4380f2', '#3fb27f', '#e673a5', '#b37df2'];

interface PieceConfig {
  id: number;
  delay: number;
  startX: number;
  size: number;
  color: string;
  isCircle: boolean;
  animY: Animated.Value;
  animX: Animated.Value;
  animRotate: Animated.Value;
}

interface ConfettiPieceProps {
  piece: PieceConfig;
  windowHeight: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ piece, windowHeight }) => {
  const { animY, animX, animRotate, startX, size, color, isCircle, delay } = piece;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(animY, {
          toValue: windowHeight + 50,
          duration: Math.random() * 2000 + 2500,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(animX, {
              toValue: Math.random() * 40 - 20,
              duration: Math.random() * 600 + 400,
              useNativeDriver: true,
            }),
            Animated.timing(animX, {
              toValue: Math.random() * 40 - 20,
              duration: Math.random() * 600 + 400,
              useNativeDriver: true,
            }),
          ]),
          { iterations: -1 }
        ),
        Animated.timing(animRotate, {
          toValue: 1,
          duration: Math.random() * 2000 + 2000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rotateInterpolation = animRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          width: size,
          height: isCircle ? size : size * 1.5,
          backgroundColor: color,
          borderRadius: isCircle ? size / 2 : RADIUS.xs,
          transform: [
            { translateY: animY },
            { translateX: Animated.add(startX as unknown as Animated.Value, animX) },
            { rotate: rotateInterpolation },
          ],
        },
      ]}
    />
  );
};

interface CelebrationOverlayProps {
  active: boolean;
  onComplete: () => void;
}

export const CelebrationOverlay: React.FC<CelebrationOverlayProps> = ({ active, onComplete }) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [pieces, setPieces] = useState<PieceConfig[]>([]);

  useEffect(() => {
    if (!active) return;

    const items: PieceConfig[] = Array.from({ length: 60 }).map((_, idx) => ({
      id: idx,
      delay: Math.random() * 800,
      startX: Math.random() * windowWidth,
      size: Math.random() * 8 + 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      isCircle: Math.random() > 0.5,
      animY: new Animated.Value(-50),
      animX: new Animated.Value(0),
      animRotate: new Animated.Value(0),
    }));

    setPieces(items);

    const timer = setTimeout(() => {
      setPieces([]);
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {pieces.map((p) => (
        <ConfettiPiece key={p.id} piece={p} windowHeight={windowHeight} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 9999,
  },
  confetti: {
    position: 'absolute',
    top: 0,
  },
});
