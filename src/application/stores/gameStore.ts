import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  GameEntity,
  CellPosition,
  DifficultyLevel,
  HintLevel,
  HintResponse,
  SaveSlot,
  SaveOperationResult,
  LoadGameResult,
  SaveSettings
} from '../../domain/types/GameTypes';
import { MoveValidator } from '../../domain/rules';
import { SaveGameUseCase, LoadGameUseCase, ManageSavesUseCase } from '../usecases/save';
import { SQLiteGameSaveRepository } from '../../infrastructure/repositories/SQLiteGameSaveRepository';
import { DatabaseManager } from '../../infrastructure/storage/DatabaseManager';
import { AchievementEvaluationContext } from '../../domain/types/AchievementTypes';

interface GameStore {
  // Game State
  currentGame: GameEntity | null;
  selectedCell: CellPosition | null;
  currentHint: HintResponse | null;
  isHintActive: boolean;

  // Save/Load State
  availableSaves: SaveSlot[];
  isLoading: boolean;
  saveSettings: SaveSettings;
  lastAutoSaveTime?: Date;
  autoSaveInterval?: ReturnType<typeof setInterval>;

  // Session tracking for achievements
  sessionStartTime?: Date;
  totalGamesCompleted: number;
  currentStreak: number;
  consecutiveDaysPlayed: number;

  // Game Actions
  startNewGame: (difficulty: DifficultyLevel) => void;
  selectCell: (row: number, col: number) => void;
  useHint: (level: HintLevel) => Promise<void>;
  clearHint: () => void;
  setCurrentGame: (game: GameEntity) => void;
  completeGame: (game: GameEntity) => Promise<void>;

  // Save/Load Actions
  saveGame: (name?: string) => Promise<SaveOperationResult>;
  loadGame: (saveId: string) => Promise<LoadGameResult>;
  deleteGame: (saveId: string) => Promise<boolean>;
  refreshSavesList: () => Promise<void>;
  initializeSaveSystem: () => Promise<void>;
  enableAutoSave: (intervalSeconds?: number) => void;
  disableAutoSave: () => void;
  quickSave: () => Promise<SaveOperationResult>;
  quickLoad: () => Promise<LoadGameResult>;
  exportSaves: (saveIds: string[]) => Promise<string>;
  importSaves: (jsonData: string) => Promise<void>;

  // Auto-save functionality
  triggerAutoSave: () => Promise<void>;
  updateSaveSettings: (settings: Partial<SaveSettings>) => void;

  // Cleanup functionality
  cleanup: () => void;
}

// Initialize use cases and repository outside the store
let saveGameUseCase: SaveGameUseCase;
let loadGameUseCase: LoadGameUseCase;
let manageSavesUseCase: ManageSavesUseCase;

const initializeUseCases = async () => {
  try {
    const dbManager = DatabaseManager.getInstance();
    await dbManager.initialize();

    const repository = new SQLiteGameSaveRepository();
    saveGameUseCase = new SaveGameUseCase(repository);
    loadGameUseCase = new LoadGameUseCase(repository);
    manageSavesUseCase = new ManageSavesUseCase(repository);
  } catch (error) {
    console.error('Failed to initialize save system:', error);
  }
};

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Game State
        currentGame: null,
        selectedCell: null,
        currentHint: null,
        isHintActive: false,

        // Save/Load State
        availableSaves: [],
        isLoading: false,
        saveSettings: {
          autoSaveEnabled: true,
          autoSaveInterval: 30, // 30 seconds
          maxNamedSaves: 20,
          autoDeleteOldSaves: true,
          maxAutoSaves: 10
        },
        lastAutoSaveTime: undefined,
        autoSaveInterval: undefined,

        // Session tracking for achievements
        sessionStartTime: new Date(),
        totalGamesCompleted: 0,
        currentStreak: 0,
        consecutiveDaysPlayed: 0,

        // Game Actions
        startNewGame: (difficulty) => {
          console.log('Start new game:', difficulty);
          // Clear any active hints when starting new game
          set({ currentHint: null, isHintActive: false });

          // Trigger auto-save setup if enabled
          const { saveSettings, enableAutoSave } = get();
          if (saveSettings.autoSaveEnabled) {
            enableAutoSave(saveSettings.autoSaveInterval);
          }
        },

        selectCell: (row, col) => {
          set({ selectedCell: MoveValidator.createCellPosition(row, col) });
        },

        useHint: async (level: HintLevel) => {
          const { currentGame, triggerAutoSave } = get();
          if (!currentGame) {
            throw new Error('No active game to provide hints for');
          }

          // Calculate rating penalty based on hint level according to Business Analysis
          const getRatingPenalty = (hintLevel: HintLevel): number => {
            switch (hintLevel) {
              case HintLevel.GENERAL_DIRECTION: return 5;
              case HintLevel.SPECIFIC_TECHNIQUE: return 10;
              case HintLevel.EXACT_LOCATION: return 20;
              case HintLevel.DIRECT_SOLUTION: return 50;
              default: return 5;
            }
          };

          // For now, set a placeholder hint
          const placeholderHint: HintResponse = {
            level,
            message: 'Hint system will be integrated with dependency injection',
            targetCells: [],
            relatedCells: [],
            confidence: 0.5,
            colorHighlights: [],
            ratingPenalty: getRatingPenalty(level)
          };

          set({
            currentHint: placeholderHint,
            isHintActive: true
          });

          // Auto-save after hint usage
          await triggerAutoSave();
        },

        clearHint: () => {
          set({ currentHint: null, isHintActive: false });
        },

        setCurrentGame: (game: GameEntity) => {
          set({ currentGame: game });
        },

        completeGame: async (game: GameEntity): Promise<void> => {
          try {
            // Update game statistics
            const { totalGamesCompleted, currentStreak, sessionStartTime } = get();
            set({
              currentGame: { ...game, isCompleted: true },
              totalGamesCompleted: totalGamesCompleted + 1,
              currentStreak: currentStreak + 1
            });

            // Prepare achievement evaluation context
            const context: AchievementEvaluationContext = {
              gameCompleted: true,
              difficulty: game.difficulty,
              playTime: game.currentTime,
              hintsUsed: game.hintsUsed,
              errorsCount: game.errorsCount,
              totalGamesCompleted: totalGamesCompleted + 1,
              currentStreak: currentStreak + 1,
              sessionDuration: sessionStartTime
                ? Math.floor((Date.now() - sessionStartTime.getTime()) / 1000)
                : 0
            };

            // Dynamically import achievement store to avoid circular dependencies
            const { useAchievementStore } = await import('./achievementStore');
            const achievementStore = useAchievementStore.getState();

            // Evaluate achievements
            await achievementStore.evaluateGameCompletion(context);

            console.log('Game completed and achievements evaluated');
          } catch (error) {
            console.error('Error completing game:', error);
          }
        },

        // Save/Load Actions
        saveGame: async (name?: string): Promise<SaveOperationResult> => {
          const { currentGame } = get();
          if (!currentGame || !saveGameUseCase) {
            return { success: false, error: 'No game to save or save system not initialized' };
          }

          set({ isLoading: true });
          try {
            const result = name
              ? await saveGameUseCase.saveWithName(currentGame, name)
              : await saveGameUseCase.execute(currentGame);

            if (result.success) {
              await get().refreshSavesList();
            }

            return result;
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          } finally {
            set({ isLoading: false });
          }
        },

        loadGame: async (saveId: string): Promise<LoadGameResult> => {
          if (!loadGameUseCase) {
            return { success: false, error: 'Save system not initialized' };
          }

          set({ isLoading: true });
          try {
            const result = await loadGameUseCase.execute(saveId);

            if (result.success && result.gameEntity) {
              set({ currentGame: result.gameEntity });

              // Setup auto-save for loaded game
              const { saveSettings, enableAutoSave } = get();
              if (saveSettings.autoSaveEnabled) {
                enableAutoSave(saveSettings.autoSaveInterval);
              }
            }

            return result;
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          } finally {
            set({ isLoading: false });
          }
        },

        deleteGame: async (saveId: string): Promise<boolean> => {
          if (!manageSavesUseCase) {
            return false;
          }

          set({ isLoading: true });
          try {
            const result = await manageSavesUseCase.deleteSave(saveId);

            if (result.success) {
              await get().refreshSavesList();
            }

            return result.success;
          } catch (error) {
            console.error('Error deleting game:', error);
            return false;
          } finally {
            set({ isLoading: false });
          }
        },

        refreshSavesList: async (): Promise<void> => {
          if (!loadGameUseCase) {
            return;
          }

          try {
            const saves = await loadGameUseCase.getAvailableSaves();
            set({ availableSaves: saves });
          } catch (error) {
            console.error('Error refreshing saves list:', error);
          }
        },

        initializeSaveSystem: async (): Promise<void> => {
          try {
            await initializeUseCases();
            await get().refreshSavesList();

            // Initialize achievement system as well
            const { useAchievementStore } = await import('./achievementStore');
            const achievementStore = useAchievementStore.getState();
            await achievementStore.initialize();
          } catch (error) {
            console.error('Error initializing save system:', error);
          }
        },

        enableAutoSave: (intervalSeconds: number = 30): void => {
          const { disableAutoSave, triggerAutoSave } = get();

          // Clear existing interval
          disableAutoSave();

          // Set new interval
          const interval = setInterval(() => {
            triggerAutoSave();
          }, intervalSeconds * 1000);

          set({ autoSaveInterval: interval });
        },

        disableAutoSave: (): void => {
          const { autoSaveInterval } = get();
          if (autoSaveInterval) {
            clearInterval(autoSaveInterval);
            set({ autoSaveInterval: undefined });
          }
        },

        quickSave: async (): Promise<SaveOperationResult> => {
          const { currentGame } = get();
          if (!currentGame || !saveGameUseCase) {
            return { success: false, error: 'No game to save or save system not initialized' };
          }

          return await saveGameUseCase.quickSave(currentGame);
        },

        quickLoad: async (): Promise<LoadGameResult> => {
          if (!loadGameUseCase) {
            return { success: false, error: 'Save system not initialized' };
          }

          const result = await loadGameUseCase.quickContinue();

          if (result.success && result.gameEntity) {
            set({ currentGame: result.gameEntity });
          }

          return result;
        },

        exportSaves: async (saveIds: string[]): Promise<string> => {
          if (!manageSavesUseCase) {
            throw new Error('Save system not initialized');
          }

          const result = await manageSavesUseCase.exportSaves(saveIds);
          if (!result.success || !result.exportData) {
            throw new Error(result.error || 'Export failed');
          }

          return result.exportData;
        },

        importSaves: async (jsonData: string): Promise<void> => {
          if (!manageSavesUseCase) {
            throw new Error('Save system not initialized');
          }

          const result = await manageSavesUseCase.importSaves(jsonData);
          if (result.success) {
            await get().refreshSavesList();
          } else {
            throw new Error(result.errors.join(', '));
          }
        },

        triggerAutoSave: async (): Promise<void> => {
          const { currentGame, saveSettings } = get();

          if (!currentGame || !saveGameUseCase || !saveSettings.autoSaveEnabled) {
            return;
          }

          try {
            await saveGameUseCase.autoSave(currentGame);
            set({ lastAutoSaveTime: new Date() });
          } catch (error) {
            console.error('Auto-save failed:', error);
          }
        },

        updateSaveSettings: (settings: Partial<SaveSettings>): void => {
          const currentSettings = get().saveSettings;
          const newSettings = { ...currentSettings, ...settings };

          set({ saveSettings: newSettings });

          // Update auto-save behavior
          if (newSettings.autoSaveEnabled && !currentSettings.autoSaveEnabled) {
            get().enableAutoSave(newSettings.autoSaveInterval);
          } else if (!newSettings.autoSaveEnabled && currentSettings.autoSaveEnabled) {
            get().disableAutoSave();
          } else if (newSettings.autoSaveEnabled && newSettings.autoSaveInterval !== currentSettings.autoSaveInterval) {
            get().enableAutoSave(newSettings.autoSaveInterval);
          }
        },

        cleanup: (): void => {
          const { disableAutoSave } = get();

          // Clear auto-save interval to prevent memory leaks
          disableAutoSave();

          // Reset volatile state
          set({
            currentHint: null,
            isHintActive: false,
            isLoading: false,
            lastAutoSaveTime: undefined
          });

          console.log('GameStore cleanup completed');
        }
      }),
      {
        name: 'sudoku-game-store',
        // Don't persist hints as they are temporary
        partialize: (state) => ({
          currentGame: state.currentGame,
          selectedCell: state.selectedCell,
          saveSettings: state.saveSettings
        })
      }
    )
  )
);