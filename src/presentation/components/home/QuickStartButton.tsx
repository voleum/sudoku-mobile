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

interface QuickStartButtonProps {
  onPress: () => void;
  disabled?: boolean;
}

export const QuickStartButton: React.FC<QuickStartButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  return (
    <Card
      pressable
      onPress={onPress}
      style={StyleSheet.flatten([styles.card, disabled && styles.disabled])}
      testID="quick-start-button"
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>⚡</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>БЫСТРАЯ ИГРА</Text>
          <Text style={styles.subtitle}>Начать с рекомендуемой сложности</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>▶</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.screen,
    marginVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderWidth: 0,
  },

  disabled: {
    opacity: 0.5,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconContainer: {
    marginRight: Spacing.md,
  },

  icon: {
    fontSize: Typography.fontSize['2xl'],
  },

  textContainer: {
    flex: 1,
  },

  title: {
    ...Typography.heading4,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },

  subtitle: {
    ...Typography.body2,
    color: Colors.white,
    opacity: 0.9,
  },

  arrowContainer: {
    marginLeft: Spacing.md,
  },

  arrow: {
    ...Typography.heading3,
    color: Colors.white,
  },
});