import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import AppText from '../../components/Text/AppText';
import { TAB_BAR_BASE_HEIGHT } from '../../hooks/useTabContentBottomInset';

export default function TabLayout() {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [showAddSheet, setShowAddSheet] = useState(false);
  const bottomInset = insets.bottom;
  const computedHeight = TAB_BAR_BASE_HEIGHT + bottomInset;
  const computedPaddingBottom = Math.max(bottomInset, 8);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: COLORS.surfaceTint,
          tabBarInactiveTintColor: COLORS.textSecondary,
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: COLORS.surfaceContainerLowest,
            height: computedHeight,
            paddingBottom: computedPaddingBottom,
            paddingTop: 8,
            borderTopWidth: 1,
            borderTopColor: COLORS.outlineVariant,
          },
          tabBarLabelStyle: {
            ...TYPOGRAPHY.labelSm,
            fontSize: 11,
            lineHeight: 16,
            width: 64,
            textAlign: 'center',
            includeFontPadding: false,
          },
        }}
      >
        <Tabs.Screen
          name="dashboard/index"
          options={{
            title: t('tabs.home', 'Home'),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="plan/index"
          options={{
            title: t('tabs.plan', 'Plan'),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'analytics' : 'analytics-outline'} size={22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="add-stub"
          options={{
            title: t('common.add', 'Add'),
            tabBarAccessibilityLabel: t('tabs.quickAction', 'Quick Action'),
            tabBarIcon: () => (
              <View style={styles.centeredAddButton}>
                <Ionicons name="add" size={30} color={COLORS.onPrimary} />
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
            title: t('tabs.history', 'History'),
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile/index"
          options={{
            title: t('tabs.profile', 'Profile'),
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
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowAddSheet(false)}
            accessible={false}
          />
          <View
            style={styles.sheetContent}
            role="dialog"
            accessibilityLabel={t('tabs.quickAction', 'Quick Action')}
            accessibilityViewIsModal
            importantForAccessibility="yes"
            onAccessibilityEscape={() => setShowAddSheet(false)}
          >
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHandle} />
              <AppText variant="bodySemiBold" style={styles.sheetTitle} role="heading" aria-level={2}>
                {t('tabs.quickAction', 'Quick Action')}
              </AppText>
            </View>

            <View style={styles.sheetButtons}>
              <TouchableOpacity style={styles.sheetButton} onPress={() => { setShowAddSheet(false); router.push('/transaction-form?actionType=flexible'); }} accessibilityLabel={t('tabs.addExpense', 'Add Expense')}>
                <View style={[styles.iconBox, { backgroundColor: COLORS.mintBackground }]}>
                  <Ionicons name="receipt-outline" size={24} color={COLORS.darkEmerald} />
                </View>
                <AppText variant="bodySemiBold" style={styles.sheetButtonText}>{t('tabs.addExpense', 'Add Expense')}</AppText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sheetButton} onPress={() => { setShowAddSheet(false); router.push('/transaction-form?actionType=income'); }} accessibilityLabel={t('tabs.addIncome', 'Add Income')}>
                <View style={[styles.iconBox, { backgroundColor: COLORS.surfaceContainerLow }]}>
                  <Ionicons name="cash-outline" size={24} color={COLORS.primary} />
                </View>
                <AppText variant="bodySemiBold" style={styles.sheetButtonText}>{t('tabs.addIncome', 'Add Income')}</AppText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sheetButton} onPress={() => { setShowAddSheet(false); router.push('/transaction-form?actionType=essential'); }} accessibilityLabel={t('tabs.addBill', 'Add Bill')}>
                <View style={[styles.iconBox, { backgroundColor: COLORS.warningBackground }]}>
                  <Ionicons name="calendar-outline" size={24} color={COLORS.warning} />
                </View>
                <AppText variant="bodySemiBold" style={styles.sheetButtonText}>{t('tabs.addBill', 'Add Bill')}</AppText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sheetButton} onPress={() => { setShowAddSheet(false); router.push('/transaction-form?actionType=debt'); }} accessibilityLabel={t('tabs.addDebt', 'Add Debt Payment')}>
                <View style={[styles.iconBox, { backgroundColor: COLORS.errorBackground }]}>
                  <Ionicons name="card-outline" size={24} color={COLORS.error} />
                </View>
                <AppText variant="bodySemiBold" style={styles.sheetButtonText}>{t('tabs.addDebt', 'Add Debt Payment')}</AppText>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.sheetButton, styles.sheetButtonWide]} onPress={() => { setShowAddSheet(false); router.push('/goals'); }} accessibilityLabel={t('tabs.addGoal', 'Add Personal Goal')}>
                <View style={[styles.iconBox, { backgroundColor: COLORS.surfaceContainerLow }]}>
                  <Ionicons name="trophy-outline" size={24} color={COLORS.primary} />
                </View>
                <AppText variant="bodySemiBold" style={styles.sheetButtonText}>{t('tabs.addGoal', 'Add Personal Goal')}</AppText>
              </TouchableOpacity>
            </View>

            <Pressable onPress={() => setShowAddSheet(false)} style={styles.cancelAction} accessibilityRole="button">
              <AppText variant="bodySemiBold" style={styles.cancelText}>{t('common.cancel', 'Cancel')}</AppText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  centeredAddButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surfaceTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(27, 28, 25, 0.36)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
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
  sheetButtonWide: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
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
  cancelAction: { minHeight: 48, alignSelf: 'center', justifyContent: 'center', paddingHorizontal: SPACING.lg },
  cancelText: { color: COLORS.textSecondary },
});
