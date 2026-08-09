import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, I18nManager } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, RADIUS } from '../../../constants/theme';
import AppText from '../../../components/Text/AppText';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useOnboardingStore } from '../../../store/onboardingStore';
import { useSessionStore } from '../../../store/sessionStore';
import { useSyncStatusStore } from '../../../store/syncStatusStore';
import { synchronizeFinancialData } from '../../../services/sync/financialSync';
import { getLanguageOption } from '../../../services/localization/languages';
import { normalizeCurrencyCode } from '../../../constants/currencies';
import { AppDialog, type AppDialogAction } from '../../../components/ui/AppDialog';
import { useTabContentBottomInset } from '../../../hooks/useTabContentBottomInset';
import { formatCountryCurrency } from '../../../services/localization/countries';
import { useProfileImageUri } from '../../../hooks/useProfileImageUri';
import { resolveProfileDisplayName } from '../../../utils/profileDisplayName';

interface DialogState {
  title: string;
  message: string;
  actions: AppDialogAction[];
}

export default function ProfileScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { answers, resetOnboarding } = useOnboardingStore();
  const { user, signOut } = useSessionStore();
  const syncStatus = useSyncStatusStore((state) => state.status);
  const lastSyncedAt = useSyncStatusStore((state) => state.lastSyncedAt);
  const [failedImageUri, setFailedImageUri] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const contentBottomInset = useTabContentBottomInset();

  const storedProfileImage = typeof answers.profileImage === 'string' ? answers.profileImage.trim() : '';
  const profileImageUri = useProfileImageUri(storedProfileImage);
  const showProfileImage = profileImageUri.length > 0 && failedImageUri !== profileImageUri;
  const employmentLabel = String(answers.employmentStatus
    ? t(`onboarding.options.${answers.employmentStatus}`, answers.employmentStatus)
    : t('profile.statusNotSet'));
  const locale = i18n.resolvedLanguage || i18n.language;
  const currentCurrencyCode = normalizeCurrencyCode(answers.currency);
  const currentRegion = formatCountryCurrency(answers.country, currentCurrencyCode, locale) || t('profile.region.notSet');
  const currentLanguage = getLanguageOption(i18n.resolvedLanguage || i18n.language).label;
  const displayName = resolveProfileDisplayName(answers.preferredName, user, t('profile.guestUser'));
  const openProfileEditor = () => router.push('/profile/edit');

  const handleResetData = () => {
    setDialog({
      title: t('profile.resetDialog.title'),
      message: t('profile.resetDialog.message'),
      actions: [
        { label: t('profile.resetDialog.cancel') },
        {
          label: t('profile.resetDialog.confirm'),
          destructive: true,
          onPress: () => {
            resetOnboarding();
            router.replace('/onboarding/welcome');
          },
        },
      ],
    });
  };

  const renderSectionHeader = (title: string) => (
    <AppText variant="labelSm" style={styles.sectionHeader} role="heading" aria-level={2}>
      {title}
    </AppText>
  );

  interface RowProps {
    icon: string;
    title: string;
    route: string;
    value?: string;
    isDestructive?: boolean;
  }

  const renderRow = ({ icon, title, route, value, isDestructive }: RowProps) => (
    <TouchableOpacity
      key={route}
      style={styles.row}
      onPress={() => router.push(route as any)}
      accessibilityRole="button"
      accessibilityLabel={value ? `${title}. ${value}` : title}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, isDestructive && styles.destructiveIconBox]}>
          <Ionicons
            name={icon as any}
            size={18}
            color={isDestructive ? COLORS.error : COLORS.primary}
            accessible={false}
          />
        </View>

        <View style={styles.rowCopy}>
          <AppText variant="bodySemiBold" style={[styles.rowTitle, isDestructive && styles.destructiveText]}>
            {title}
          </AppText>
          {value ? (
            <AppText variant="supporting" style={styles.rowValue} numberOfLines={1}>
              {value}
            </AppText>
          ) : null}
        </View>

      </View>
      <Ionicons
        name={I18nManager.isRTL ? 'chevron-back' : 'chevron-forward'}
        size={16}
        color={isDestructive ? COLORS.error : COLORS.textSecondary}
        accessible={false}
      />
    </TouchableOpacity>
  );

  const getInitials = () => {
    return displayName.substring(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: contentBottomInset }]}
        showsVerticalScrollIndicator={false}
        role="main"
        accessibilityLabel={t('profile.title')}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={openProfileEditor}
            accessibilityRole="button"
            accessibilityLabel={t('profile.avatar.change')}
            accessibilityHint={t('profile.avatar.changeHint')}
          >
            {showProfileImage ? (
              <Image
                source={{ uri: profileImageUri }}
                style={styles.avatarImage}
                onError={() => setFailedImageUri(profileImageUri)}
                accessible={false}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <AppText variant="headlineMd" style={styles.avatarInitials}>{getInitials()}</AppText>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Ionicons name="camera" size={14} color={COLORS.onAction} accessible={false} />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <AppText variant="cardTitle" style={styles.profileName} numberOfLines={1} role="heading" aria-level={1}>
              {displayName}
            </AppText>
            <AppText variant="bodySemiBold" style={styles.profileMeta} numberOfLines={1}>
              {employmentLabel}
            </AppText>
          </View>
          <TouchableOpacity
            style={styles.editHeaderBtn}
            onPress={openProfileEditor}
            accessibilityRole="button"
            accessibilityLabel={t('profile.editProfile')}
            accessibilityHint={t('profile.editProfileHint')}
          >
            <Ionicons name="create-outline" size={20} color={COLORS.primary} accessible={false} />
          </TouchableOpacity>
        </View>

        {user ? (
          <TouchableOpacity
            style={styles.syncCard}
            onPress={() => { if (syncStatus === 'failed' || syncStatus === 'offline') void synchronizeFinancialData(); }}
            disabled={syncStatus !== 'failed' && syncStatus !== 'offline'}
            accessibilityRole="button"
          >
            <Ionicons name={syncStatus === 'synced' ? 'cloud-done-outline' : 'cloud-upload-outline'} size={20} color={COLORS.primary} />
            <View style={styles.syncText}>
              <AppText variant="bodySemiBold" style={styles.syncTitle}>{t(`sync.${syncStatus}`, syncStatus)}</AppText>
              <AppText variant="caption" style={styles.syncDetail}>
                {lastSyncedAt ? t('sync.lastSynced', { time: new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(lastSyncedAt)) }) : t('sync.localNotice')}
              </AppText>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.localModeCard}>
            <Ionicons name="phone-portrait-outline" size={22} color={COLORS.primary} />
            <View style={styles.syncText}>
              <AppText variant="bodySemiBold" style={styles.syncTitle}>{t('onboarding.account.localTitle')}</AppText>
              <AppText variant="supporting" style={styles.syncDetail}>{t('onboarding.account.localBody')}</AppText>
              <Button title={t('onboarding.account.syncAction')} onPress={() => router.push('/auth')} variant="text" style={styles.cloudButton} />
            </View>
          </View>
        )}

        {/* Section: Account */}
        <Card style={styles.sectionCard} shadow="none">
          {renderSectionHeader(t('profile.sections.account'))}
          {renderRow({ icon: 'person-outline', title: t('profile.rows.personalInfo'), route: '/profile/edit' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'briefcase-outline', title: t('profile.rows.incomeEmployment'), route: '/profile/income' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'people-outline', title: t('profile.rows.familyDependants'), route: '/profile/family' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'cash-outline', title: t('profile.rows.currencyRegion'), value: currentRegion, route: '/profile/region' })}
        </Card>

        {/* Section: Financial Management */}
        <Card style={styles.sectionCard} shadow="none">
          {renderSectionHeader(t('profile.sections.financialManagement'))}
          {renderRow({ icon: 'card-outline', title: t('profile.rows.debtTracker'), route: '/profile/debts' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'trophy-outline', title: t('profile.rows.goalsExpenses'), route: '/profile/goals' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'calendar-outline', title: t('profile.rows.recurringBills'), route: '/profile/bills' })}
        </Card>

        {/* Section: Preferences */}
        <Card style={styles.sectionCard} shadow="none">
          {renderSectionHeader(t('profile.sections.preferences'))}
          {renderRow({ icon: 'globe-outline', title: t('profile.rows.language'), value: currentLanguage, route: '/profile/language' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'notifications-outline', title: t('profile.rows.notifications'), route: '/profile/notifications' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'color-palette-outline', title: t('profile.rows.appearance'), route: '/profile/appearance' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'body-outline', title: t('profile.rows.accessibility'), route: '/profile/accessibility' })}
        </Card>

        {/* Section: Privacy and Security */}
        <Card style={styles.sectionCard} shadow="none">
          {renderSectionHeader(t('profile.sections.privacySecurity'))}
          {renderRow({ icon: 'shield-checkmark-outline', title: t('profile.rows.security'), route: '/profile/security' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'lock-closed-outline', title: t('profile.rows.privacyCentre'), route: '/profile/privacy' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'download-outline', title: t('profile.rows.exportData'), route: '/profile/export-data' })}
          {user ? (
            <>
              <View style={styles.divider} />
              {renderRow({
                icon: 'trash-outline',
                title: t('profile.rows.deleteAccount'),
                route: '/profile/delete-account',
                isDestructive: true,
              })}
            </>
          ) : null}
        </Card>

        {/* Section: Support */}
        <Card style={styles.sectionCard} shadow="none">
          {renderSectionHeader(t('profile.sections.support'))}
          {renderRow({ icon: 'help-circle-outline', title: t('profile.rows.helpSupport'), route: '/profile/help' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'mail-outline', title: t('profile.rows.contactSupport'), route: '/profile/contact' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'list-outline', title: t('profile.rows.faq'), route: '/profile/faq' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'bug-outline', title: t('profile.rows.reportProblem'), route: '/profile/report-problem' })}
        </Card>

        {/* Section: Legal */}
        <Card style={styles.sectionCard} shadow="none">
          {renderSectionHeader(t('profile.sections.legal'))}
          {renderRow({ icon: 'document-text-outline', title: t('profile.rows.privacyPolicy'), route: '/profile/legal/privacy' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'reader-outline', title: t('profile.rows.termsUse'), route: '/profile/legal/terms' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'alert-circle-outline', title: t('profile.rows.financialDisclaimer'), route: '/profile/legal/financial-disclaimer' })}
          <View style={styles.divider} />
          {renderRow({ icon: 'ribbon-outline', title: t('profile.rows.licenses'), route: '/profile/legal/licenses' })}
        </Card>

        {/* Section: About */}
        <Card style={styles.sectionCard} shadow="none">
          {renderSectionHeader(t('profile.sections.about'))}
          {renderRow({ icon: 'apps-outline', title: t('profile.rows.appInfo'), route: '/profile/about' })}
        </Card>

        {/* Developer Section */}
        {__DEV__ && (
          <Card style={[styles.sectionCard, styles.devCard]} shadow="none">
            {renderSectionHeader(t('profile.devTools'))}
            <AppText variant="supporting" style={styles.devNotice}>
              {t('profile.devNoticeText')}
            </AppText>
            <Button
              title={t('profile.resetOnboardingAssessment')}
              onPress={handleResetData}
              variant="destructive"
              style={styles.devResetBtn}
            />
          </Card>
        )}

        {/* Standard User Logout */}
        {user && (
          <Button
            title={t('profile.signOutAccount')}
            onPress={async () => {
              await AsyncStorage.setItem('pocket-ahead-welcome-back', 'true');
              await signOut();
              router.replace('/auth');
            }}
            variant="secondary"
            style={styles.signOutBtn}
          />
        )}

      </ScrollView>
      <AppDialog
        visible={dialog !== null}
        title={dialog?.title || ''}
        message={dialog?.message || ''}
        actions={dialog?.actions || []}
        onRequestClose={() => setDialog(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
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
  },
  syncCard: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  localModeCard: {
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  cloudButton: { alignSelf: 'flex-start', minHeight: 44, marginTop: SPACING.sm, borderWidth: 1, borderColor: COLORS.outlineVariant },
  syncText: { flex: 1 },
  syncTitle: { color: COLORS.textPrimary, textTransform: 'capitalize' },
  syncDetail: { color: COLORS.textSecondary },
  avatarContainer: {
    width: 64,
    height: 64,
    marginEnd: SPACING.md,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryContainer,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarEditBadge: {
    position: 'absolute',
    end: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.action,
    borderWidth: 2,
    borderColor: COLORS.surfaceContainerLowest,
  },
  avatarInitials: {
    color: COLORS.white,
  },
  profileInfo: {
    minWidth: 0,
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  profileMeta: {
    color: COLORS.emerald,
  },
  editHeaderBtn: {
    width: 44,
    height: 44,
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
    color: COLORS.textSecondary,
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
    minWidth: 0,
    flex: 1,
  },
  rowCopy: {
    minWidth: 0,
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
    backgroundColor: COLORS.errorBackground,
  },
  rowTitle: {
    color: COLORS.textPrimary,
  },
  rowValue: {
    marginTop: 2,
    color: COLORS.textSecondary,
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
    backgroundColor: COLORS.warningBackground,
  },
  devNotice: {
    color: COLORS.textSecondary,
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
