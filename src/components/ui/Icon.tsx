import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleProp, TextStyle } from 'react-native';

export type IconName = React.ComponentProps<typeof Ionicons>['name'] | string;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

// Map incorrect or custom names to valid Ionicons names
const ICON_MAPPING: Record<string, string> = {
  // AI and Intelligence
  'auto-awesome': 'sparkles-outline',
  'sparkles': 'sparkles-outline',
  'bot': 'chatbubble-ellipses-outline',
  'lightbulb': 'bulb-outline',
  'bulb': 'bulb-outline',

  // Transactions & Financial Flow
  'receipt-long': 'receipt-outline',
  'receipt': 'receipt-outline',
  'history': 'time-outline',
  'clock': 'time-outline',
  'trending-up': 'trending-up',
  'trending-down': 'trending-down',

  // Utilities & Categories
  'house': 'home-outline',
  'home': 'home-outline',
  'zap': 'flash-outline',
  'flash': 'flash-outline',
  'electricity': 'flash-outline',
  'vehicle': 'car-outline',
  'car': 'car-outline',
  'cultural': 'globe-outline',
  
  // Savings, Security, Goals
  'shield': 'shield-checkmark-outline',
  'shield-checkmark': 'shield-checkmark-outline',
  'calendar': 'calendar-outline',
  'trophy': 'trophy-outline',
  'flag': 'flag-outline',
  'wallet': 'wallet-outline',
  
  // Actions
  'circle-plus': 'add-circle-outline',
  'add-circle': 'add-circle-outline',
  'plus': 'add',
  'minus': 'remove',
  'trash': 'trash-outline',
  'delete': 'trash-outline',
  'edit': 'create-outline',
  'options': 'ellipsis-vertical-outline',
  'more': 'ellipsis-vertical-outline',
  'info': 'information-circle-outline',
  'warning': 'warning-outline',
};

export const Icon: React.FC<IconProps> = ({ name, size = 20, color, style }) => {
  const resolvedName = ICON_MAPPING[name] || name;
  const finalName = resolvedName as React.ComponentProps<typeof Ionicons>['name'];

  return <Ionicons name={finalName} size={size} color={color} style={style} />;
};
