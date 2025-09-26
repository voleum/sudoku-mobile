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

interface GameStats {
  totalGames: number;
  averageTime: number; // in seconds
  bestTime: number; // in seconds
  winRate: number; // percentage
  currentStreak: number;
  totalErrors: number;
  averageErrors: number;
}

interface StatsPreviewProps {
  stats: GameStats;
  onPress?: () => void;
}

export const StatsPreview: React.FC<StatsPreviewProps> = ({
  stats,
  onPress,
}) => {
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
  };

  return (
    <Card
      pressable={!!onPress}
      onPress={onPress}
      style={styles.card}
      testID="stats-preview"
    >
      <View style={styles.header}>
        <Text style={styles.title}>ВАША СТАТИСТИКА</Text>
        <Text style={styles.icon}>📊</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.totalGames}</Text>
          <Text style={styles.statLabel}>Игр сыграно</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatPercentage(stats.winRate)}</Text>
          <Text style={styles.statLabel}>Побед</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatTime(stats.bestTime)}</Text>
          <Text style={styles.statLabel}>Лучшее время</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.currentStreak}</Text>
          <Text style={styles.statLabel}>Серия побед</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>
            Среднее время: <Text style={styles.progressValue}>{formatTime(stats.averageTime)}</Text>
          </Text>
        </View>
        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>
            Средние ошибки: <Text style={styles.progressValue}>{stats.averageErrors.toFixed(1)}</Text>
          </Text>
        </View>
      </View>

      {onPress && (
        <View style={styles.footer}>
          <Text style={styles.viewMore}>Подробная статистика ▶</Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.screen,
    marginVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  title: {
    ...Typography.heading4,
    color: Colors.text.primary,
  },

  icon: {
    fontSize: Typography.fontSize.xl,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statValue: {
    ...Typography.heading3,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },

  statLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  progressSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.md,
    marginBottom: Spacing.sm,
  },

  progressItem: {
    marginBottom: Spacing.xs,
  },

  progressLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },

  progressValue: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },

  footer: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },

  viewMore: {
    ...Typography.body2,
    color: Colors.primary,
    fontWeight: '600',
  },
});