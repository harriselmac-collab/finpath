import React, { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import {
  ActivityIndicator,
  Image,
  I18nManager,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppText from '../../components/Text/AppText';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { supabase } from '../../services/supabase/supabaseClient';
import { isInlineProfileImage, removeProfileImage, uploadProfileImage } from '../../services/supabase/profileImages';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useSessionStore } from '../../store/sessionStore';
import { createStoredProfileImage, getCenteredSquareCrop } from '../../utils/profileImage';
import { AppDialog, type AppDialogAction } from '../../components/ui/AppDialog';
import { useProfileImageUri } from '../../hooks/useProfileImageUri';

const EMPLOYMENT_OPTIONS = ['employed', 'self-employed', 'unemployed', 'retired'] as const;

interface DialogState {
  title: string;
  message: string;
  actions: AppDialogAction[];
}

const subscribeToHydration = (onStoreChange: () => void) =>
  useOnboardingStore.persist.onFinishHydration(onStoreChange);
const getHydrationSnapshot = () => useOnboardingStore.persist.hasHydrated();

async function prepareProfileImage(asset: ImagePicker.ImagePickerAsset) {
  const context = ImageManipulator.manipulate(asset.uri);
  const crop = getCenteredSquareCrop(asset.width, asset.height);
  if (crop) {
    context.crop(crop);
    context.resize({ width: 512, height: 512 });
  } else {
    context.resize({ width: 512 });
  }

  const rendered = await context.renderAsync();
  const saved = await rendered.saveAsync({
    base64: true,
    compress: 0.72,
    format: SaveFormat.JPEG,
  });
  if (!saved.base64) throw new Error('Missing encoded image data');
  return createStoredProfileImage(saved.base64);
}

export default function EditProfileScreen() {
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    () => false,
  );

  if (!hydrated) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.action} />
      </SafeAreaView>
    );
  }

  return <EditProfileForm />;
}

function EditProfileForm() {
  const router = useRouter();
  const { t } = useTranslation();
  const { answers, setAnswers } = useOnboardingStore();
  const { user, syncOnboardingAnswers } = useSessionStore();

  const [preferredName, setPreferredName] = useState(answers.preferredName || '');
  const [country, setCountry] = useState(answers.country || '');
  const [city, setCity] = useState(answers.city || '');
  const [ageRange, setAgeRange] = useState(answers.ageRange || '');
  const [employmentStatus, setEmploymentStatus] = useState(answers.employmentStatus || '');
  const [occupation, setOccupation] = useState(answers.occupation || '');
  const [householdStatus, setHouseholdStatus] = useState(answers.householdStatus || '');
  const [profileImage, setProfileImage] = useState(answers.profileImage || '');
  const profileImageUri = useProfileImageUri(profileImage);
  const [loading, setLoading] = useState(false);
  const [pickingPhoto, setPickingPhoto] = useState(false);
  const [failedPreviewUri, setFailedPreviewUri] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const isDirty =
    preferredName !== (answers.preferredName || '') ||
    country !== (answers.country || '') ||
    city !== (answers.city || '') ||
    ageRange !== (answers.ageRange || '') ||
    employmentStatus !== (answers.employmentStatus || '') ||
    occupation !== (answers.occupation || '') ||
    householdStatus !== (answers.householdStatus || '') ||
    profileImage !== (answers.profileImage || '');

  const initials = (preferredName.trim() || user?.email || 'PA')
    .slice(0, 2)
    .toUpperCase();

  const showMessage = useCallback((title: string, message: string, onPress?: () => void) => {
    setDialog({
      title,
      message,
      actions: [{ label: t('profile.edit.ok'), onPress }],
    });
  }, [t]);

  const handleBack = () => {
    const leave = () => router.canGoBack()
      ? router.back()
      : router.replace('/(tabs)/profile');

    if (!isDirty) {
      leave();
      return;
    }

    setDialog({
      title: t('profile.edit.discardTitle'),
      message: t('profile.edit.discardMessage'),
      actions: [
        { label: t('profile.edit.keepEditing') },
        { label: t('profile.edit.discard'), destructive: true, onPress: leave },
      ],
    });
  };

  const handleChoosePhoto = async () => {
    if (pickingPhoto) return;
    setPickingPhoto(true);

    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          showMessage(
            t('profile.edit.photoPermissionTitle'),
            t('profile.edit.photoPermissionMessage'),
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });

      if (result.canceled || !result.assets[0]) return;

      const dataUri = await prepareProfileImage(result.assets[0]);
      if (!dataUri) {
        showMessage(t('profile.edit.photoErrorTitle'), t('profile.edit.photoTooLarge'));
        return;
      }

      setFailedPreviewUri(null);
      setProfileImage(dataUri);
    } catch {
      showMessage(t('profile.edit.photoErrorTitle'), t('profile.edit.photoErrorMessage'));
    } finally {
      setPickingPhoto(false);
    }
  };

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let active = true;

    ImagePicker.getPendingResultAsync().then(async (result) => {
      if (!active || !result || !('assets' in result) || result.canceled || !result.assets[0]) return;
      setPickingPhoto(true);
      try {
        const dataUri = await prepareProfileImage(result.assets[0]);
        if (!active) return;
        if (!dataUri) {
          showMessage(t('profile.edit.photoErrorTitle'), t('profile.edit.photoTooLarge'));
          return;
        }
        setFailedPreviewUri(null);
        setProfileImage(dataUri);
      } catch {
        if (active) showMessage(t('profile.edit.photoErrorTitle'), t('profile.edit.photoErrorMessage'));
      } finally {
        if (active) setPickingPhoto(false);
      }
    }).catch(() => {
      if (active) setPickingPhoto(false);
    });

    return () => {
      active = false;
    };
  }, [showMessage, t]);

  const handleSave = async () => {
    if (!preferredName.trim()) {
      showMessage(t('profile.edit.error'), t('profile.edit.nameRequired'));
      return;
    }

    setLoading(true);
    try {
      let storedProfileImage = profileImage;
      if (user && isInlineProfileImage(profileImage)) {
        storedProfileImage = await uploadProfileImage(user.id, profileImage);
      } else if (user && !profileImage && answers.profileImage && !isInlineProfileImage(answers.profileImage)) {
        await removeProfileImage(answers.profileImage);
      }

      const updatedAnswers = {
        ...answers,
        preferredName: preferredName.trim(),
        country: country.trim(),
        city: city.trim(),
        ageRange: ageRange.trim(),
        employmentStatus: employmentStatus.trim(),
        occupation: occupation.trim(),
        householdStatus: householdStatus.trim(),
        profileImage: storedProfileImage,
      };

      if (user) {
        await syncOnboardingAnswers(updatedAnswers, true);
        const isMockSupabase = !process.env.EXPO_PUBLIC_SUPABASE_URL
          || process.env.EXPO_PUBLIC_SUPABASE_URL.includes('mock-url.supabase.co');
        if (!isMockSupabase) {
          const { error } = await supabase.from('profiles').upsert(
            {
              user_id: user.id,
              preferred_name: preferredName.trim(),
              profile_image: storedProfileImage || null,
              country: country.trim() || null,
              city: city.trim() || null,
              currency: answers.currency || 'MAD',
              age_range: ageRange.trim() || null,
              employment_status: employmentStatus || null,
              occupation: occupation.trim() || null,
              household_status: householdStatus.trim() || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' },
          );
          if (error) throw error;
        }
      }

      setAnswers(updatedAnswers);
      setProfileImage(storedProfileImage);
      showMessage(
        t('profile.edit.success'),
        t('profile.edit.saveSuccess'),
        () => router.canGoBack()
            ? router.back()
            : router.replace('/(tabs)/profile'),
      );
    } catch (error) {
      console.warn('Profile save failed', error);
      showMessage(t('profile.edit.error'), t('profile.edit.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          accessibilityRole="button"
          accessibilityLabel={t('profile.edit.back')}
        >
          <Ionicons
            name={I18nManager.isRTL ? 'arrow-forward' : 'arrow-back'}
            size={24}
            color={COLORS.primary}
            accessible={false}
          />
        </TouchableOpacity>
        <AppText variant="bodySemiBold" style={styles.headerTitle} role="heading" aria-level={1}>
          {t('profile.edit.title')}
        </AppText>
        <View style={styles.headerBalance} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        role="main"
      >
        <Card style={styles.photoCard} shadow="none">
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={handleChoosePhoto}
            disabled={pickingPhoto}
            accessibilityRole="button"
            accessibilityLabel={profileImage ? t('profile.edit.changePhoto') : t('profile.edit.choosePhoto')}
            accessibilityHint={t('profile.avatar.changeHint')}
            accessibilityState={{ busy: pickingPhoto, disabled: pickingPhoto }}
          >
            {profileImageUri && failedPreviewUri !== profileImageUri ? (
              <Image
                source={{ uri: profileImageUri }}
                style={styles.avatarImage}
                onError={() => setFailedPreviewUri(profileImageUri)}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <AppText variant="headlineMd" style={styles.avatarInitials}>{initials}</AppText>
              </View>
            )}
            <View style={styles.photoBadge}>
              <Ionicons name="camera-outline" size={18} color={COLORS.onAction} accessible={false} />
            </View>
          </TouchableOpacity>
          <View style={styles.photoCopy}>
            <AppText variant="bodySemiBold" style={styles.photoTitle}>
              {profileImage ? t('profile.edit.changePhoto') : t('profile.edit.choosePhoto')}
            </AppText>
            <AppText variant="supporting" style={styles.photoHint}>
              {t('profile.edit.photoHint')}
            </AppText>
          </View>
          <View style={styles.photoActions}>
            <Button
              title={profileImage ? t('profile.edit.changePhoto') : t('profile.edit.choosePhoto')}
              onPress={handleChoosePhoto}
              variant="secondary"
              loading={pickingPhoto}
              style={styles.photoAction}
            />
            {profileImage ? (
              <Button
                title={t('profile.edit.removePhoto')}
                onPress={() => setProfileImage('')}
                variant="text"
                style={styles.photoAction}
              />
            ) : null}
          </View>
        </Card>

        <Card style={styles.formCard} shadow="none">
          <AppText variant="bodySemiBold" style={styles.sectionTitle} role="heading" aria-level={2}>
            {t('profile.edit.personal')}
          </AppText>
          <Input
            label={t('profile.edit.preferredName')}
            value={preferredName}
            onChangeText={setPreferredName}
            placeholder={t('profile.edit.preferredNamePlaceholder')}
            autoCapitalize="words"
          />
          <Input
            label={t('profile.edit.ageRange')}
            value={ageRange}
            onChangeText={setAgeRange}
            placeholder={t('profile.edit.ageRangePlaceholder')}
          />
        </Card>

        <Card style={styles.formCard} shadow="none">
          <AppText variant="bodySemiBold" style={styles.sectionTitle} role="heading" aria-level={2}>
            {t('profile.edit.employment')}
          </AppText>
          <AppText variant="inputLabel" style={styles.employmentLabel}>
            {t('profile.edit.employmentStatus')}
          </AppText>
          <View style={styles.employmentOptions} accessibilityRole="radiogroup">
            {EMPLOYMENT_OPTIONS.map((option) => {
              const selected = employmentStatus === option;
              return (
                <Pressable
                  key={option}
                  style={[styles.employmentOption, selected && styles.employmentOptionSelected]}
                  onPress={() => setEmploymentStatus(option)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                >
                  <AppText variant="bodyMedium" style={styles.employmentOptionText}>
                    {t(`onboarding.options.${option}`)}
                  </AppText>
                  <Ionicons
                    name={selected ? 'radio-button-on' : 'radio-button-off'}
                    size={20}
                    color={selected ? COLORS.emerald : COLORS.textSecondary}
                    accessible={false}
                  />
                </Pressable>
              );
            })}
          </View>
          <Input
            label={t('profile.edit.occupation')}
            value={occupation}
            onChangeText={setOccupation}
            placeholder={t('profile.edit.occupationPlaceholder')}
          />
        </Card>

        <Card style={styles.formCard} shadow="none">
          <AppText variant="bodySemiBold" style={styles.sectionTitle} role="heading" aria-level={2}>
            {t('profile.edit.geography')}
          </AppText>
          <Input
            label={t('profile.edit.country')}
            value={country}
            onChangeText={setCountry}
            placeholder={t('profile.edit.countryPlaceholder')}
          />
          <Input
            label={t('profile.edit.city')}
            value={city}
            onChangeText={setCity}
            placeholder={t('profile.edit.cityPlaceholder')}
          />
          <Input
            label={t('profile.edit.household')}
            value={householdStatus}
            onChangeText={setHouseholdStatus}
            placeholder={t('profile.edit.householdPlaceholder')}
          />
        </Card>

        <Button
          title={loading ? t('profile.edit.saving') : t('profile.edit.save')}
          onPress={handleSave}
          loading={loading}
          disabled={loading || pickingPhoto}
          style={styles.saveBtn}
        />
        <View style={styles.bottomSpacer} />
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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: COLORS.primary,
  },
  headerBalance: {
    width: 44,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: SPACING.containerPadding,
    gap: SPACING.md,
  },
  photoCard: {
    alignItems: 'center',
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  avatarButton: {
    width: 96,
    height: 96,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.round,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryContainer,
  },
  avatarInitials: {
    color: COLORS.onPrimaryContainer,
  },
  photoBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.action,
    borderWidth: 2,
    borderColor: COLORS.surfaceContainerLowest,
  },
  photoCopy: {
    alignItems: 'center',
    gap: 2,
  },
  photoTitle: {
    color: COLORS.textPrimary,
  },
  photoHint: {
    maxWidth: 420,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  photoActions: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  photoAction: {
    minWidth: 160,
    flexGrow: 1,
  },
  formCard: {
    gap: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  sectionTitle: {
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  employmentLabel: {
    color: COLORS.textPrimary,
  },
  employmentOptions: {
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  employmentOption: {
    minHeight: 48,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  employmentOptionSelected: {
    borderColor: COLORS.emerald,
    backgroundColor: COLORS.mintBackground,
  },
  employmentOptionText: {
    color: COLORS.textPrimary,
  },
  saveBtn: {
    width: '100%',
  },
  bottomSpacer: {
    height: 48,
  },
});
