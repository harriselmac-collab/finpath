import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useSessionStore } from '../../store/sessionStore';
import { supabase } from '../../services/supabase/supabaseClient';

export default function EditProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { answers, setAnswers } = useOnboardingStore();
  const { user, syncOnboardingAnswers } = useSessionStore();

  const [preferredName, setPreferredName] = useState(answers.preferredName || '');
  const [country, setCountry] = useState(answers.country || '');
  const [city, setCity] = useState(answers.city || '');
  const [currency, setCurrency] = useState(answers.currency || 'MAD');
  const [ageRange, setAgeRange] = useState(answers.ageRange || '');
  const [employmentStatus, setEmploymentStatus] = useState(answers.employmentStatus || '');
  const [occupation, setOccupation] = useState(answers.occupation || '');
  const [householdStatus, setHouseholdStatus] = useState(answers.householdStatus || '');
  const [profileImage, setProfileImage] = useState(answers.profileImage || '');

  const isDirty = 
    preferredName !== (answers.preferredName || '') ||
    country !== (answers.country || '') ||
    city !== (answers.city || '') ||
    currency !== (answers.currency || '') ||
    ageRange !== (answers.ageRange || '') ||
    employmentStatus !== (answers.employmentStatus || '') ||
    occupation !== (answers.occupation || '') ||
    householdStatus !== (answers.householdStatus || '') ||
    profileImage !== (answers.profileImage || '');

  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    if (isDirty) {
      Alert.alert(
        t('common.discardConfirmTitle', 'Discard Changes?'),
        t('common.discardConfirmMsg', 'You have unsaved profile changes. Are you sure you want to discard them?'),
        [
          { text: t('common.keepEditing', 'Keep Editing'), style: 'cancel' },
          { text: t('common.discard', 'Discard'), style: 'destructive', onPress: () => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile') },
        ]
      );
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/profile');
      }
    }
  };

  const handleSave = async () => {
    if (!preferredName.trim()) {
      Alert.alert(t('common.error', 'Error'), t('common.nameRequired', 'Preferred name is required.'));
      return;
    }

    setLoading(true);
    try {
      const updatedAnswers = {
        ...answers,
        preferredName: preferredName.trim(),
        country: country.trim(),
        city: city.trim(),
        currency: currency.trim(),
        ageRange: ageRange.trim(),
        employmentStatus: employmentStatus.trim(),
        occupation: occupation.trim(),
        householdStatus: householdStatus.trim(),
        profileImage: profileImage.trim(),
      };

      if (user) {
        await syncOnboardingAnswers(updatedAnswers, true);
        const isMockSupabase = !process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL.includes('mock-url.supabase.co');
        if (!isMockSupabase) {
          await supabase.from('profiles').upsert(
            {
              user_id: user.id,
              preferred_name: preferredName.trim(),
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id' }
          );
        }
      }

      setAnswers(updatedAnswers);
      
      Alert.alert(t('common.success', 'Success'), t('common.saved', 'Profile updated successfully!'), [
        { text: t('common.ok', 'OK'), onPress: () => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile') }
      ]);
    } catch (err: any) {
      Alert.alert(t('common.error', 'Error'), err.message || t('common.saveFailed', 'Failed to save changes.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings.edit.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Form Fields */}
        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>{t('settings.edit.personal')}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t('settings.edit.preferredName')}</Text>
            <TextInput
              style={styles.input}
              value={preferredName}
              onChangeText={setPreferredName}
              placeholder="e.g., Kasper"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('settings.edit.profileImage')}</Text>
            <TextInput
              style={styles.input}
              value={profileImage}
              onChangeText={setProfileImage}
              placeholder="e.g., https://example.com/avatar.png"
              placeholderTextColor={COLORS.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('settings.edit.ageRange')}</Text>
            <TextInput
              style={styles.input}
              value={ageRange}
              onChangeText={setAgeRange}
              placeholder="e.g., 25-34"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>{t('settings.edit.employment')}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t('settings.edit.employmentStatus')}</Text>
            <TextInput
              style={styles.input}
              value={employmentStatus}
              onChangeText={setEmploymentStatus}
              placeholder="e.g., employed, self-employed, student"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('settings.edit.occupation')}</Text>
            <TextInput
              style={styles.input}
              value={occupation}
              onChangeText={setOccupation}
              placeholder="e.g., Software Engineer"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </Card>

        <Card style={styles.formCard}>
          <Text style={styles.sectionTitle}>{t('settings.edit.geography')}</Text>

          <View style={styles.field}>
            <Text style={styles.label}>{t('settings.edit.country')}</Text>
            <TextInput
              style={styles.input}
              value={country}
              onChangeText={setCountry}
              placeholder="e.g., Morocco"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('settings.edit.city')}</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="e.g., Casablanca"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('settings.edit.currency')}</Text>
            <TextInput
              style={styles.input}
              value={currency}
              onChangeText={setCurrency}
              placeholder="e.g., MAD"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('settings.edit.household')}</Text>
            <TextInput
              style={styles.input}
              value={householdStatus}
              onChangeText={setHouseholdStatus}
              placeholder="e.g., single, married with 2 kids"
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>
        </Card>

        <Button
          title={loading ? t('common.saving', 'Saving...') : t('settings.edit.save')}
          onPress={handleSave}
          disabled={loading}
          style={styles.saveBtn}
        />
        <View style={{ height: 50 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    height: 56,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: SPACING.md,
    gap: SPACING.md,
  },
  formCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: SPACING.md,
  },
  field: {
    marginBottom: SPACING.md,
  },
  label: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: SPACING.md,
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
  saveBtn: {
    marginTop: SPACING.sm,
    width: '100%',
  },
});
