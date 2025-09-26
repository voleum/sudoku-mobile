import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { Card } from '../common/Card';

interface QuickActionItem {
  id: string;
  title: string;
  subtitle?: string;
  emoji: string;
  onPress: () => void;
}

interface QuickActionsSectionProps {
  actions: QuickActionItem[];
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  actions,
}) => {
  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <Card
          key={action.id}
          pressable
          onPress={action.onPress}
          style={styles.actionCard}
          testID={`quick-action-${action.id}`}
        >
          <Text style={styles.emoji}>{action.emoji}</Text>
          <Text style={styles.title}>{action.title}</Text>
          {action.subtitle && (
            <Text style={styles.subtitle}>{action.subtitle}</Text>
          )}
        </Card>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.screen,
    gap: Spacing.sm,
  },

  actionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    minHeight: 100,
  },

  emoji: {
    fontSize: Typography.fontSize['2xl'],
    marginBottom: Spacing.sm,
  },

  title: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
  },

  subtitle: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});