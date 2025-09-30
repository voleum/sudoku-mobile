import {
  IGameSaveRepository,
  GameEntity,
  GameSave,
  SaveOperationResult,
  GameMove
} from '../../../domain/types/GameTypes';

/**
 * Use case for saving game state
 * Based on business requirements from 1.4-functional-requirements.md
 */
export class SaveGameUseCase {
  constructor(
    private readonly gameSaveRepository: IGameSaveRepository
  ) {}

  /**
   * Save current game state
   */
  async execute(
    gameEntity: GameEntity,
    options: SaveGameOptions = {}
  ): Promise<SaveOperationResult> {
    try {
      // Convert GameEntity to GameSave format
      const gameSave = this.convertToGameSave(gameEntity, options);

      // Determine save type
      if (options.name) {
        // Named save
        return await this.gameSaveRepository.saveNamed(gameSave, options.name);
      } else if (options.isAutoSave) {
        // Auto save
        return await this.gameSaveRepository.autoSave(gameSave);
      } else {
        // Regular save
        return await this.gameSaveRepository.save(gameSave);
      }

    } catch (error) {
      console.error('Error in SaveGameUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Auto-save game with cleanup of old saves
   */
  async autoSave(gameEntity: GameEntity): Promise<SaveOperationResult> {
    try {
      const result = await this.execute(gameEntity, { isAutoSave: true });

      if (result.success) {
        // Clean up old auto-saves (keep only recent ones)
        await this.gameSaveRepository.cleanupOldAutoSaves(7); // 7 days

        // Enforce max auto-saves limit (Business Analysis requirement: configurable, default 10)
        await this.limitAutoSavesCount(10);
      }

      return result;

    } catch (error) {
      console.error('Error in auto-save:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Quick save - save with automatic name generation
   */
  async quickSave(gameEntity: GameEntity): Promise<SaveOperationResult> {
    const timestamp = new Date().toLocaleString();
    const name = `Quick Save ${gameEntity.difficulty} - ${timestamp}`;

    return this.execute(gameEntity, { name });
  }

  /**
   * Save with custom name
   */
  async saveWithName(gameEntity: GameEntity, name: string): Promise<SaveOperationResult> {
    // Validate name
    if (!name || name.trim().length === 0) {
      return {
        success: false,
        error: 'Save name cannot be empty'
      };
    }

    if (name.length > 50) {
      return {
        success: false,
        error: 'Save name too long (max 50 characters)'
      };
    }

    // Check named saves limit (Business Analysis requirement: max 20)
    try {
      const namedSavesCount = await this.gameSaveRepository.getNamedSavesCount();
      if (namedSavesCount >= 20) {
        return {
          success: false,
          error: 'Maximum number of named saves reached (20). Please delete some saves first.'
        };
      }
    } catch (error) {
      console.error('Error checking named saves count:', error);
      return {
        success: false,
        error: 'Unable to verify save limits. Please try again.'
      };
    }

    return this.execute(gameEntity, { name: name.trim() });
  }

  /**
   * Check if we can save (validate game state)
   */
  async validateGameForSave(gameEntity: GameEntity): Promise<{ valid: boolean; error?: string }> {
    // Basic validation
    if (!gameEntity.id) {
      return { valid: false, error: 'Game ID is required' };
    }

    if (!gameEntity.grid || !gameEntity.originalGrid) {
      return { valid: false, error: 'Game grids are required' };
    }

    if (gameEntity.grid.length !== 9 || gameEntity.originalGrid.length !== 9) {
      return { valid: false, error: 'Invalid grid dimensions' };
    }

    // Check if game state is valid
    const isValidGrid = gameEntity.grid.every(row =>
      row.length === 9 && row.every(cell => cell >= 0 && cell <= 9)
    );

    if (!isValidGrid) {
      return { valid: false, error: 'Invalid grid values' };
    }

    return { valid: true };
  }

  /**
   * Get save recommendations based on current game state
   */
  async getSaveRecommendations(gameEntity: GameEntity): Promise<SaveRecommendation[]> {
    const recommendations: SaveRecommendation[] = [];
    const playTime = gameEntity.currentTime;
    const hintsUsed = gameEntity.hintsUsed;
    const isCompleted = gameEntity.isCompleted;

    // Recommend auto-save for long games
    if (playTime > 300 && !isCompleted) { // 5 minutes
      recommendations.push({
        type: 'auto_save',
        priority: 'medium',
        reason: 'Game has been running for a while'
      });
    }

    // Recommend named save for good progress
    if (playTime > 600 && hintsUsed < 3 && !isCompleted) { // 10 minutes, few hints
      recommendations.push({
        type: 'named_save',
        priority: 'high',
        reason: 'Good progress with minimal hints used'
      });
    }

    // Recommend completion save
    if (isCompleted) {
      recommendations.push({
        type: 'completion_save',
        priority: 'high',
        reason: 'Game completed successfully'
      });
    }

    return recommendations;
  }

  /**
   * Limit auto-saves count to specified maximum
   */
  private async limitAutoSavesCount(maxCount: number): Promise<void> {
    try {
      const autoSavesCount = await this.gameSaveRepository.getAutoSavesCount();
      if (autoSavesCount > maxCount) {
        // Get oldest auto-saves to delete
        const autoSaves = await this.gameSaveRepository.findAutoSaves();
        const sortedByDate = autoSaves.sort((a, b) => a.lastModified.getTime() - b.lastModified.getTime());
        const toDelete = sortedByDate.slice(0, autoSavesCount - maxCount);

        // Delete oldest auto-saves
        for (const save of toDelete) {
          await this.gameSaveRepository.delete(save.id);
        }
      }
    } catch (error) {
      console.error('Error limiting auto-saves count:', error);
      // Continue silently if cleanup fails
    }
  }

  /**
   * Convert GameEntity to GameSave format
   */
  private convertToGameSave(
    gameEntity: GameEntity,
    options: SaveGameOptions
  ): GameSave {
    const now = new Date();

    // Build move history from game entity
    const moveHistory: GameMove[] = gameEntity.hintUsageHistory.map((hint, index) => ({
      position: { row: 0, col: 0, box: 0 }, // This would need to be tracked properly
      previousValue: 0,
      newValue: 0,
      timestamp: hint.timestamp,
      moveNumber: index + 1
    }));

    return {
      id: gameEntity.id,
      name: options.name,
      puzzleId: gameEntity.puzzleId,
      currentState: gameEntity.grid,
      originalPuzzle: gameEntity.originalGrid,
      difficulty: gameEntity.difficulty,
      startTime: gameEntity.startTime,
      totalPlayTime: gameEntity.currentTime,
      pausedTime: 0, // This would need to be tracked
      hintsUsed: gameEntity.hintsUsed,
      errorsCount: gameEntity.errorsCount,
      movesCount: moveHistory.length,
      lastPlayed: now,
      isCompleted: gameEntity.isCompleted,
      completedAt: gameEntity.isCompleted ? now : undefined,
      hintsEnabled: true, // Default, could be from settings
      errorCheckEnabled: true, // Default, could be from settings
      timerVisible: true, // Default, could be from settings
      moveHistory,
      historyIndex: moveHistory.length - 1
    };
  }
}

// Supporting types

export interface SaveGameOptions {
  name?: string;
  isAutoSave?: boolean;
  overwrite?: boolean;
}

export interface SaveRecommendation {
  type: 'auto_save' | 'named_save' | 'completion_save';
  priority: 'low' | 'medium' | 'high';
  reason: string;
}