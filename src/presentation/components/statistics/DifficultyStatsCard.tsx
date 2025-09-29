import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { DifficultyLevel, DifficultyStatistics } from '../../../domain/types/GameTypes';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { Card } from '../common/Card';

interface DifficultyStatsCardProps {
  difficultyStats: DifficultyStatistics[];
  testID?: string;
}

export const DifficultyStatsCard = React.memo<DifficultyStatsCardProps>(({
  difficultyStats,
  testID,
}) => {
  const formatTime = (seconds: number): string => {
    if (seconds === 0 || !seconds) return '—';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}:${secs.toString().padStart(2, '0')}` : `${minutes}:00`;
  };

  const getDifficultyColor = (difficulty: DifficultyLevel): string => {
    switch (difficulty) {
      case 'beginner':
        return Colors.difficulty.beginner;
      case 'easy':
        return Colors.difficulty.easy;
      case 'medium':
        return Colors.difficulty.medium;
      case 'hard':
        return Colors.difficulty.hard;
      case 'expert':
        return Colors.difficulty.expert;
      default:
        return Colors.primary;
    }
  };

  const getDifficultyName = (difficulty: DifficultyLevel): string => {
    switch (difficulty) {
      case 'beginner':
        return 'Новичок';
      case 'easy':
        return 'Легкий';
      case 'medium':
        return 'Средний';
      case 'hard':
        return 'Сложный';
      case 'expert':
        return 'Эксперт';
      default:
        return difficulty;
    }
  };

  const getDifficultyIcon = (difficulty: DifficultyLevel): string => {
    switch (difficulty) {
      case 'beginner':
        return '🌱';
      case 'easy':
        return '🟢';
      case 'medium':
        return '🟡';
      case 'hard':
        return '🟠';
      case 'expert':
        return '🔴';
      default:
        return '🎯';
    }
  };

  const sortedStats = difficultyStats.sort((a, b) => {
    const order = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    return order.indexOf(a.difficulty) - order.indexOf(b.difficulty);
  });

  return (
    <Card
      style={styles.card}
      testID={testID}
      accessibilityLabel={`Статистика по уровням сложности. Всего уровней: ${difficultyStats.length}`}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Статистика по уровням</Text>
        <Text style={styles.icon}>📈</Text>
      </View>

      <View style={styles.legendContainer}>
        <Text style={styles.legend}>
          Нажмите на уровень для подробной информации
        </Text>
      </View>

      {sortedStats.map((stats) => (
        <View key={stats.difficulty} style={styles.difficultyRow}>
          <View style={styles.difficultyHeader}>
            <View style={styles.difficultyTitleSection}>
              <Text style={styles.difficultyIcon}>
                {getDifficultyIcon(stats.difficulty)}
              </Text>
              <Text
                style={[
                  styles.difficultyName,
                  { color: getDifficultyColor(stats.difficulty) }
                ]}
              >
                {getDifficultyName(stats.difficulty)}
              </Text>
            </View>
            <Text style={styles.gamesCount}>
              {stats.gamesPlayed} игр
            </Text>
          </View>

          {stats.gamesPlayed > 0 ? (
            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Завершено</Text>
                  <Text style={[styles.statValue, { color: Colors.success }]}>
                    {stats.gamesCompleted}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Побед</Text>
                  <Text style={[styles.statValue, { color: Colors.primary }]}>
                    {Math.round(stats.winRate)}%
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Лучшее время</Text>
                  <Text style={[styles.statValue, { color: Colors.warning }]}>
                    {formatTime(stats.bestTime)}
                  </Text>
                </View>
              </View>

              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Среднее время</Text>
                  <Text style={styles.statValue}>
                    {formatTime(stats.averageTime)}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Ошибки</Text>
                  <Text style={[styles.statValue, { color: Colors.error }]}>
                    {stats.totalErrors}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Подсказки</Text>
                  <Text style={[styles.statValue, { color: Colors.info }]}>
                    {stats.totalHints}
                  </Text>
                </View>
              </View>

              {/* Прогресс-бар для процента побед */}
              <View style={styles.progressContainer}>
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${Math.min(stats.winRate, 100)}%`,
                      backgroundColor: getDifficultyColor(stats.difficulty),
                    }
                  ]}
                />
              </View>
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>
                Нет данных для этого уровня
              </Text>
            </View>
          )}
        </View>
      ))}
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
    marginBottom: Spacing.md,
  },

  title: {
    ...Typography.heading3,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },

  icon: {
    fontSize: Typography.fontSize.xl,
  },

  legendContainer: {
    marginBottom: Spacing.lg,
  },

  legend: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  difficultyRow: {
    marginBottom: Spacing.lg,
    borderRadius: 8,
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
  },

  difficultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  difficultyTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  difficultyIcon: {
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.sm,
  },

  difficultyName: {
    ...Typography.heading4,
    fontWeight: 'bold',
  },

  gamesCount: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },

  statsContainer: {
    // Контейнер для статистики уровня
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },

  statValue: {
    ...Typography.body1,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },

  progressContainer: {
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    borderRadius: 2,
  },

  noDataContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },

  noDataText: {
    ...Typography.body2,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
});