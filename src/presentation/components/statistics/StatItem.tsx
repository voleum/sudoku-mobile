import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

interface StatItemProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  description?: string;
  horizontal?: boolean;
  testID?: string;
}

export const StatItem: React.FC<StatItemProps> = ({
  label,
  value,
  icon,
  color = Colors.primary,
  description,
  horizontal = false,
  testID,
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'number') {
      return val.toString();
    }
    return val;
  };

  if (horizontal) {
    return (
      <View style={styles.horizontalContainer} testID={testID}>
        <View style={styles.horizontalLabelSection}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={styles.horizontalLabel}>{label}</Text>
        </View>
        <Text style={[styles.horizontalValue, { color }]}>
          {formatValue(value)}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.verticalContainer} testID={testID}>
      {icon && <Text style={styles.iconLarge}>{icon}</Text>}
      <Text style={[styles.value, { color }]}>
        {formatValue(value)}
      </Text>
      <Text style={styles.label}>{label}</Text>
      {description && (
        <Text style={styles.description}>{description}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Вертикальная ориентация (по умолчанию)
  verticalContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    flex: 1,
  },

  value: {
    ...Typography.heading2,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },

  label: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },

  description: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
    fontSize: Typography.fontSize.xs,
  },

  iconLarge: {
    fontSize: Typography.fontSize.xl,
    marginBottom: Spacing.sm,
  },

  // Горизонтальная ориентация
  horizontalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },

  horizontalLabelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  horizontalLabel: {
    ...Typography.body1,
    color: Colors.text.primary,
    marginLeft: Spacing.sm,
  },

  horizontalValue: {
    ...Typography.heading4,
    fontWeight: 'bold',
  },

  icon: {
    fontSize: Typography.fontSize.lg,
  },
});