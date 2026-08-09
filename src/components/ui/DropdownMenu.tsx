/* eslint-disable react-hooks/immutability */
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AnimatedReanimated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import AppText from '../Text/AppText';

export interface DropdownMenuItem {
  key: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

export interface DropdownMenuProps {
  items: DropdownMenuItem[];
  selectedKey?: string;
  onSelect: (key: string) => void;
  triggerLabel?: string;
  triggerIcon?: string;
  placeholder?: string;
  disabled?: boolean;
  style?: any;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  items,
  selectedKey,
  onSelect,
  triggerLabel,
  triggerIcon = 'chevron-down',
  placeholder = 'Select...',
  disabled = false,
  style,
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0, width: 0 });
  const triggerRef = useRef<View>(null);

  // Trigger scale animation
  const triggerScale = useSharedValue(1);

  const animatedTriggerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: triggerScale.value }],
    };
  });

  const handlePressIn = () => {
    if (!disabled) {
      triggerScale.value = withSpring(0.97, { damping: 10, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    if (!disabled) {
      triggerScale.value = withSpring(1, { damping: 10, stiffness: 400 });
    }
  };

  // Dropdown menu animations using Reanimated
  const menuScale = useSharedValue(0.8);
  const menuOpacity = useSharedValue(0);

  const animatedMenuStyle = useAnimatedStyle(() => {
    return {
      opacity: menuOpacity.value,
      transform: [{ scale: menuScale.value }],
    };
  });

  const selectedItem = items.find((item) => item.key === selectedKey);

  const openMenu = () => {
    triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setCoords({ x: pageX, y: pageY + height, width });
      setVisible(true);
      menuScale.value = withSpring(1, { damping: 15, stiffness: 220 });
      menuOpacity.value = withTiming(1, { duration: 150 });
    });
  };

  const closeMenu = () => {
    menuScale.value = withSpring(0.8, { damping: 15, stiffness: 220 });
    menuOpacity.value = withTiming(0, { duration: 120 }, (finished) => {
      if (finished) {
        runOnJS(setVisible)(false);
      }
    });
  };

  const handleSelect = (key: string) => {
    onSelect(key);
    closeMenu();
  };

  return (
    <View style={style}>
      <AnimatedReanimated.View style={animatedTriggerStyle}>
        <TouchableOpacity
          ref={triggerRef as any}
          onPress={openMenu}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={0.8}
          style={[
            styles.trigger,
            disabled && styles.triggerDisabled,
          ]}
        >
          <View style={styles.triggerContent}>
            {triggerIcon && !triggerLabel && (
              <Ionicons name={triggerIcon as any} size={20} color={COLORS.textSecondary} />
            )}
            {triggerLabel && (
              <Text style={[styles.triggerText, !selectedItem && styles.triggerPlaceholder]} numberOfLines={1}>
                {selectedItem ? selectedItem.label : triggerLabel}
              </Text>
            )}
            {!triggerLabel && (
              <Text style={[styles.triggerText, !selectedItem && styles.triggerPlaceholder]} numberOfLines={1}>
                {selectedItem ? selectedItem.label : placeholder}
              </Text>
            )}
          </View>
          <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </AnimatedReanimated.View>


      <Modal visible={visible} transparent animationType="none" onRequestClose={closeMenu}>
        <Pressable style={styles.overlay} onPress={closeMenu}>
          <Pressable style={{ flex: 1 }} />
          <AnimatedReanimated.View
            style={[
              styles.menu,
              {
                left: coords.x,
                top: coords.y,
                width: Math.max(coords.width, 180),
              },
              animatedMenuStyle,
            ]}
          >

            <View style={styles.menuHeader}>
              <View style={styles.menuHandle} />
            </View>
            {items.map((item) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.menuItem,
                  item.key === selectedKey && styles.menuItemSelected,
                  item.disabled && styles.menuItemDisabled,
                ]}
                onPress={() => !item.disabled && handleSelect(item.key)}
                disabled={item.disabled}
              >
                {item.icon && (
                  <Ionicons
                    name={item.icon as any}
                    size={20}
                    color={
                      item.disabled
                        ? COLORS.textSecondary
                        : item.key === selectedKey
                        ? COLORS.primary
                        : COLORS.textSecondary
                    }
                    style={styles.menuItemIcon}
                  />
                )}
                <AppText
                  variant="bodyMd"
                  style={[
                    styles.menuItemText,
                    item.key === selectedKey && styles.menuItemTextSelected,
                    item.disabled && styles.menuItemTextDisabled,
                  ]}
                >
                  {item.label}
                </AppText>
                {item.key === selectedKey && (
                  <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            ))}
          </AnimatedReanimated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLowest,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.sm,
  },
  triggerDisabled: {
    opacity: 0.5,
  },
  triggerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  triggerText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textPrimary,
    flex: 1,
  },
  triggerPlaceholder: {
    color: COLORS.textSecondary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 30, 61, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  menu: {
    position: 'absolute',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.lg,
    overflow: 'hidden',
    minWidth: 180,
  },
  menuHeader: {
    alignItems: 'center',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  menuHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.outlineVariant,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  menuItemSelected: {
    backgroundColor: COLORS.surfaceContainerLow,
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  menuItemIcon: {
    width: 24,
    textAlign: 'center',
  },
  menuItemText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textPrimary,
    flex: 1,
  },
  menuItemTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  menuItemTextDisabled: {
    color: COLORS.textSecondary,
  },
});
