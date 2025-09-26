import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { DifficultyLevel } from '../../../domain/types/GameTypes';
import {
  StatsSummaryCard,
  DifficultyStatsCard,
  AchievementsCard,
  ProgressChart,
  AchievementType,
} from '../../components/statistics';
import { Colors } from '../../styles/colors';
import { Spacing } from '../../styles/spacing';

// Временные типы для данных статистики до создания полноценного store
interface GameStats {
  totalGames: number;
  gamesCompleted: number;
  totalTime: number;
  bestTime: number;
  averageTime: number;
  winRate: number;
  currentStreak: number;
  longestStreak: number;
  totalErrors: number;
  averageErrors: number;
  hintsUsed: number;
  averageHints: number;
}

interface DifficultyStats {
  difficulty: DifficultyLevel;
  gamesPlayed: number;
  gamesCompleted: number;
  bestTime: number;
  averageTime: number;
  winRate: number;
  totalErrors: number;
  hintsUsed: number;
}

interface Achievement {
  id: AchievementType;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress: number;
  unlockedAt?: Date;
  category: 'skill' | 'persistence' | 'exploration' | 'mastery';
}

interface DataPoint {
  date: Date;
  value: number;
  label?: string;
}

export const StatisticsScreen: React.FC = () => {
  // TODO: Заменить на реальные данные из stores/services
  const mockGameStats: GameStats = useMemo(() => ({
    totalGames: 142,
    gamesCompleted: 127,
    totalTime: 15420, // в секундах (около 4.3 часа)
    bestTime: 180,     // 3 минуты
    averageTime: 420,  // 7 минут
    winRate: 89.4,
    currentStreak: 8,
    longestStreak: 15,
    totalErrors: 87,
    averageErrors: 2.3,
    hintsUsed: 156,
    averageHints: 1.8,
  }), []);

  const mockDifficultyStats: DifficultyStats[] = useMemo(() => ([
    {
      difficulty: 'beginner',
      gamesPlayed: 25,
      gamesCompleted: 25,
      bestTime: 120,
      averageTime: 180,
      winRate: 100,
      totalErrors: 5,
      hintsUsed: 8,
    },
    {
      difficulty: 'easy',
      gamesPlayed: 45,
      gamesCompleted: 42,
      bestTime: 180,
      averageTime: 300,
      winRate: 93.3,
      totalErrors: 23,
      hintsUsed: 35,
    },
    {
      difficulty: 'medium',
      gamesPlayed: 52,
      gamesCompleted: 46,
      bestTime: 240,
      averageTime: 480,
      winRate: 88.5,
      totalErrors: 45,
      hintsUsed: 78,
    },
    {
      difficulty: 'hard',
      gamesPlayed: 18,
      gamesCompleted: 12,
      bestTime: 480,
      averageTime: 840,
      winRate: 66.7,
      totalErrors: 38,
      hintsUsed: 95,
    },
    {
      difficulty: 'expert',
      gamesPlayed: 2,
      gamesCompleted: 2,
      bestTime: 720,
      averageTime: 900,
      winRate: 100,
      totalErrors: 8,
      hintsUsed: 12,
    },
  ]), []);

  const mockAchievements: Achievement[] = useMemo(() => ([
    {
      id: 'first_win',
      title: 'Первая победа',
      description: 'Завершите свою первую игру',
      icon: '🎉',
      isUnlocked: true,
      progress: 100,
      unlockedAt: new Date('2024-09-01'),
      category: 'exploration',
    },
    {
      id: 'streak_3',
      title: 'Тройная серия',
      description: 'Выиграйте 3 игры подряд',
      icon: '🔥',
      isUnlocked: true,
      progress: 100,
      unlockedAt: new Date('2024-09-05'),
      category: 'persistence',
    },
    {
      id: 'streak_5',
      title: 'Пятерная серия',
      description: 'Выиграйте 5 игр подряд',
      icon: '🚀',
      isUnlocked: true,
      progress: 100,
      unlockedAt: new Date('2024-09-12'),
      category: 'persistence',
    },
    {
      id: 'streak_10',
      title: 'Десятка подряд',
      description: 'Выиграйте 10 игр подряд',
      icon: '💎',
      isUnlocked: false,
      progress: 80, // 8/10
      category: 'persistence',
    },
    {
      id: 'speed_demon',
      title: 'Скоростной демон',
      description: 'Решите головоломку за менее чем 5 минут',
      icon: '⚡',
      isUnlocked: true,
      progress: 100,
      unlockedAt: new Date('2024-09-15'),
      category: 'skill',
    },
    {
      id: 'perfectionist',
      title: 'Перфекционист',
      description: 'Решите головоломку без единой ошибки',
      icon: '💯',
      isUnlocked: true,
      progress: 100,
      unlockedAt: new Date('2024-09-08'),
      category: 'skill',
    },
    {
      id: 'no_hints',
      title: 'Без подсказок',
      description: 'Решите головоломку без использования подсказок',
      icon: '🧠',
      isUnlocked: false,
      progress: 0,
      category: 'skill',
    },
    {
      id: 'beginner_master',
      title: 'Мастер новичка',
      description: 'Выиграйте 10 игр на уровне "Новичок"',
      icon: '🌱',
      isUnlocked: true,
      progress: 100,
      unlockedAt: new Date('2024-09-10'),
      category: 'mastery',
    },
    {
      id: 'medium_master',
      title: 'Мастер среднего',
      description: 'Выиграйте 10 игр на среднем уровне',
      icon: '🟡',
      isUnlocked: true,
      progress: 100,
      unlockedAt: new Date('2024-09-20'),
      category: 'mastery',
    },
    {
      id: 'explorer',
      title: 'Исследователь',
      description: 'Попробуйте все уровни сложности',
      icon: '🗺️',
      isUnlocked: true,
      progress: 100,
      unlockedAt: new Date('2024-09-18'),
      category: 'exploration',
    },
    {
      id: 'zen_player',
      title: 'Дзен-игрок',
      description: 'Сыграйте 50 игр в дзен-режиме',
      icon: '🧘',
      isUnlocked: false,
      progress: 24, // 12/50
      category: 'exploration',
    },
    {
      id: 'marathon',
      title: 'Марафонец',
      description: 'Завершите 100 игр',
      icon: '🏃',
      isUnlocked: true,
      progress: 100,
      unlockedAt: new Date('2024-09-22'),
      category: 'persistence',
    },
  ]), []);

  // Данные для графика прогресса (последние 30 дней)
  const mockProgressData: DataPoint[] = useMemo(() => {
    const data: DataPoint[] = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Симуляция прогресса с небольшими колебаниями
      const baseWinRate = 85 + Math.sin(i * 0.2) * 5 + Math.random() * 10;
      data.push({
        date,
        value: Math.max(0, Math.min(100, baseWinRate)),
        label: `${Math.round(baseWinRate)}%`,
      });
    }

    return data;
  }, []);

  const formatPercentage = (value: number): string => {
    return `${Math.round(value)}%`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        testID="statistics-screen"
      >
        {/* Общая статистика */}
        <StatsSummaryCard
          stats={mockGameStats}
          testID="stats-summary-card"
        />

        {/* График прогресса процента побед */}
        <ProgressChart
          title="Процент побед (30 дней)"
          data={mockProgressData}
          valueFormatter={formatPercentage}
          showTrend={true}
          testID="win-rate-chart"
        />

        {/* Статистика по уровням сложности */}
        <DifficultyStatsCard
          difficultyStats={mockDifficultyStats}
          testID="difficulty-stats-card"
        />

        {/* Достижения */}
        <AchievementsCard
          achievements={mockAchievements}
          testID="achievements-card"
        />

        {/* Дополнительное пространство внизу для комфортного скроллинга */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingVertical: Spacing.md,
  },

  bottomSpacer: {
    height: Spacing.xl,
  },
});