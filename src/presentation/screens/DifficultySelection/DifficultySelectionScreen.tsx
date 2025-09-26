import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useGameStore } from '../../../application/stores/gameStore';
import { DifficultyLevel } from '../../../domain/types/GameTypes';
import { DifficultyCard } from '../../components/home';
import { IconButton } from '../../components/common';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

interface DifficultySelectionScreenProps {
  onBack?: () => void;
  onDifficultySelect?: (difficulty: DifficultyLevel) => void;
}

export const DifficultySelectionScreen: React.FC<DifficultySelectionScreenProps> = ({
  onBack,
  onDifficultySelect,
}) => {
  const { startNewGame } = useGameStore();

  const difficultyLevels: DifficultyLevel[] = [
    'beginner',
    'easy',
    'medium',
    'hard',
    'expert'
  ];

  const handleDifficultySelect = (difficulty: DifficultyLevel) => {
    startNewGame(difficulty);
    onDifficultySelect?.(difficulty);
    // TODO: Navigate to GameScreen when navigation is implemented
    console.log(`Starting new ${difficulty} game from DifficultySelectionScreen`);
  };

  const handleBack = () => {
    onBack?.();
    // TODO: Navigate back when navigation is implemented
    console.log('Navigate back from DifficultySelectionScreen');
  };

  // TODO: Get user statistics for each difficulty level when user progress tracking is implemented

  // Determine which difficulty level to recommend
  // TODO: Base this on user's actual progress and skill level
  const getRecommendedLevel = (): DifficultyLevel => {
    // For now, recommend 'medium' as shown in wireframe
    return 'medium';
  };

  const recommendedLevel = getRecommendedLevel();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <IconButton
          onPress={handleBack}
          variant="ghost"
          size="large"
          testID="back-button"
        >
          <Text style={styles.backIcon}>←</Text>
        </IconButton>
        <Text style={styles.title}>ВЫБОР СЛОЖНОСТИ</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {difficultyLevels.map((difficulty) => (
          <DifficultyCard
            key={difficulty}
            difficulty={difficulty}
            recommended={difficulty === recommendedLevel}
            onPress={handleDifficultySelect}
            // TODO: stats will be provided when user progress tracking is implemented
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },

  title: {
    ...Typography.heading2,
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },

  headerSpacer: {
    width: 40, // Same width as IconButton to center title
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  backIcon: {
    ...Typography.heading3,
    color: Colors.text.primary,
  },
});