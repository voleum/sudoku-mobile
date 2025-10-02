import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useGameStore } from '../../../application/stores/gameStore';
import { DifficultyLevel } from '../../../domain/types/GameTypes';
import {
  WelcomeHeader,
  ContinueGameButton,
  DifficultyCard,
  QuickActionsSection,
  DailyTip,
  getDailyTip,
  QuickStartButton,
  StatsPreview,
} from '../../components/home';
import { useTheme } from '../../theme';
import { Spacing } from '../../styles/spacing';

export const HomeScreen: React.FC = () => {
  const { currentGame, startNewGame } = useGameStore();
  const { colors } = useTheme();

  const difficultyLevels: DifficultyLevel[] = [
    'beginner',
    'easy',
    'medium',
    'hard',
    'expert'
  ];

  // TODO: Replace with real user data from user profile store
  const mockUserData = {
    userName: 'Игрок',
    userProgress: {
      currentStreak: 5,
      totalGames: 47,
      skillLevel: 'medium' as DifficultyLevel,
      lastPlayedDays: 0,
      achievements: ['first_win', 'streak_3'],
    },
    userStats: {
      totalGames: 47,
      averageTime: 420, // 7 minutes
      bestTime: 180, // 3 minutes
      winRate: 85.1,
      currentStreak: 5,
      totalErrors: 23,
      averageErrors: 2.3,
    },
  };

  const handleDifficultySelect = (difficulty: DifficultyLevel) => {
    startNewGame(difficulty);
    // TODO: Navigate to GameScreen when navigation is implemented
    console.log(`Starting new ${difficulty} game`);
  };

  const handleContinueGame = () => {
    // TODO: Navigate to GameScreen when navigation is implemented
    console.log('Continue current game');
  };

  const handleQuickStart = () => {
    // Start with recommended difficulty (medium for this user)
    const recommendedDifficulty: DifficultyLevel = mockUserData.userProgress.skillLevel;
    startNewGame(recommendedDifficulty);
    // TODO: Navigate to GameScreen when navigation is implemented
    console.log(`Quick start with ${recommendedDifficulty} difficulty`);
  };

  const handleViewStats = () => {
    // TODO: Navigate to detailed statistics screen
    console.log('Navigate to detailed statistics');
  };

  const quickActions = [
    {
      id: 'statistics',
      title: 'Статистика',
      subtitle: 'Ваши рекорды',
      emoji: '📊',
      onPress: () => {
        // TODO: Navigate to Statistics when navigation is implemented
        console.log('Navigate to Statistics');
      },
    },
    {
      id: 'settings',
      title: 'Настройки',
      subtitle: 'Параметры игры',
      emoji: '⚙️',
      onPress: () => {
        // TODO: Navigate to Settings when navigation is implemented
        console.log('Navigate to Settings');
      },
    },
    {
      id: 'tutorial',
      title: 'Обучение',
      subtitle: 'Изучить правила',
      emoji: '🎓',
      onPress: () => {
        // TODO: Navigate to Tutorial when navigation is implemented
        console.log('Navigate to Tutorial');
      },
    },
  ];

  const dailyTip = getDailyTip();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.surfacePrimary }]}
      testID="home-screen"
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <WelcomeHeader
          userName={mockUserData.userName}
          userProgress={mockUserData.userProgress}
        />

        {currentGame ? (
          <ContinueGameButton
            game={currentGame}
            onPress={handleContinueGame}
          />
        ) : (
          <QuickStartButton
            onPress={handleQuickStart}
          />
        )}

        <StatsPreview
          stats={mockUserData.userStats}
          onPress={handleViewStats}
        />

        <View style={styles.difficultySection}>
          {difficultyLevels.map((difficulty, _index) => (
            <DifficultyCard
              key={difficulty}
              difficulty={difficulty}
              recommended={difficulty === mockUserData.userProgress.skillLevel}
              onPress={handleDifficultySelect}
              // TODO: Add real statistics when user progress tracking is implemented
              // stats will be provided when user progress system is implemented
            />
          ))}
        </View>

        <QuickActionsSection actions={quickActions} />

        <DailyTip tip={dailyTip} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: Spacing.xl,
  },

  difficultySection: {
    marginTop: Spacing.lg,
  },
});