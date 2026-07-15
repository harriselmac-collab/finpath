import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../../constants/theme';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { useSessionStore } from '../../../store/sessionStore';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { answers, resetOnboarding } = useOnboardingStore();
  const { user, signOut } = useSessionStore();

  const handleResetData = () => {
    Alert.alert(
      'Reset Onboarding Data',
      'Are you sure you want to reset your onboarding questions? This will wipe your locally cached assessment and return you to the onboarding quiz. Your Supabase authentication account and custom transactions will NOT be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Assessment',
          style: 'destructive',
          onPress: () => {
            resetOnboarding();
            router.replace('/onboarding/welcome');
          },
        },
      ]
    );
  };

  const renderSectionHeader = (title: string) => (
    <Text style={styles.sectionHeader}>{title}</Text>
  );

  interface RowProps {
    icon: string;
    title: string;
    route: string;
    isDestructive?: boolean;
  }

  const renderRow = ({ icon, title, route, isDestructive }: RowProps) => (
    <TouchableOpacity
      key={route}
      style={styles.row}
      onPress={() => router.push(route as any)}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, isDestructive && styles.destructiveIconBox]}>
          <Ionicons
            name={icon as any}
            size={18}
            color={isDestructive ? COLORS.error : COLORS.primary}
          />
        </View>
        <Text style={[styles.rowTitle, isDestructive && styles.destructiveText]}>{title}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={16}
        color={isDestructive ? COLORS.error : COLORS.textSecondary}
      />
    </TouchableOpacity>
  );

  const getInitials = () => {
    if (answers.preferredName) {
      return answers.preferredName.trim().substring(0, 2).toUpperCase();
    }
    return user?.email ? user.email.substring(0, 2).toUpperCase() : 'FP';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {answers.profileImage ? (
              <Image source={{ uri: answers.profileImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{getInitials()}</Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {answers.preferredName || t('profile.guestUser', 'Guest User')}
            </Text>
            <Text style={styles.profileMeta} numberOfLines={1}>
              {answers.employmentStatus
                ? answers.employmentStatus.charAt(0).toUpperCase() + answers.employmentStatus.slice(1)
                : t('profile.statusNotSet', 'Employment Status Not Set')}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editHeaderBtn}
            onPress={() => router.push('/profile/edit')}
            accessibilityLabel="Edit profile"
          >
            <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Section: Account */}
        <Card style={styles.sectionCard}>
          {renderSectionHeader(t('profile.sections.account', 'Account'))}
          {renderRow({ icon: 'person-outline', title: t('profile.rows.personalInfo', 'Personal Information'), route: '/profile/edit' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'briefcase-outline', title: t('profile.rows.incomeEmployment', 'Income & Employment'), route: '/profile/income' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'people-outline', title: t('profile.rows.familyDependants', 'Family & Dependants'), route: '/profile/family' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'cash-outline', title: t('profile.rows.currencyRegion', 'Currency & Region'), route: '/profile/region' })}
        </Card>

        {/* Section: Financial Management */}
        <Card style={styles.sectionCard}>
          {renderSectionHeader(t('profile.sections.financialManagement', 'Financial Management'))}
          {renderRow({ icon: 'card-outline', title: t('profile.rows.debtTracker', 'Debt Tracker'), route: '/profile/debts' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'trophy-outline', title: t('profile.rows.goalsExpenses', 'Goals & Upcoming Expenses'), route: '/profile/goals' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'calendar-outline', title: t('profile.rows.recurringBills', 'Recurring Bills'), route: '/profile/bills' })}
        </Card>

        {/* Section: Preferences */}
        <Card style={styles.sectionCard}>
          {renderSectionHeader(t('profile.sections.preferences', 'Preferences'))}
          {renderRow({ icon: 'globe-outline', title: t('profile.rows.language', 'Language'), route: '/profile/language' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'notifications-outline', title: t('profile.rows.notifications', 'Notifications'), route: '/profile/notifications' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'color-palette-outline', title: t('profile.rows.appearance', 'Appearance'), route: '/profile/appearance' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'body-outline', title: t('profile.rows.accessibility', 'Accessibility'), route: '/profile/accessibility' })}
        </Card>

        {/* Section: Privacy and Security */}
        <Card style={styles.sectionCard}>
          {renderSectionHeader(t('profile.sections.privacySecurity', 'Privacy and Security'))}
          {renderRow({ icon: 'shield-checkmark-outline', title: t('profile.rows.security', 'Security'), route: '/profile/security' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'lock-closed-outline', title: t('profile.rows.privacyCentre', 'Privacy Centre'), route: '/profile/privacy' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'sparkles-outline', title: t('profile.rows.aiConsent', 'AI & Data Consent'), route: '/profile/ai-consent' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'download-outline', title: t('profile.rows.exportData', 'Export My Data'), route: '/profile/export-data' })}
          <View style={styles.divider} />
          {renderRow({
            icon: 'trash-outline',
            title: t('profile.rows.deleteAccount', 'Delete My Account'),
            route: '/profile/delete-account',
            isDestructive: true,
          })}
        </Card>

        {/* Section: Support */}
        <Card style={styles.sectionCard}>
          {renderSectionHeader(t('profile.sections.support', 'Support'))}
          {renderRow({ icon: 'help-circle-outline', title: t('profile.rows.helpSupport', 'Help & Support'), route: '/profile/help' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'mail-outline', title: t('profile.rows.contactSupport', 'Contact Support'), route: '/profile/contact' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'list-outline', title: t('profile.rows.faq', 'Frequently Asked Questions'), route: '/profile/faq' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'bug-outline', title: t('profile.rows.reportProblem', 'Report a Problem'), route: '/profile/report-problem' })}
        </Card>

        {/* Section: Legal */}
        <Card style={styles.sectionCard}>
          {renderSectionHeader(t('profile.sections.legal', 'Legal'))}
          {renderRow({ icon: 'document-text-outline', title: t('profile.rows.privacyPolicy', 'Privacy Policy'), route: '/profile/legal/privacy' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'reader-outline', title: t('profile.rows.termsUse', 'Terms of Use'), route: '/profile/legal/terms' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'alert-circle-outline', title: t('profile.rows.financialDisclaimer', 'Financial Disclaimer'), route: '/profile/legal/financial-disclaimer' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'information-circle-outline', title: t('profile.rows.aiDisclaimer', 'AI Disclaimer'), route: '/profile/legal/ai-disclaimer' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'ribbon-outline', title: t('profile.rows.licenses', 'Open-source Licences'), route: '/profile/legal/licenses' })}
        </Card>

        {/* Section: About */}
        <Card style={styles.sectionCard}>
          {renderSectionHeader(t('profile.sections.about', 'About'))}
          {renderRow({ icon: 'apps-outline', title: t('profile.rows.appInfo', 'App & System Info'), route: '/profile/about' })}
        </Card>

        {/* Developer Section */}
        {__DEV__ && (
          <Card style={[styles.sectionCard, styles.devCard]}>
            {renderSectionHeader(t('profile.devTools', 'Developer Tools (Debug Mode)'))}
            <Text style={styles.devNotice}>
              {t('profile.devNoticeText', 'These tools are shown only during development builds. They are automatically hidden in release production builds.')}
            </Text>
            <Button
              title={t('profile.resetOnboardingAssessment', 'Reset Onboarding Assessment')}
              onPress={handleResetData}
              variant="destructive"
              style={styles.devResetBtn}
            />
          </Card>
        )}

        {/* Standard User Logout */}
        {user && (
          <Button
            title={t('profile.signOutAccount', 'Sign Out Account')}
            onPress={async () => {
              await signOut();
              router.replace('/auth');
            }}
            variant="secondary"
            style={styles.signOutBtn}
          />
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.sm,
  },
  avatarContainer: {
    marginRight: SPACING.md,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarInitials: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.white,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.textPrimary,
    fontWeight: '700',
    marginBottom: 2,
  },
  profileMeta: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.emerald,
    fontWeight: '600',
  },
  editHeaderBtn: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  sectionHeader: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destructiveIconBox: {
    backgroundColor: '#FFF2F2',
  },
  rowTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  destructiveText: {
    color: COLORS.error,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.outlineVariant,
  },
  devCard: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF8EA',
  },
  devNotice: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    lineHeight: 16,
    marginBottom: SPACING.md,
  },
  devResetBtn: {
    width: '100%',
  },
  signOutBtn: {
    marginTop: SPACING.sm,
    width: '100%',
  },
});
