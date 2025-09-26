import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { IconButton } from '../common/IconButton';
import { DifficultyLevel } from '../../../domain/types/GameTypes';

interface UserProgress {
  currentStreak: number;
  totalGames: number;
  skillLevel: DifficultyLevel;
  lastPlayedDays: number;
  achievements: string[];
}

interface WelcomeHeaderProps {
  userName?: string;
  userProgress?: UserProgress;
  onMenuPress?: () => void;
  onSettingsPress?: () => void;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({
  userName,
  userProgress,
  onMenuPress,
  onSettingsPress,
}) => {
  const getTimeBasedGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  const getPersonalizedMessage = (): string | null => {
    if (!userProgress) return null;

    const { currentStreak, totalGames, skillLevel, lastPlayedDays } = userProgress;

    // Welcome back message for returning users
    if (lastPlayedDays > 1) {
      return `Добро пожаловать! Вас не было ${lastPlayedDays} дней`;
    }

    // Streak celebration
    if (currentStreak >= 3) {
      return `🔥 Серия побед: ${currentStreak}! Отличная работа!`;
    }

    // Milestone celebrations
    if (totalGames === 10) {
      return `🎉 Поздравляем с 10-й игрой!`;
    }
    if (totalGames === 50) {
      return `🏆 50 игр пройдено! Вы настоящий мастер!`;
    }
    if (totalGames === 100) {
      return `🌟 100 игр! Легендарный результат!`;
    }

    // Skill level encouragement
    if (skillLevel === 'expert') {
      return '👑 Статус: Эксперт судоку';
    }
    if (skillLevel === 'hard') {
      return '🎯 Статус: Опытный игрок';
    }

    return null;
  };

  const getDisplayName = (): string => {
    if (userName) {
      return `${getTimeBasedGreeting()}, ${userName}!`;
    }
    return getTimeBasedGreeting();
  };

  const personalizedMessage = getPersonalizedMessage();
  const skillBadge = userProgress?.skillLevel ? getSkillBadge(userProgress.skillLevel) : null;

  return (
    <View style={styles.container}>
      {onMenuPress ? (
        <IconButton
          onPress={onMenuPress}
          size="medium"
          variant="ghost"
          testID="menu-button"
        >
          <Text style={styles.menuIcon}>≡</Text>
        </IconButton>
      ) : (
        <View style={styles.spacer} />
      )}

      <View style={styles.titleContainer}>
        <Text style={styles.title}>СУДОКУ МАСТЕР</Text>
        <Text style={styles.subtitle}>
          {getDisplayName()}
        </Text>
        {personalizedMessage && (
          <Text style={styles.personalizedMessage}>
            {personalizedMessage}
          </Text>
        )}
        {skillBadge && (
          <View style={styles.skillBadge}>
            <Text style={styles.skillBadgeText}>{skillBadge}</Text>
          </View>
        )}
      </View>

      {onSettingsPress ? (
        <IconButton
          onPress={onSettingsPress}
          size="medium"
          variant="ghost"
          testID="settings-button"
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </IconButton>
      ) : (
        <View style={styles.spacer} />
      )}
    </View>
  );
};

const getSkillBadge = (skillLevel: DifficultyLevel): string => {
  switch (skillLevel) {
    case 'beginner':
      return '🌱 Новичок';
    case 'easy':
      return '⭐ Любитель';
    case 'medium':
      return '🎯 Игрок';
    case 'hard':
      return '🏅 Опытный';
    case 'expert':
      return '👑 Эксперт';
    default:
      return '';
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },

  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },

  title: {
    ...Typography.heading3,
    color: Colors.text.primary,
    textAlign: 'center',
  },

  subtitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },

  personalizedMessage: {
    ...Typography.caption,
    color: Colors.primary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    fontWeight: '600',
  },

  skillBadge: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    marginTop: Spacing.xs,
  },

  skillBadgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: Typography.fontSize.sm,
  },

  menuIcon: {
    ...Typography.heading3,
    color: Colors.text.primary,
  },

  settingsIcon: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
  },

  spacer: {
    width: Spacing.touchTarget,
    height: Spacing.touchTarget,
  },
});