import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';
import { openSupportEmail } from '../../services/support/openSupportEmail';

export default function ContactScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      Alert.alert(t('common.error', 'Error'), t('support.contact.allFieldsRequired'));
      return;
    }

    setLoading(true);
    try {
      await openSupportEmail(subject.trim(), message.trim());
    } catch {
      Alert.alert(t('common.error', 'Error'), t('support.contact.openFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel={t('support.accessibility.back')}
          onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/profile')}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.rows.contactSupport')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Text style={styles.sectionHeader}>{t('support.contact.formTitle')}</Text>
          
          <View style={styles.field}>
            <Text style={styles.label}>{t('support.contact.subject')}</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder={t('support.contact.subjectPlaceholder')}
              placeholderTextColor={COLORS.textSecondary}
              accessibilityLabel={t('support.contact.subject')}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('support.contact.message')}</Text>
            <TextInput
              style={[styles.input, styles.multilineInput]}
              value={message}
              onChangeText={setMessage}
              placeholder={t('support.contact.messagePlaceholder')}
              placeholderTextColor={COLORS.textSecondary}
              multiline
              numberOfLines={6}
              accessibilityLabel={t('support.contact.message')}
            />
          </View>

          <Button
            title={loading ? t('support.contact.opening') : t('support.contact.submit')}
            onPress={handleSubmit}
            disabled={loading}
          />
        </Card>
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
  card: {
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
  multilineInput: {
    height: 120,
    paddingVertical: SPACING.sm,
    textAlignVertical: 'top',
  },
});
