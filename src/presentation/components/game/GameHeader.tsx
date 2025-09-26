import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { GameTimer } from './GameTimer';
import { GameControls } from './GameControls';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

interface GameHeaderProps {
  // Timer props
  startTime?: Date;
  isPaused?: boolean;
  elapsedTimeInSeconds?: number;
  movesCount?: number;
  difficulty?: string;

  // Controls props
  onClear?: () => void;
  onHint?: () => void;
  onUndo?: () => void;
  onToggleNotesMode?: () => void;
  notesMode?: boolean;
  canUndo?: boolean;
  hintsRemaining?: number;
  disabled?: boolean;
  testID?: string;
}

export const GameHeader: React.FC<GameHeaderProps> = memo(({
  // Timer props
  startTime,
  isPaused = false,
  elapsedTimeInSeconds = 0,
  movesCount = 0,
  difficulty,

  // Controls props
  onClear,
  onHint,
  onUndo,
  onToggleNotesMode,
  notesMode = false,
  canUndo = false,
  hintsRemaining,
  disabled = false,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID || 'game-header'}>
      {/* Difficulty Badge */}
      {difficulty && (
        <View style={styles.difficultyContainer}>
          <Text style={styles.difficultyText} allowFontScaling={true}>
            {difficulty}
          </Text>
        </View>
      )}

      {/* Game Statistics and Timer */}
      <GameTimer
        startTime={startTime}
        isPaused={isPaused}
        elapsedTimeInSeconds={elapsedTimeInSeconds}
        movesCount={movesCount}
        difficulty={difficulty}
        testID={`${testID || 'game-header'}-timer`}
      />

      {/* Game Controls */}
      <GameControls
        onClear={onClear}
        onHint={onHint}
        onUndo={onUndo}
        onToggleNotesMode={onToggleNotesMode}
        notesMode={notesMode}
        canUndo={canUndo}
        hintsRemaining={hintsRemaining}
        disabled={disabled}
        testID={`${testID || 'game-header'}-controls`}
      />
    </View>
  );
});

GameHeader.displayName = 'GameHeader';

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.sm,
    marginHorizontal: Spacing.md,
    borderRadius: 8,
  },

  difficultyContainer: {
    alignSelf: 'center',
    backgroundColor: Colors.primaryLight + '20',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 16,
    marginBottom: Spacing.sm,
  },

  difficultyText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});