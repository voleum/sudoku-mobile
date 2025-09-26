import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { GameEntity } from '../../../domain/types/GameTypes';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/spacing';
import { Card } from '../common/Card';

interface ContinueGameButtonProps {
  game: GameEntity | null;
  onPress: () => void;
}

// Утилита для форматирования времени игры
const formatGameTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Утилита для получения названия уровня сложности
const getDifficultyDisplayName = (difficulty: string): string => {
  const names = {
    beginner: 'Новичок',
    easy: 'Легкий',
    medium: 'Средний',
    hard: 'Сложный',
    expert: 'Экспертный',
  };
  return names[difficulty as keyof typeof names] || difficulty;
};

export const ContinueGameButton: React.FC<ContinueGameButtonProps> = ({
  game,
  onPress,
}) => {
  if (!game) {
    return null;
  }

  const difficultyName = getDifficultyDisplayName(game.difficulty);
  const elapsedTime = formatGameTime(game.currentTime || 0);

  // Подсчитываем заполненные ячейки
  const filledCellsCount = game.grid.flat().filter(cell => cell !== 0).length;
  const progressPercent = Math.round((filledCellsCount / 81) * 100);

  return (
    <Card
      pressable
      onPress={onPress}
      style={styles.card}
      testID="continue-game-button"
    >
      <View style={styles.header}>
        <Text style={styles.playIcon}>▶️</Text>
        <Text style={styles.title}>ПРОДОЛЖИТЬ ИГРУ</Text>
      </View>

      <View style={styles.info}>
        <View style={styles.infoRow}>
          <Text style={styles.difficulty}>{difficultyName}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.time}>{elapsedTime}</Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progressPercent}%` }
              ]}
            />
          </View>
          <Text style={styles.progressText}>{progressPercent}%</Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.screen,
    marginBottom: Spacing.md,
    backgroundColor: Colors.primaryLight + '15', // 15% opacity
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  playIcon: {
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.sm,
  },

  title: {
    ...Typography.heading4,
    color: Colors.primary,
    flex: 1,
  },

  info: {
    gap: Spacing.sm,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  difficulty: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
  },

  separator: {
    ...Typography.body1,
    color: Colors.text.tertiary,
    marginHorizontal: Spacing.sm,
  },

  time: {
    ...Typography.body1,
    color: Colors.text.secondary,
  },

  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.gray200,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
  },

  progressText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
    minWidth: 32,
    textAlign: 'right',
  },
});