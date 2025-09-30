import {
  IGameSaveRepository,
  GameEntity,
  GameSave,
  SaveSlot,
  DifficultyLevel
} from '../../../domain/types/GameTypes';

/**
 * Use case for loading saved games
 * Based on business requirements from 1.4-functional-requirements.md
 */
export class LoadGameUseCase {
  constructor(
    private readonly gameSaveRepository: IGameSaveRepository
  ) {}

  /**
   * Load game by save ID
   */
  async execute(saveId: string): Promise<LoadGameResult> {
    try {
      const loadResult = await this.gameSaveRepository.load(saveId);

      if (!loadResult.success || !loadResult.gameData) {
        return {
          success: false,
          error: loadResult.error || 'Failed to load game'
        };
      }

      // Convert GameSave to GameEntity
      const gameEntity = this.convertToGameEntity(loadResult.gameData);

      // Validate loaded game
      const validation = await this.validateLoadedGame(gameEntity);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || 'Loaded game is invalid'
        };
      }

      return {
        success: true,
        gameEntity,
        saveMetadata: {
          saveId,
          saveName: loadResult.gameData.name,
          lastPlayed: loadResult.gameData.lastPlayed,
          isCompleted: loadResult.gameData.isCompleted
        }
      };

    } catch (error) {
      console.error('Error in LoadGameUseCase:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Load game by name
   */
  async loadByName(name: string): Promise<LoadGameResult> {
    try {
      const loadResult = await this.gameSaveRepository.loadNamed(name);

      if (!loadResult.success || !loadResult.gameData) {
        return {
          success: false,
          error: loadResult.error || 'Named save not found'
        };
      }

      return this.execute(loadResult.gameData.id);

    } catch (error) {
      console.error('Error loading game by name:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Load latest auto-save
   */
  async loadLatestAutoSave(): Promise<LoadGameResult> {
    try {
      const loadResult = await this.gameSaveRepository.getLatestAutoSave();

      if (!loadResult.success || !loadResult.gameData) {
        return {
          success: false,
          error: 'No auto-save found'
        };
      }

      return this.execute(loadResult.gameData.id);

    } catch (error) {
      console.error('Error loading latest auto-save:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get list of available saves
   */
  async getAvailableSaves(filter?: SaveListFilter): Promise<SaveSlot[]> {
    try {
      let saves: SaveSlot[] = [];

      if (filter?.difficulty) {
        saves = await this.gameSaveRepository.findByDifficulty(filter.difficulty);
      } else if (filter?.status === 'completed') {
        saves = await this.gameSaveRepository.findCompleted();
      } else if (filter?.status === 'in_progress') {
        saves = await this.gameSaveRepository.findInProgress();
      } else if (filter?.type === 'auto_save') {
        saves = await this.gameSaveRepository.findAutoSaves();
      } else if (filter?.type === 'named') {
        saves = await this.gameSaveRepository.findNamedSaves();
      } else {
        saves = await this.gameSaveRepository.findAll();
      }

      // Apply additional filters
      if (filter?.dateRange) {
        saves = saves.filter(save =>
          save.lastModified >= filter.dateRange!.start &&
          save.lastModified <= filter.dateRange!.end
        );
      }

      // Sort by preference
      const sortOrder = filter?.sortBy || 'lastModified';
      saves.sort((a, b) => {
        switch (sortOrder) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'createdAt':
            return b.createdAt.getTime() - a.createdAt.getTime();
          case 'lastModified':
          default:
            return b.lastModified.getTime() - a.lastModified.getTime();
        }
      });

      // Apply limit
      if (filter?.limit) {
        saves = saves.slice(0, filter.limit);
      }

      return saves;

    } catch (error) {
      console.error('Error getting available saves:', error);
      return [];
    }
  }

  /**
   * Get save recommendations for continuation
   */
  async getContinueGameRecommendations(): Promise<ContinueRecommendation[]> {
    try {
      const recommendations: ContinueRecommendation[] = [];

      // Get recent in-progress games
      const inProgressSaves = await this.gameSaveRepository.findInProgress();
      const recentInProgress = inProgressSaves
        .sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
        .slice(0, 3);

      for (const save of recentInProgress) {
        const timeSinceLastPlayed = Date.now() - save.lastModified.getTime();
        const hoursAgo = Math.floor(timeSinceLastPlayed / (1000 * 60 * 60));

        let priority: 'low' | 'medium' | 'high' = 'medium';
        let reason = 'In-progress game';

        if (hoursAgo < 1) {
          priority = 'high';
          reason = 'Recently played game';
        } else if (hoursAgo > 24) {
          priority = 'low';
          reason = 'Older in-progress game';
        }

        recommendations.push({
          saveSlot: save,
          priority,
          reason,
          estimatedTimeLeft: this.estimateTimeLeft(save)
        });
      }

      // Get latest auto-save if different from named saves
      const autoSaves = await this.gameSaveRepository.findAutoSaves();
      if (autoSaves.length > 0) {
        const latestAutoSave = autoSaves[0];
        const isAlreadyRecommended = recommendations.some(r => r.saveSlot.id === latestAutoSave.id);

        if (!isAlreadyRecommended) {
          recommendations.push({
            saveSlot: latestAutoSave,
            priority: 'medium',
            reason: 'Latest auto-save',
            estimatedTimeLeft: this.estimateTimeLeft(latestAutoSave)
          });
        }
      }

      return recommendations.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

    } catch (error) {
      console.error('Error getting continue recommendations:', error);
      return [];
    }
  }

  /**
   * Quick continue - load the most recent game
   */
  async quickContinue(): Promise<LoadGameResult> {
    try {
      const recommendations = await this.getContinueGameRecommendations();

      if (recommendations.length === 0) {
        return {
          success: false,
          error: 'No games available to continue'
        };
      }

      return this.execute(recommendations[0].saveSlot.id);

    } catch (error) {
      console.error('Error in quick continue:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate loaded game integrity
   */
  private async validateLoadedGame(gameEntity: GameEntity): Promise<{ valid: boolean; error?: string }> {
    // Check basic structure
    if (!gameEntity.id || !gameEntity.grid || !gameEntity.originalGrid) {
      return { valid: false, error: 'Missing required game data' };
    }

    // Check grid dimensions
    if (gameEntity.grid.length !== 9 || gameEntity.originalGrid.length !== 9) {
      return { valid: false, error: 'Invalid grid dimensions' };
    }

    // Check grid values
    const isValidGrid = gameEntity.grid.every(row =>
      row.length === 9 && row.every(cell => cell >= 0 && cell <= 9)
    );

    if (!isValidGrid) {
      return { valid: false, error: 'Invalid grid values' };
    }

    // Check that current grid is based on original
    const originalClues = gameEntity.originalGrid.flat().filter(cell => cell !== 0).length;
    const currentValues = gameEntity.grid.flat().filter(cell => cell !== 0).length;

    if (currentValues < originalClues) {
      return { valid: false, error: 'Current grid has fewer values than original' };
    }

    return { valid: true };
  }

  /**
   * Convert GameSave to GameEntity
   */
  private convertToGameEntity(gameSave: GameSave): GameEntity {
    return {
      id: gameSave.id,
      puzzleId: gameSave.puzzleId,
      grid: gameSave.currentState,
      originalGrid: gameSave.originalPuzzle,
      solution: gameSave.originalPuzzle, // This should be the actual solution
      difficulty: gameSave.difficulty,
      startTime: gameSave.startTime,
      currentTime: gameSave.totalPlayTime,
      hintsUsed: gameSave.hintsUsed,
      errorsCount: gameSave.errorsCount,
      isCompleted: gameSave.isCompleted,
      hintUsageHistory: [], // This would need proper conversion
      directSolutionHintsUsed: 0, // This would need to be tracked
      playerProfile: undefined
    };
  }

  /**
   * Estimate time left to complete the game
   */
  private estimateTimeLeft(saveSlot: SaveSlot): number {
    // Simple heuristic based on difficulty and progress
    // This is a placeholder - real implementation would analyze the game state
    const difficultyMultipliers = {
      beginner: 300, // 5 minutes
      easy: 600,     // 10 minutes
      medium: 1200,  // 20 minutes
      hard: 1800,    // 30 minutes
      expert: 2700   // 45 minutes
    };

    // Extract difficulty from name (this is a simple approach)
    const difficulty = Object.keys(difficultyMultipliers).find(diff =>
      saveSlot.name.toLowerCase().includes(diff)
    ) as keyof typeof difficultyMultipliers || 'medium';

    return difficultyMultipliers[difficulty];
  }
}

// Supporting types

export interface LoadGameResult {
  success: boolean;
  gameEntity?: GameEntity;
  saveMetadata?: SaveMetadata;
  error?: string;
}

export interface SaveMetadata {
  saveId: string;
  saveName?: string;
  lastPlayed: Date;
  isCompleted: boolean;
}

export interface SaveListFilter {
  difficulty?: DifficultyLevel;
  status?: 'completed' | 'in_progress';
  type?: 'auto_save' | 'named';
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'name' | 'createdAt' | 'lastModified';
  limit?: number;
}

export interface ContinueRecommendation {
  saveSlot: SaveSlot;
  priority: 'low' | 'medium' | 'high';
  reason: string;
  estimatedTimeLeft: number; // seconds
}