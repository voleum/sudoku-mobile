import React, { memo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

interface GameTimerProps {
  startTime?: Date;
  isPaused?: boolean;
  elapsedTimeInSeconds?: number;
  movesCount?: number;
  difficulty?: string;
  testID?: string;
}

export const GameTimer: React.FC<GameTimerProps> = memo(({
  startTime,
  isPaused = false,
  elapsedTimeInSeconds = 0,
  movesCount = 0,
  difficulty,
  testID,
}) => {
  const [displayTime, setDisplayTime] = useState(elapsedTimeInSeconds);

  // Обновляем время каждую секунду, если игра не на паузе
  useEffect(() => {
    if (isPaused || !startTime) {
      setDisplayTime(elapsedTimeInSeconds);
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setDisplayTime(elapsed + elapsedTimeInSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, isPaused, elapsedTimeInSeconds]);

  // Форматирование времени в MM:SS или HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Определяем цвет для времени в зависимости от сложности
  const getTimeColor = () => {
    if (isPaused) return Colors.text.tertiary;

    // Примерные пороги для разных уровней сложности
    const thresholds = {
      'Начинающий': 900,      // 15 минут
      'Легкий': 1200,         // 20 минут
      'Средний': 1800,        // 30 минут
      'Сложный': 2700,        // 45 минут
      'Эксперт': 3600,        // 60 минут
    };

    const threshold = difficulty ? thresholds[difficulty as keyof typeof thresholds] : null;

    if (threshold && displayTime > threshold * 1.5) {
      return Colors.error;
    } else if (threshold && displayTime > threshold) {
      return Colors.warning;
    }

    return Colors.text.primary;
  };

  return (
    <View style={styles.container} testID={testID || 'game-timer-container'}>
      {/* Таймер */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel} allowFontScaling={true}>
          Время
        </Text>
        <Text
          style={[
            styles.timeValue,
            { color: getTimeColor() }
          ]}
          allowFontScaling={true}
          accessibilityLabel={`Время игры: ${formatTime(displayTime)}`}
          testID="game-timer"
        >
          {formatTime(displayTime)}
        </Text>
      </View>

      {/* Разделитель */}
      <View style={styles.separator} />

      {/* Счетчик ходов */}
      <View style={styles.movesContainer}>
        <Text style={styles.movesLabel} allowFontScaling={true}>
          Ходы
        </Text>
        <Text
          style={styles.movesValue}
          allowFontScaling={true}
          accessibilityLabel={`Количество ходов: ${movesCount}`}
          testID="moves-counter"
        >
          {movesCount}
        </Text>
      </View>

      {/* Сложность (опционально) */}
      {difficulty && (
        <>
          <View style={styles.separator} />
          <View style={styles.difficultyContainer}>
            <Text style={styles.difficultyLabel} allowFontScaling={true}>
              {difficulty}
            </Text>
          </View>
        </>
      )}

      {/* Индикатор паузы */}
      {isPaused && (
        <View style={styles.pauseIndicator}>
          <Text style={styles.pauseText} allowFontScaling={true}>
            ⏸
          </Text>
        </View>
      )}
    </View>
  );
});

GameTimer.displayName = 'GameTimer';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  timeContainer: {
    flex: 1,
    alignItems: 'center',
  },

  timeLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },

  timeValue: {
    ...Typography.heading3,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    fontFamily: 'monospace', // Моноширинный шрифт для стабильного отображения времени
  },

  separator: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },

  movesContainer: {
    flex: 1,
    alignItems: 'center',
  },

  movesLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },

  movesValue: {
    ...Typography.heading3,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
  },

  difficultyContainer: {
    flex: 1,
    alignItems: 'center',
  },

  difficultyLabel: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    textTransform: 'uppercase',
  },

  pauseIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.warning,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },

  pauseText: {
    fontSize: 12,
    color: Colors.surface,
  },
});