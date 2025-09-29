import React, { useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {
  DifficultyLevel,
  GameStatistics,
  DifficultyStatistics,
  Achievement,
  StatisticsDataPoint
} from '../../../domain/types/GameTypes';
import {
  StatsSummaryCard,
  DifficultyStatsCard,
  AchievementsCard,
  ProgressChart,
} from '../../components/statistics';
import { Colors } from '../../styles/colors';
import { Spacing } from '../../styles/spacing';

export const StatisticsScreen: React.FC = () => {
  // TODO: Интеграция с архитектурой из системного анализа:
  // 1. Создать GetStatisticsUseCase в application слое
  // 2. Подключить IStatisticsRepository из infrastructure слоя
  // 3. Заменить mock данные на реальные из базы данных SQLite
  // 4. Использовать Zustand store для state management
  // 5. Добавить error handling и loading состояния
  //
  // Архитектура согласно Clean Architecture:
  // StatisticsScreen -> GetStatisticsUseCase -> IStatisticsRepository -> SQLite DB

  const mockGameStats: GameStatistics = useMemo(() => ({
    totalGames: 142,
    gamesCompleted: 127,
    gamesAbandoned: 15,
    winRate: 89.4,

    totalPlayTime: 15420, // в секундах (около 4.3 часа)
    averageTime: 420,     // 7 минут
    bestTime: 180,        // 3 минуты
    worstTime: 1200,      // 20 минут

    totalMoves: 2850,
    averageMoves: 22.4,
    bestMoves: 15,

    totalHints: 156,
    averageHints: 1.2,
    totalErrors: 87,
    averageErrors: 0.7,

    currentStreak: 8,
    longestStreak: 15,
    currentDailyStreak: 3,
    longestDailyStreak: 12,

    lastPlayed: new Date('2024-09-25'),
    lastCompleted: new Date('2024-09-25'),
    updatedAt: new Date(),
  }), []);

  const mockDifficultyStats: DifficultyStatistics[] = useMemo(() => ([
    {
      difficulty: 'beginner',
      gamesPlayed: 25,
      gamesCompleted: 25,
      gamesAbandoned: 0,
      totalPlayTime: 4500,
      averageTime: 180,
      bestTime: 120,
      worstTime: 240,
      totalMoves: 550,
      averageMoves: 22,
      bestMoves: 18,
      totalHints: 8,
      averageHints: 0.3,
      totalErrors: 5,
      averageErrors: 0.2,
      currentStreak: 5,
      longestStreak: 12,
      currentDailyStreak: 2,
      longestDailyStreak: 8,
      winRate: 100,
      lastPlayed: new Date('2024-09-25'),
      lastCompleted: new Date('2024-09-25'),
      updatedAt: new Date(),
    },
    {
      difficulty: 'easy',
      gamesPlayed: 45,
      gamesCompleted: 42,
      gamesAbandoned: 3,
      totalPlayTime: 13500,
      averageTime: 300,
      bestTime: 180,
      worstTime: 450,
      totalMoves: 945,
      averageMoves: 21,
      bestMoves: 16,
      totalHints: 35,
      averageHints: 0.8,
      totalErrors: 23,
      averageErrors: 0.5,
      currentStreak: 3,
      longestStreak: 8,
      currentDailyStreak: 1,
      longestDailyStreak: 5,
      winRate: 93.3,
      lastPlayed: new Date('2024-09-24'),
      lastCompleted: new Date('2024-09-24'),
      updatedAt: new Date(),
    },
    {
      difficulty: 'medium',
      gamesPlayed: 52,
      gamesCompleted: 46,
      gamesAbandoned: 6,
      totalPlayTime: 24960,
      averageTime: 480,
      bestTime: 240,
      worstTime: 720,
      totalMoves: 1200,
      averageMoves: 23,
      bestMoves: 19,
      totalHints: 78,
      averageHints: 1.5,
      totalErrors: 45,
      averageErrors: 0.9,
      currentStreak: 2,
      longestStreak: 6,
      currentDailyStreak: 0,
      longestDailyStreak: 3,
      winRate: 88.5,
      lastPlayed: new Date('2024-09-23'),
      lastCompleted: new Date('2024-09-23'),
      updatedAt: new Date(),
    },
    {
      difficulty: 'hard',
      gamesPlayed: 18,
      gamesCompleted: 12,
      gamesAbandoned: 6,
      totalPlayTime: 15120,
      averageTime: 840,
      bestTime: 480,
      worstTime: 1200,
      totalMoves: 432,
      averageMoves: 24,
      bestMoves: 20,
      totalHints: 95,
      averageHints: 5.3,
      totalErrors: 38,
      averageErrors: 2.1,
      currentStreak: 0,
      longestStreak: 3,
      currentDailyStreak: 0,
      longestDailyStreak: 2,
      winRate: 66.7,
      lastPlayed: new Date('2024-09-20'),
      lastCompleted: new Date('2024-09-20'),
      updatedAt: new Date(),
    },
    {
      difficulty: 'expert',
      gamesPlayed: 2,
      gamesCompleted: 2,
      gamesAbandoned: 0,
      totalPlayTime: 1800,
      averageTime: 900,
      bestTime: 720,
      worstTime: 1080,
      totalMoves: 50,
      averageMoves: 25,
      bestMoves: 24,
      totalHints: 12,
      averageHints: 6,
      totalErrors: 8,
      averageErrors: 4,
      currentStreak: 2,
      longestStreak: 2,
      currentDailyStreak: 0,
      longestDailyStreak: 1,
      winRate: 100,
      lastPlayed: new Date('2024-09-15'),
      lastCompleted: new Date('2024-09-15'),
      updatedAt: new Date(),
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
  const mockProgressData: StatisticsDataPoint[] = useMemo(() => {
    const data: StatisticsDataPoint[] = [];
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