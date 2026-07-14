import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOWS, TYPOGRAPHY } from '../../constants/theme';
import { Button } from '../../components/ui/Button';

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [showAddSheet, setShowAddSheet] = useState(false);

  const bottomInset = insets.bottom;
  const computedHeight = 66 + (bottomInset > 0 ? Math.max(bottomInset - 10, 0) : 0);
  const computedPaddingBottom = bottomInset > 0 ? Math.max(bottomInset - 12, 6) : 10;
  const computedBottom = Platform.OS === 'ios' ? Math.max(bottomInset, 16) : 16;

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.onSecondaryContainer,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarStyle: {
            position: 'absolute',
            bottom: computedBottom,
            left: 16,
            right: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: RADIUS.xl,
            height: computedHeight,
            paddingBottom: computedPaddingBottom,
            paddingTop: 10,
            borderTopWidth: 0,
            ...SHADOWS.lg,
          },
          tabBarLabelStyle: {
            ...TYPOGRAPHY.labelSm,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="dashboard/index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="plan/index"
          options={{
            title: 'Plan',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'analytics' : 'analytics-outline'} size={22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="add-stub"
          options={{
            title: 'Add',
            tabBarIcon: () => (
              <View style={styles.centeredAddButton}>
                <Ionicons name="add" size={28} color={COLORS.primary} />
              </View>
            ),
            tabBarLabel: () => null,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setShowAddSheet(true);
            },
          }}
        />

        <Tabs.Screen
          name="transactions/index"
          options={{
            title: 'History',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile/index"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
            ),
          }}
        />
        
        {/* Hide extra files that are not tab routes */}
        <Tabs.Screen
          name="goals/index"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Center Quick Action Bottom Sheet Modal */}
      <Modal
        transparent
        visible={showAddSheet}
        animationType="slide"
        onRequestClose={() => setShowAddSheet(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddSheet(false)}>
          <View style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHandle} />
              <Text style={styles.sheetTitle}>Quick Action</Text>
            </View>

            <View style={styles.sheetButtons}>
              <TouchableOpacity style={styles.sheetButton} onPress={() => { setShowAddSheet(false); router.push('/transactions?openForm=true&actionType=flexible'); }}>
                <View style={[styles.iconBox, { backgroundColor: COLORS.mintBackground }]}>
                  <Ionicons name="receipt-outline" size={24} color={COLORS.darkEmerald} />
                </View>
                <Text style={styles.sheetButtonText}>Add Expense</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sheetButton} onPress={() => { setShowAddSheet(false); router.push('/transactions?openForm=true&actionType=income'); }}>
                <View style={[styles.iconBox, { backgroundColor: COLORS.surfaceContainerLow }]}>
                  <Ionicons name="cash-outline" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.sheetButtonText}>Add Income</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sheetButton} onPress={() => { setShowAddSheet(false); router.push('/transactions?openForm=true&actionType=essential'); }}>
                <View style={[styles.iconBox, { backgroundColor: '#FFF8EA' }]}>
                  <Ionicons name="calendar-outline" size={24} color={COLORS.warning} />
                </View>
                <Text style={styles.sheetButtonText}>Add Bill</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sheetButton} onPress={() => { setShowAddSheet(false); router.push('/transactions?openForm=true&actionType=debt'); }}>
                <View style={[styles.iconBox, { backgroundColor: '#FFF2F2' }]}>
                  <Ionicons name="card-outline" size={24} color={COLORS.error} />
                </View>
                <Text style={styles.sheetButtonText}>Add Debt Payment</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sheetButton} onPress={() => { setShowAddSheet(false); router.push('/goals'); }}>
                <View style={[styles.iconBox, { backgroundColor: COLORS.surfaceContainerLow }]}>
                  <Ionicons name="trophy-outline" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.sheetButtonText}>Add Personal Goal</Text>
              </TouchableOpacity>
            </View>

            <Button
              title="Cancel"
              onPress={() => setShowAddSheet(false)}
              variant="secondary"
              style={styles.cancelBtn}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  centeredAddButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.secondaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    ...SHADOWS.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(7, 30, 61, 0.4)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    ...SHADOWS.lg,
  },
  sheetHeader: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.outlineVariant,
    marginBottom: SPACING.sm,
  },
  sheetTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.primary,
  },
  sheetButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  sheetButton: {
    width: '47%',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  sheetButtonText: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 12,
  },
  cancelBtn: {
    width: '100%',
  },
});
