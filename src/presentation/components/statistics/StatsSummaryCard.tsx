import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { GameStatistics } from '../../../domain/types/GameTypes';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { Card } from '../common/Card';
import { StatItem } from './StatItem';

interface StatsSummaryCardProps {
  stats: GameStatistics;
  testID?: string;
}

export const StatsSummaryCard = React.memo<StatsSummaryCardProps>(({
  stats,
  testID,
}) => {
  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}с`;
    }
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) {
      return secs > 0 ? `${minutes}м ${secs}с` : `${minutes}м`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`;
  };

  const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
  };

  const calculateCompletionRate = (): number => {
    if (stats.totalGames === 0) return 0;
    return (stats.gamesCompleted / stats.totalGames) * 100;
  };

  return (
    <Card
      style={styles.card}
      testID={testID}
      accessibilityLabel={`Общая статистика игрока. Всего игр: ${stats.totalGames}, завершено: ${stats.gamesCompleted}, процент побед: ${stats.winRate}%`}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Общая статистика</Text>
        <Text style={styles.icon}>📊</Text>
      </View>

      {/* Основные метрики в сетке */}
      <View style={styles.statsGrid}>
        <StatItem
          icon="🎮"
          value={stats.totalGames}
          label="Всего игр"
          testID="total-games-stat"
        />
        <StatItem
          icon="✅"
          value={formatPercentage(calculateCompletionRate())}
          label="Завершено"
          color={Colors.success}
          testID="completion-rate-stat"
        />
        <StatItem
          icon="🏆"
          value={formatPercentage(stats.winRate)}
          label="Процент побед"
          color={Colors.primary}
          testID="win-rate-stat"
        />
        <StatItem
          icon="🔥"
          value={stats.currentStreak}
          label="Текущая серия"
          color={Colors.warning}
          testID="current-streak-stat"
        />
      </View>

      <View style={styles.divider} />

      {/* Временные метрики */}
      <View style={styles.timeSection}>
        <Text style={styles.sectionTitle}>Время игры</Text>
        <View style={styles.timeStats}>
          <StatItem
            icon="⚡"
            value={formatTime(stats.bestTime)}
            label="Лучшее время"
            color={Colors.success}
            testID="best-time-stat"
          />
          <StatItem
            icon="📈"
            value={formatTime(stats.averageTime)}
            label="Среднее время"
            color={Colors.info}
            testID="average-time-stat"
          />
          <StatItem
            icon="⏱️"
            value={formatTime(stats.totalPlayTime)}
            label="Общее время"
            color={Colors.text.secondary}
            testID="total-time-stat"
          />
        </View>
      </View>

      <View style={styles.divider} />

      {/* Детальная статистика */}
      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Детали игры</Text>
        <StatItem
          icon="💡"
          value={`${stats.totalHints} (${stats.averageHints.toFixed(1)} в среднем)`}
          label="Подсказки использовано"
          horizontal
          color={Colors.warning}
          testID="hints-stat"
        />
        <StatItem
          icon="❌"
          value={`${stats.totalErrors} (${stats.averageErrors.toFixed(1)} в среднем)`}
          label="Ошибки допущены"
          horizontal
          color={Colors.error}
          testID="errors-stat"
        />
        <StatItem
          icon="🎯"
          value={stats.longestStreak}
          label="Самая длинная серия побед"
          horizontal
          color={Colors.primary}
          testID="longest-streak-stat"
        />
      </View>
    </Card>
  );
});

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
    marginBottom: Spacing.lg,
  },

  title: {
    ...Typography.heading3,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },

  icon: {
    fontSize: Typography.fontSize.xl,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginVertical: Spacing.md,
  },

  timeSection: {
    marginBottom: Spacing.md,
  },

  sectionTitle: {
    ...Typography.heading4,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },

  timeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  detailsSection: {
    // Нижняя секция с горизонтальными элементами
  },
});