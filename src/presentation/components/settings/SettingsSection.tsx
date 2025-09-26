import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  testID?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children,
  testID,
}) => {
  return (
    <View style={styles.section} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.title} allowFontScaling={true}>
          {title}
        </Text>
        {description && (
          <Text style={styles.description} allowFontScaling={true}>
            {description}
          </Text>
        )}
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: Spacing.lg,
  },

  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.gray100,
  },

  title: {
    ...Typography.heading3,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },

  description: {
    ...Typography.body2,
    color: Colors.text.secondary,
    lineHeight: 20,
  },

  content: {
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingVertical: Spacing.xs,
  },
});