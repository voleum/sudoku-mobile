/**
 * Initialize Achievements Use Case
 * Based on business requirements from 1.4-functional-requirements.md (section 1.4.4)
 *
 * This use case handles initialization of the achievement system
 */

import { IAchievementRepository } from '../../../domain/interfaces/IAchievementRepository';

/**
 * Use case for initializing the achievement system
 */
export class InitializeAchievementsUseCase {
  constructor(
    private readonly achievementRepository: IAchievementRepository
  ) {}

  /**
   * Initialize achievements
   * Creates default achievements if they don't exist
   */
  async execute(): Promise<InitializeResult> {
    try {
      console.log('Initializing achievement system...');

      // Initialize repository (creates tables, inserts default achievements)
      await this.achievementRepository.initialize();

      // Verify initialization
      const allAchievements = await this.achievementRepository.findAll();
      const statistics = await this.achievementRepository.getStatistics();

      console.log(`Achievement system initialized. Total achievements: ${allAchievements.length}`);

      return {
        success: true,
        totalAchievements: allAchievements.length,
        statistics
      };

    } catch (error) {
      console.error('Error initializing achievement system:', error);
      return {
        success: false,
        totalAchievements: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Reset all achievements (for testing/debugging)
   * WARNING: This will delete all achievement progress!
   */
  async resetAll(): Promise<ResetResult> {
    try {
      console.warn('Resetting all achievements...');

      await this.achievementRepository.resetAll();
      await this.achievementRepository.initialize();

      const allAchievements = await this.achievementRepository.findAll();

      console.log('All achievements have been reset.');

      return {
        success: true,
        message: `All achievements reset. Total achievements: ${allAchievements.length}`
      };

    } catch (error) {
      console.error('Error resetting achievements:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Verify achievement system integrity
   */
  async verifyIntegrity(): Promise<VerifyResult> {
    try {
      const allAchievements = await this.achievementRepository.findAll();
      const issues: string[] = [];

      // Check if all achievements have valid data
      for (const achievement of allAchievements) {
        // Check required fields
        if (!achievement.id) {
          issues.push(`Achievement missing ID`);
        }
        if (!achievement.title) {
          issues.push(`Achievement ${achievement.id} missing title`);
        }
        if (!achievement.description) {
          issues.push(`Achievement ${achievement.id} missing description`);
        }

        // Check progress consistency
        if (achievement.progressCurrent < 0) {
          issues.push(`Achievement ${achievement.id} has negative progress`);
        }
        if (achievement.progressTarget < 0) {
          issues.push(`Achievement ${achievement.id} has negative target`);
        }
        if (achievement.progressCurrent > achievement.progressTarget) {
          issues.push(`Achievement ${achievement.id} progress exceeds target`);
        }

        // Check unlocked status consistency
        if (achievement.isUnlocked && achievement.progressCurrent < achievement.progressTarget) {
          issues.push(`Achievement ${achievement.id} is unlocked but progress < target`);
        }
        if (achievement.isUnlocked && !achievement.unlockedAt) {
          issues.push(`Achievement ${achievement.id} is unlocked but missing unlock timestamp`);
        }
      }

      const isValid = issues.length === 0;

      return {
        success: isValid,
        totalAchievements: allAchievements.length,
        issues,
        message: isValid
          ? 'Achievement system integrity verified successfully'
          : `Found ${issues.length} integrity issue(s)`
      };

    } catch (error) {
      console.error('Error verifying achievement integrity:', error);
      return {
        success: false,
        totalAchievements: 0,
        issues: ['Failed to verify integrity'],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Supporting types

export interface InitializeResult {
  success: boolean;
  totalAchievements: number;
  statistics?: {
    totalAchievements: number;
    unlockedAchievements: number;
    progressPercentage: number;
  };
  error?: string;
}

export interface ResetResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface VerifyResult {
  success: boolean;
  totalAchievements: number;
  issues: string[];
  message?: string;
  error?: string;
}