/**
 * Achievement Store
 * Based on business requirements from 1.4-functional-requirements.md (section 1.4.4)
 *
 * Zustand store for managing achievement state
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Achievement,
  AchievementId,
  AchievementFilter,
  AchievementStatistics,
  AchievementNotification,
  AchievementEvaluationContext,
  AchievementEvaluationResult,
  AchievementCategory
} from '../../domain/types/AchievementTypes';
import { DatabaseManager } from '../../infrastructure/storage/DatabaseManager';
import { SQLiteAchievementRepository } from '../../infrastructure/repositories/SQLiteAchievementRepository';
import {
  EvaluateAchievementsUseCase,
  GetAchievementsUseCase,
  InitializeAchievementsUseCase
} from '../usecases/achievements';

interface AchievementStore {
  // State
  achievements: Achievement[];
  statistics: AchievementStatistics | null;
  notifications: AchievementNotification[];
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  getAllAchievements: () => Promise<Achievement[]>;
  getAchievementById: (id: AchievementId) => Promise<Achievement | null>;
  getAchievementsByFilter: (filter: AchievementFilter) => Promise<Achievement[]>;
  getUnlockedAchievements: () => Promise<Achievement[]>;
  getLockedAchievements: () => Promise<Achievement[]>;
  getAchievementsByCategory: (category: AchievementCategory) => Promise<Achievement[]>;
  getStatistics: () => Promise<AchievementStatistics | null>;
  getTotalPointsEarned: () => Promise<number>;
  getRecentlyUnlocked: (limit?: number) => Promise<Achievement[]>;

  // Evaluation actions
  evaluateGameCompletion: (context: AchievementEvaluationContext) => Promise<AchievementEvaluationResult>;
  evaluateSession: (context: AchievementEvaluationContext) => Promise<AchievementEvaluationResult>;

  // Notification actions
  dismissNotification: (achievementId: AchievementId) => void;
  clearAllNotifications: () => void;

  // Utility actions
  refreshAchievements: () => Promise<void>;
  resetAllAchievements: () => Promise<void>;
}

// Initialize use cases and repository outside the store
let evaluateAchievementsUseCase: EvaluateAchievementsUseCase;
let getAchievementsUseCase: GetAchievementsUseCase;
let initializeAchievementsUseCase: InitializeAchievementsUseCase;

const initializeUseCases = async () => {
  try {
    const dbManager = DatabaseManager.getInstance();
    await dbManager.initialize();

    const repository = new SQLiteAchievementRepository();
    evaluateAchievementsUseCase = new EvaluateAchievementsUseCase(repository);
    getAchievementsUseCase = new GetAchievementsUseCase(repository);
    initializeAchievementsUseCase = new InitializeAchievementsUseCase(repository);
  } catch (error) {
    console.error('Failed to initialize achievement system:', error);
  }
};

export const useAchievementStore = create<AchievementStore>()(
  devtools(
    (set, get) => ({
      // Initial State
      achievements: [],
      statistics: null,
      notifications: [],
      isLoading: false,
      isInitialized: false,

      // Initialize achievement system
      initialize: async (): Promise<void> => {
        const { isInitialized } = get();
        if (isInitialized) {
          return;
        }

        set({ isLoading: true });
        try {
          await initializeUseCases();

          if (!initializeAchievementsUseCase) {
            throw new Error('Achievement system use cases not initialized');
          }

          const result = await initializeAchievementsUseCase.execute();

          if (result.success) {
            await get().refreshAchievements();
            set({ isInitialized: true });
            console.log('Achievement system initialized successfully');
          } else {
            console.error('Failed to initialize achievement system:', result.error);
          }
        } catch (error) {
          console.error('Error initializing achievement system:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      // Get all achievements
      getAllAchievements: async (): Promise<Achievement[]> => {
        if (!getAchievementsUseCase) {
          return [];
        }

        set({ isLoading: true });
        try {
          const achievements = await getAchievementsUseCase.getAllAchievements();
          set({ achievements });
          return achievements;
        } catch (error) {
          console.error('Error getting all achievements:', error);
          return [];
        } finally {
          set({ isLoading: false });
        }
      },

      // Get achievement by ID
      getAchievementById: async (id: AchievementId): Promise<Achievement | null> => {
        if (!getAchievementsUseCase) {
          return null;
        }

        return await getAchievementsUseCase.getAchievementById(id);
      },

      // Get achievements by filter
      getAchievementsByFilter: async (filter: AchievementFilter): Promise<Achievement[]> => {
        if (!getAchievementsUseCase) {
          return [];
        }

        return await getAchievementsUseCase.getAchievementsByFilter(filter);
      },

      // Get unlocked achievements
      getUnlockedAchievements: async (): Promise<Achievement[]> => {
        if (!getAchievementsUseCase) {
          return [];
        }

        return await getAchievementsUseCase.getUnlockedAchievements();
      },

      // Get locked achievements
      getLockedAchievements: async (): Promise<Achievement[]> => {
        if (!getAchievementsUseCase) {
          return [];
        }

        return await getAchievementsUseCase.getLockedAchievements();
      },

      // Get achievements by category
      getAchievementsByCategory: async (category: AchievementCategory): Promise<Achievement[]> => {
        if (!getAchievementsUseCase) {
          return [];
        }

        return await getAchievementsUseCase.getAchievementsByCategory(category);
      },

      // Get statistics
      getStatistics: async (): Promise<AchievementStatistics | null> => {
        if (!getAchievementsUseCase) {
          return null;
        }

        set({ isLoading: true });
        try {
          const statistics = await getAchievementsUseCase.getStatistics();
          set({ statistics });
          return statistics;
        } catch (error) {
          console.error('Error getting achievement statistics:', error);
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      // Get total points earned
      getTotalPointsEarned: async (): Promise<number> => {
        if (!getAchievementsUseCase) {
          return 0;
        }

        return await getAchievementsUseCase.getTotalPointsEarned();
      },

      // Get recently unlocked achievements
      getRecentlyUnlocked: async (limit: number = 5): Promise<Achievement[]> => {
        if (!getAchievementsUseCase) {
          return [];
        }

        return await getAchievementsUseCase.getRecentlyUnlocked(limit);
      },

      // Evaluate game completion and update achievements
      evaluateGameCompletion: async (
        context: AchievementEvaluationContext
      ): Promise<AchievementEvaluationResult> => {
        if (!evaluateAchievementsUseCase) {
          return {
            newlyUnlocked: [],
            progressUpdated: [],
            notifications: []
          };
        }

        set({ isLoading: true });
        try {
          const result = await evaluateAchievementsUseCase.evaluateGameCompletion(context);

          // Update state with new notifications
          if (result.notifications.length > 0) {
            set(state => ({
              notifications: [...state.notifications, ...result.notifications]
            }));
          }

          // Refresh achievements and statistics if any progress was made
          if (result.newlyUnlocked.length > 0 || result.progressUpdated.length > 0) {
            await get().refreshAchievements();
            await get().getStatistics();
          }

          return result;
        } catch (error) {
          console.error('Error evaluating game completion:', error);
          return {
            newlyUnlocked: [],
            progressUpdated: [],
            notifications: []
          };
        } finally {
          set({ isLoading: false });
        }
      },

      // Evaluate session achievements
      evaluateSession: async (
        context: AchievementEvaluationContext
      ): Promise<AchievementEvaluationResult> => {
        if (!evaluateAchievementsUseCase) {
          return {
            newlyUnlocked: [],
            progressUpdated: [],
            notifications: []
          };
        }

        try {
          const result = await evaluateAchievementsUseCase.evaluateSession(context);

          // Update state with new notifications
          if (result.notifications.length > 0) {
            set(state => ({
              notifications: [...state.notifications, ...result.notifications]
            }));
          }

          // Refresh achievements and statistics if any progress was made
          if (result.newlyUnlocked.length > 0 || result.progressUpdated.length > 0) {
            await get().refreshAchievements();
            await get().getStatistics();
          }

          return result;
        } catch (error) {
          console.error('Error evaluating session:', error);
          return {
            newlyUnlocked: [],
            progressUpdated: [],
            notifications: []
          };
        }
      },

      // Dismiss notification
      dismissNotification: (achievementId: AchievementId): void => {
        set(state => ({
          notifications: state.notifications.filter(n => n.achievement.id !== achievementId)
        }));
      },

      // Clear all notifications
      clearAllNotifications: (): void => {
        set({ notifications: [] });
      },

      // Refresh achievements from repository
      refreshAchievements: async (): Promise<void> => {
        if (!getAchievementsUseCase) {
          return;
        }

        try {
          const achievements = await getAchievementsUseCase.getAllAchievements();
          set({ achievements });
        } catch (error) {
          console.error('Error refreshing achievements:', error);
        }
      },

      // Reset all achievements (for testing/debugging)
      resetAllAchievements: async (): Promise<void> => {
        if (!initializeAchievementsUseCase) {
          return;
        }

        set({ isLoading: true });
        try {
          await initializeAchievementsUseCase.resetAll();
          await get().refreshAchievements();
          await get().getStatistics();
          set({ notifications: [] });
          console.log('All achievements have been reset');
        } catch (error) {
          console.error('Error resetting achievements:', error);
        } finally {
          set({ isLoading: false });
        }
      }
    }),
    { name: 'AchievementStore' }
  )
);