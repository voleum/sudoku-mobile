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

export type AchievementType =
  | 'first_win'          // Первая победа
  | 'streak_3'           // Серия из 3 побед
  | 'streak_5'           // Серия из 5 побед
  | 'streak_10'          // Серия из 10 побед
  | 'speed_demon'        // Решение за < 5 минут
  | 'perfectionist'      // Решение без ошибок
  | 'no_hints'           // Решение без подсказок
  | 'beginner_master'    // 10 побед на уровне новичок
  | 'easy_master'        // 10 побед на легком уровне
  | 'medium_master'      // 10 побед на среднем уровне
  | 'hard_master'        // 10 побед на сложном уровне
  | 'expert_master'      // 10 побед на экспертном уровне
  | 'zen_player'         // 50 игр в дзен-режиме
  | 'marathon'           // 100 завершенных игр
  | 'dedication'         // 7 дней подряд игры
  | 'efficiency'         // Средняя точность > 90%
  | 'explorer';          // Пробовал все уровни сложности

interface Achievement {
  id: AchievementType;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress: number;       // 0-100 процентов до разблокировки
  unlockedAt?: Date;
  category: 'skill' | 'persistence' | 'exploration' | 'mastery';
}

interface AchievementsCardProps {
  achievements: Achievement[];
  testID?: string;
}

export const AchievementsCard: React.FC<AchievementsCardProps> = ({
  achievements,
  testID,
}) => {
  const getCategoryName = (category: Achievement['category']): string => {
    switch (category) {
      case 'skill':
        return 'Мастерство';
      case 'persistence':
        return 'Упорство';
      case 'exploration':
        return 'Исследование';
      case 'mastery':
        return 'Освоение';
      default:
        return 'Прочее';
    }
  };

  const getCategoryColor = (category: Achievement['category']): string => {
    switch (category) {
      case 'skill':
        return Colors.warning;
      case 'persistence':
        return Colors.primary;
      case 'exploration':
        return Colors.info;
      case 'mastery':
        return Colors.success;
      default:
        return Colors.text.secondary;
    }
  };

  const groupedAchievements = achievements.reduce((groups, achievement) => {
    const category = achievement.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(achievement);
    return groups;
  }, {} as Record<Achievement['category'], Achievement[]>);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Card style={styles.card} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.title}>Достижения</Text>
        <View style={styles.headerRight}>
          <Text style={styles.progress}>
            {unlockedCount}/{totalCount}
          </Text>
          <Text style={styles.icon}>🏆</Text>
        </View>
      </View>

      <View style={styles.overallProgress}>
        <Text style={styles.progressLabel}>
          Общий прогресс: {Math.round((unlockedCount / totalCount) * 100)}%
        </Text>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${(unlockedCount / totalCount) * 100}%` }
            ]}
          />
        </View>
      </View>

      {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
        <View key={category} style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <Text
              style={[
                styles.categoryTitle,
                { color: getCategoryColor(category as Achievement['category']) }
              ]}
            >
              {getCategoryName(category as Achievement['category'])}
            </Text>
            <Text style={styles.categoryCount}>
              {categoryAchievements.filter(a => a.isUnlocked).length}/{categoryAchievements.length}
            </Text>
          </View>

          <View style={styles.achievementsGrid}>
            {categoryAchievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementItem,
                  achievement.isUnlocked ? styles.unlockedAchievement : styles.lockedAchievement
                ]}
              >
                <Text
                  style={[
                    styles.achievementIcon,
                    !achievement.isUnlocked && styles.lockedIcon
                  ]}
                >
                  {achievement.icon}
                </Text>
                <Text
                  style={[
                    styles.achievementTitle,
                    !achievement.isUnlocked && styles.lockedText
                  ]}
                >
                  {achievement.title}
                </Text>
                <Text
                  style={[
                    styles.achievementDescription,
                    !achievement.isUnlocked && styles.lockedText
                  ]}
                >
                  {achievement.description}
                </Text>

                {achievement.isUnlocked ? (
                  achievement.unlockedAt && (
                    <Text style={styles.unlockedDate}>
                      🎉 {formatDate(achievement.unlockedAt)}
                    </Text>
                  )
                ) : achievement.progress > 0 ? (
                  <View style={styles.achievementProgressContainer}>
                    <Text style={styles.achievementProgressText}>
                      {Math.round(achievement.progress)}%
                    </Text>
                    <View style={styles.achievementProgressBar}>
                      <View
                        style={[
                          styles.achievementProgressFill,
                          { width: `${achievement.progress}%` }
                        ]}
                      />
                    </View>
                  </View>
                ) : (
                  <Text style={styles.notStarted}>Не начато</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      ))}
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
    marginBottom: Spacing.lg,
  },

  title: {
    ...Typography.heading3,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  progress: {
    ...Typography.body1,
    color: Colors.primary,
    fontWeight: 'bold',
    marginRight: Spacing.sm,
  },

  icon: {
    fontSize: Typography.fontSize.xl,
  },

  overallProgress: {
    marginBottom: Spacing.lg,
  },

  progressLabel: {
    ...Typography.body2,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },

  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },

  categorySection: {
    marginBottom: Spacing.lg,
  },

  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  categoryTitle: {
    ...Typography.heading4,
    fontWeight: 'bold',
  },

  categoryCount: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },

  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  achievementItem: {
    width: '48%',
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },

  unlockedAchievement: {
    backgroundColor: Colors.success + '10', // 10% прозрачности
    borderWidth: 1,
    borderColor: Colors.success + '30',
  },

  lockedAchievement: {
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray300,
  },

  achievementIcon: {
    fontSize: Typography.fontSize.xl,
    marginBottom: Spacing.sm,
  },

  lockedIcon: {
    opacity: 0.3,
  },

  achievementTitle: {
    ...Typography.body1,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Spacing.xs,
    color: Colors.text.primary,
  },

  achievementDescription: {
    ...Typography.caption,
    textAlign: 'center',
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },

  lockedText: {
    opacity: 0.6,
  },

  unlockedDate: {
    ...Typography.caption,
    color: Colors.success,
    fontStyle: 'italic',
  },

  achievementProgressContainer: {
    width: '100%',
    alignItems: 'center',
  },

  achievementProgressText: {
    ...Typography.caption,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },

  achievementProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.gray200,
    borderRadius: 2,
    overflow: 'hidden',
  },

  achievementProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },

  notStarted: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
});