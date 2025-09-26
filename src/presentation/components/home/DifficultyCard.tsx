import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { DifficultyLevel } from '../../../domain/types/GameTypes';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/spacing';
import { Card } from '../common/Card';

interface DifficultyStats {
  difficulty: DifficultyLevel;
  gamesPlayed: number;
  gamesCompleted: number;
  completionRate: number;      // %
  averageTime: number;         // секунды
  bestTime: number;           // секунды
  totalTime: number;          // секунды
  averageHints: number;
  averageErrors: number;
  currentStreak: number;      // подряд завершенных
  longestStreak: number;
}

interface DifficultyCardProps {
  difficulty: DifficultyLevel;
  stats?: DifficultyStats;
  recommended?: boolean;
  onPress: (difficulty: DifficultyLevel) => void;
}

// Мета-информация о уровнях сложности согласно бизнес-анализу
const difficultyMeta = {
  beginner: {
    name: 'НОВИЧОК',
    emoji: '🟢',
    clues: '36-40 подсказок',
    time: '10-20 мин',
    description: '★★★★★ Изучаем основы',
  },
  easy: {
    name: 'ЛЕГКИЙ',
    emoji: '🟡',
    clues: '32-35 подсказок',
    time: '15-30 мин',
    description: '★★★★☆ Практикуем техники',
  },
  medium: {
    name: 'СРЕДНИЙ',
    emoji: '🟠',
    clues: '28-31 подсказка',
    time: '25-45 мин',
    description: '★★★☆☆ Развиваем навыки',
  },
  hard: {
    name: 'СЛОЖНЫЙ',
    emoji: '🔴',
    clues: '24-27 подсказок',
    time: '40-80 мин',
    description: '★★☆☆☆ Проверяем мастерство',
  },
  expert: {
    name: 'ЭКСПЕРТНЫЙ',
    emoji: '⚫',
    clues: '20-23 подсказки',
    time: '60+ мин',
    description: '★☆☆☆☆ Для профессионалов',
  },
};

export const DifficultyCard: React.FC<DifficultyCardProps> = ({
  difficulty,
  stats,
  recommended = false,
  onPress,
}) => {
  const meta = difficultyMeta[difficulty];
  const difficultyColor = Colors.difficulty[difficulty];

  // Форматирование времени из секунд в читаемый вид
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const cardStyle = StyleSheet.flatten([styles.card, ...(recommended ? [styles.recommendedCard] : [])]);

  return (
    <Card
      pressable
      onPress={() => onPress(difficulty)}
      style={cardStyle}
      testID={`difficulty-card-${difficulty}`}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{meta.emoji}</Text>
          <Text style={[styles.title, { color: difficultyColor }]}>
            {meta.name}
          </Text>
          {recommended && (
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>РЕКОМЕНДУЕМ</Text>
            </View>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.clues}>{meta.clues}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.time}>{meta.time}</Text>
        </View>

        <Text style={styles.description}>{meta.description}</Text>
      </View>

      {stats && (
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Лучшее время</Text>
            <Text style={styles.statValue}>
              {stats.bestTime ? formatTime(stats.bestTime) : '—'}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Процент побед</Text>
            <Text style={styles.statValue}>
              {stats.completionRate ? `${Math.round(stats.completionRate)}%` : '—'}
            </Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Игр сыграно</Text>
            <Text style={styles.statValue}>
              {stats.gamesPlayed}
            </Text>
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.screen,
    marginVertical: Spacing.sm,
  },

  recommendedCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },

  header: {
    marginBottom: Spacing.md,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  emoji: {
    fontSize: Typography.fontSize.xl,
    marginRight: Spacing.sm,
  },

  title: {
    ...Typography.heading4,
    flex: 1,
  },

  recommendedBadge: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },

  recommendedText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  clues: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },

  separator: {
    ...Typography.body2,
    color: Colors.text.tertiary,
    marginHorizontal: Spacing.sm,
  },

  time: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },

  description: {
    ...Typography.body2,
    color: Colors.text.tertiary,
  },

  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
  },

  statLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },

  statValue: {
    ...Typography.body2,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
  },
});