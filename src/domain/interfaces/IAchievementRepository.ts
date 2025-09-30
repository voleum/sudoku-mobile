/**
 * Achievement Repository Interface
 * Based on business requirements from 1.4-functional-requirements.md
 * and database schema from 2.2.4-database-schema.md
 *
 * Defines the contract for achievement data persistence
 */

import {
  Achievement,
  AchievementId,
  AchievementFilter,
  AchievementStatistics,
  AchievementUnlockResult,
  AchievementProgress
} from '../types/AchievementTypes';

export interface IAchievementRepository {
  /**
   * Initialize achievements
   * Creates default achievements if they don't exist
   */
  initialize(): Promise<void>;

  /**
   * Get achievement by ID
   */
  findById(id: AchievementId): Promise<Achievement | null>;

  /**
   * Get all achievements
   */
  findAll(): Promise<Achievement[]>;

  /**
   * Get achievements by filter
   */
  findByFilter(filter: AchievementFilter): Promise<Achievement[]>;

  /**
   * Get unlocked achievements
   */
  findUnlocked(): Promise<Achievement[]>;

  /**
   * Get locked achievements (not yet unlocked)
   */
  findLocked(): Promise<Achievement[]>;

  /**
   * Update achievement progress
   */
  updateProgress(
    id: AchievementId,
    progress: number
  ): Promise<AchievementProgress>;

  /**
   * Unlock achievement
   */
  unlock(id: AchievementId): Promise<AchievementUnlockResult>;

  /**
   * Check if achievement is unlocked
   */
  isUnlocked(id: AchievementId): Promise<boolean>;

  /**
   * Get achievement statistics
   */
  getStatistics(): Promise<AchievementStatistics>;

  /**
   * Get progress for specific achievement
   */
  getProgress(id: AchievementId): Promise<number>;

  /**
   * Reset all achievements (for testing/debugging)
   */
  resetAll(): Promise<void>;

  /**
   * Get achievements by category
   */
  findByCategory(category: string): Promise<Achievement[]>;

  /**
   * Get total points earned
   */
  getTotalPointsEarned(): Promise<number>;

  /**
   * Get recently unlocked achievements
   */
  getRecentlyUnlocked(limit?: number): Promise<Achievement[]>;
}