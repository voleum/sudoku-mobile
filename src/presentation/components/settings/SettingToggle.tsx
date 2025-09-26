import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

interface SettingToggleProps {
  title: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

export const SettingToggle: React.FC<SettingToggleProps> = ({
  title,
  description,
  value,
  onValueChange,
  disabled = false,
  testID,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, disabled && styles.disabled]}
      onPress={() => !disabled && onValueChange(!value)}
      activeOpacity={disabled ? 1 : 0.7}
      accessibilityRole="switch"
      accessibilityState={{
        checked: value,
        disabled,
      }}
      accessibilityLabel={title}
      accessibilityHint={description}
      testID={testID}
    >
      <View style={styles.content}>
        <Text
          style={[styles.title, disabled && styles.disabledText]}
          allowFontScaling={true}
        >
          {title}
        </Text>
        {description && (
          <Text
            style={[styles.description, disabled && styles.disabledText]}
            allowFontScaling={true}
          >
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: Colors.gray300,
          true: Colors.primaryLight,
        }}
        thumbColor={value ? Colors.primary : Colors.gray500}
        ios_backgroundColor={Colors.gray300}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    minHeight: Spacing.touchTarget + Spacing.md,
  },

  content: {
    flex: 1,
    marginRight: Spacing.md,
  },

  title: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },

  description: {
    ...Typography.body2,
    color: Colors.text.secondary,
    lineHeight: 18,
  },

  disabled: {
    opacity: 0.5,
  },

  disabledText: {
    color: Colors.text.tertiary,
  },
});