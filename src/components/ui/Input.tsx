// src/components/ui/Input.tsx
import React, { useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  KeyboardTypeOptions,
} from 'react-native';
import AppText from '../../components/Text/AppText';

import { COLORS, SPACING, RADIUS, TYPOGRAPHY } from '../../constants/theme';

export interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  prefix?: string;
  multiline?: boolean;
  numberOfLines?: number;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  secureTextEntry = false,
  prefix,
  multiline = false,
  numberOfLines = 1,
  containerStyle,
  inputStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <AppText variant="inputLabel" style={styles.label}>
          {label}
        </AppText>
      )}
      <View
        style={[
          styles.inputContainer,
          multiline && styles.multilineContainer,
          isFocused && styles.focusedBorder,
          error ? styles.errorBorder : null,
        ]}
      >
        {prefix && (
          <View style={styles.prefixContainer}>
            <AppText variant="inputLabel" style={styles.prefixText}>
              {prefix}
            </AppText>
          </View>
        )}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.textInput,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          accessibilityLabel={label || placeholder}
        />
      </View>
      {error && (
        <AppText variant="caption" style={styles.errorText}>
          {error}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  label: {
    // We'll let the AppText handle the styling via variant, so we can remove the explicit styles
    // But we need to keep the marginBottom
    marginBottom: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
  },
  multilineContainer: {
    height: 100,
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
  },
  focusedBorder: {
    borderColor: COLORS.primary,
  },
  errorBorder: {
    borderColor: COLORS.error,
  },
  prefixContainer: {
    marginRight: SPACING.xs,
    justifyContent: 'center',
  },
  // prefixText is now handled by AppText with variant="inputLabel"
  prefixText: {},
  textInput: {
    flex: 1,
    height: '100%',
    ...TYPOGRAPHY.inputValue,
    color: COLORS.textPrimary,
    padding: 0,
  },
  multilineInput: {
    height: '100%',
    textAlignVertical: 'top',
  },
  errorText: {
    // We'll let the AppText handle the styling via variant="caption"
    marginTop: SPACING.xs,
  },
});