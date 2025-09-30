/**
 * Get Achievements Use Case
 * Based on business requirements from 1.4-functional-requirements.md (section 1.4.4)
 *
 * This use case handles retrieving achievements with various filters
 */

import { IAchievementRepository } from '../../../domain/interfaces/IAchievementRepository';
import {
  Achievement,
  AchievementId,
  AchievementFilter,
  AchievementStatistics,
  AchievementCategory
} from '../../../domain/types/AchievementTypes';

/**
 * Use case for retrieving achievements
 */
export class GetAchievementsUseCase {
  constructor(
    private readonly achievementRepository: IAchievementRepository
  ) {}

  /**
   * Get all achievements
   */
  async getAllAchievements(): Promise<Achievement[]> {
    try {
      return await this.achievementRepository.findAll();
    } catch (error) {
      console.error('Error getting all achievements:', error);
      return [];
    }
  }

  /**
   * Get achievement by ID
   */
  async getAchievementById(id: AchievementId): Promise<Achievement | null> {
    try {
      return await this.achievementRepository.findById(id);
    } catch (error) {
      console.error(`Error getting achievement ${id}:`, error);
      return null;
    }
  }

  /**
   * Get achievements by filter
   */
  async getAchievementsByFilter(filter: AchievementFilter): Promise<Achievement[]> {
    try {
      return await this.achievementRepository.findByFilter(filter);
    } catch (error) {
      console.error('Error getting achievements by filter:', error);
      return [];
    }
  }

  /**
   * Get unlocked achievements
   */
  async getUnlockedAchievements(): Promise<Achievement[]> {
    try {
      return await this.achievementRepository.findUnlocked();
    } catch (error) {
      console.error('Error getting unlocked achievements:', error);
      return [];
    }
  }

  /**
   * Get locked achievements (not yet unlocked)
   */
  async getLockedAchievements(): Promise<Achievement[]> {
    try {
      return await this.achievementRepository.findLocked();
    } catch (error) {
      console.error('Error getting locked achievements:', error);
      return [];
    }
  }

  /**
   * Get achievements by category
   */
  async getAchievementsByCategory(category: AchievementCategory): Promise<Achievement[]> {
    try {
      return await this.achievementRepository.findByCategory(category);
    } catch (error) {
      console.error(`Error getting achievements by category ${category}:`, error);
      return [];
    }
  }

  /**
   * Get achievement statistics
   */
  async getStatistics(): Promise<AchievementStatistics | null> {
    try {
      return await this.achievementRepository.getStatistics();
    } catch (error) {
      console.error('Error getting achievement statistics:', error);
      return null;
    }
  }

  /**
   * Get achievement progress
   */
  async getProgress(id: AchievementId): Promise<number> {
    try {
      return await this.achievementRepository.getProgress(id);
    } catch (error) {
      console.error(`Error getting progress for achievement ${id}:`, error);
      return 0;
    }
  }

  /**
   * Get total points earned
   */
  async getTotalPointsEarned(): Promise<number> {
    try {
      return await this.achievementRepository.getTotalPointsEarned();
    } catch (error) {
      console.error('Error getting total points earned:', error);
      return 0;
    }
  }

  /**
   * Get recently unlocked achievements
   */
  async getRecentlyUnlocked(limit: number = 5): Promise<Achievement[]> {
    try {
      return await this.achievementRepository.getRecentlyUnlocked(limit);
    } catch (error) {
      console.error('Error getting recently unlocked achievements:', error);
      return [];
    }
  }

  /**
   * Check if achievement is unlocked
   */
  async isAchievementUnlocked(id: AchievementId): Promise<boolean> {
    try {
      return await this.achievementRepository.isUnlocked(id);
    } catch (error) {
      console.error(`Error checking if achievement ${id} is unlocked:`, error);
      return false;
    }
  }

  /**
   * Get achievements grouped by category with statistics
   */
  async getAchievementsByCategoryWithStats(): Promise<Map<AchievementCategory, {
    achievements: Achievement[];
    total: number;
    unlocked: number;
    percentage: number;
  }>> {
    try {
      const allAchievements = await this.achievementRepository.findAll();
      const result = new Map<AchievementCategory, {
        achievements: Achievement[];
        total: number;
        unlocked: number;
        percentage: number;
      }>();

      // Group by category
      for (const category of Object.values(AchievementCategory)) {
        const categoryAchievements = allAchievements.filter(a => a.category === category);
        const unlockedCount = categoryAchievements.filter(a => a.isUnlocked).length;
        const totalCount = categoryAchievements.length;
        const percentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

        result.set(category, {
          achievements: categoryAchievements,
          total: totalCount,
          unlocked: unlockedCount,
          percentage
        });
      }

      return result;

    } catch (error) {
      console.error('Error getting achievements by category with stats:', error);
      return new Map();
    }
  }

  /**
   * Get achievements close to unlocking (for motivation)
   */
  async getAchievementsCloseToUnlocking(threshold: number = 0.8): Promise<Achievement[]> {
    try {
      const lockedAchievements = await this.achievementRepository.findLocked();

      // Filter achievements that are close to target (>= threshold%)
      return lockedAchievements.filter(achievement => {
        if (achievement.progressTarget === 0) {
          return false;
        }
        const progressPercentage = achievement.progressCurrent / achievement.progressTarget;
        return progressPercentage >= threshold;
      }).sort((a, b) => {
        // Sort by closest to completion
        const percentageA = a.progressCurrent / a.progressTarget;
        const percentageB = b.progressCurrent / b.progressTarget;
        return percentageB - percentageA;
      });

    } catch (error) {
      console.error('Error getting achievements close to unlocking:', error);
      return [];
    }
  }
}