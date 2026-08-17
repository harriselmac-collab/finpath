import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { FLAG_ASSETS } from '../../constants/flagAssets';

interface FlagIconProps {
  countryCode: string;
  size?: number;
}

export function FlagIcon({ countryCode, size = 24 }: FlagIconProps) {
  const code = countryCode.trim().toUpperCase();
  const source = FLAG_ASSETS[code];

  return (
    <View
      accessible
      accessibilityLabel={`${code} flag`}
      accessibilityRole="image"
      style={[styles.frame, { width: Math.round(size * 1.4), height: size }]}
    >
      {source ? (
        <Image accessible={false} contentFit="fill" source={source} style={StyleSheet.absoluteFill} />
      ) : (
        <Text style={[styles.fallback, { fontSize: Math.max(8, Math.round(size * 0.4)) }]}>{code.slice(0, 2) || '?'}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    alignItems: 'center',
    backgroundColor: '#E5E3DE',
    borderColor: 'rgba(27,28,25,0.18)',
    borderRadius: 2,
    borderWidth: 0.8,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fallback: {
    color: '#454847',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default FlagIcon;
