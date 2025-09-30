/**
 * Evaluate Achievements Use Case
 * Based on business requirements from 1.4-functional-requirements.md (section 1.4.4)
 *
 * This use case evaluates game events and determines which achievements should be updated or unlocked
 */

import { IAchievementRepository } from '../../../domain/interfaces/IAchievementRepository';
import { AchievementEvaluator, EvaluationRule } from '../../../domain/rules/AchievementEvaluator';
import {
  AchievementEvaluationContext,
  AchievementEvaluationResult,
  Achievement,
  AchievementNotification
} from '../../../domain/types/AchievementTypes';

/**
 * Use case for evaluating achievements based on game events
 */
export class EvaluateAchievementsUseCase {
  private evaluator: AchievementEvaluator;

  constructor(
    private readonly achievementRepository: IAchievementRepository
  ) {
    this.evaluator = new AchievementEvaluator();
  }

  /**
   * Evaluate achievements after game completion
   */
  async evaluateGameCompletion(
    context: AchievementEvaluationContext
  ): Promise<AchievementEvaluationResult> {
    try {
      // Get all current achievements
      const currentAchievements = await this.achievementRepository.findAll();

      // Evaluate which achievements should be updated
      const evaluationRules = this.evaluator.evaluateGameCompletion(
        context,
        currentAchievements
      );

      // Apply the evaluation rules
      return await this.applyEvaluationRules(evaluationRules, currentAchievements);

    } catch (error) {
      console.error('Error evaluating achievements:', error);
      return {
        newlyUnlocked: [],
        progressUpdated: [],
        notifications: []
      };
    }
  }

  /**
   * Evaluate session-based achievements (not tied to game completion)
   */
  async evaluateSession(
    context: AchievementEvaluationContext
  ): Promise<AchievementEvaluationResult> {
    try {
      // Get all current achievements
      const currentAchievements = await this.achievementRepository.findAll();

      // Evaluate session achievements (Marathon, Daily Player, etc.)
      const evaluationRules = this.evaluator.evaluateSessionAchievements(
        context,
        currentAchievements
      );

      // Apply the evaluation rules
      return await this.applyEvaluationRules(evaluationRules, currentAchievements);

    } catch (error) {
      console.error('Error evaluating session achievements:', error);
      return {
        newlyUnlocked: [],
        progressUpdated: [],
        notifications: []
      };
    }
  }

  /**
   * Evaluate error-free streak achievements
   */
  async evaluateErrorFreeStreak(
    consecutiveErrorFreeGames: number
  ): Promise<AchievementEvaluationResult> {
    try {
      const currentAchievements = await this.achievementRepository.findAll();
      const evaluationRules = this.evaluator.evaluateErrorFreeStreak(
        consecutiveErrorFreeGames,
        currentAchievements
      );

      return await this.applyEvaluationRules(evaluationRules, currentAchievements);

    } catch (error) {
      console.error('Error evaluating error-free streak:', error);
      return {
        newlyUnlocked: [],
        progressUpdated: [],
        notifications: []
      };
    }
  }

  /**
   * Evaluate hint-free streak achievements
   */
  async evaluateHintFreeStreak(
    consecutiveHintFreeGames: number
  ): Promise<AchievementEvaluationResult> {
    try {
      const currentAchievements = await this.achievementRepository.findAll();
      const evaluationRules = this.evaluator.evaluateHintFreeStreak(
        consecutiveHintFreeGames,
        currentAchievements
      );

      return await this.applyEvaluationRules(evaluationRules, currentAchievements);

    } catch (error) {
      console.error('Error evaluating hint-free streak:', error);
      return {
        newlyUnlocked: [],
        progressUpdated: [],
        notifications: []
      };
    }
  }

  /**
   * Apply evaluation rules and update achievements in repository
   */
  private async applyEvaluationRules(
    rules: EvaluationRule[],
    currentAchievements: Achievement[]
  ): Promise<AchievementEvaluationResult> {
    const result: AchievementEvaluationResult = {
      newlyUnlocked: [],
      progressUpdated: [],
      notifications: []
    };

    for (const rule of rules) {
      if (!rule.shouldUpdate) {
        continue;
      }

      try {
        // Update progress
        if (rule.newProgress !== undefined) {
          const progressResult = await this.achievementRepository.updateProgress(
            rule.achievementId,
            rule.newProgress
          );

          result.progressUpdated.push(progressResult);

          // Check if newly unlocked
          if (progressResult.isNewlyUnlocked) {
            const achievement = currentAchievements.find(a => a.id === rule.achievementId);
            if (achievement) {
              result.newlyUnlocked.push({
                ...achievement,
                isUnlocked: true,
                progressCurrent: rule.newProgress,
                unlockedAt: progressResult.unlockedAt
              });

              // Create notification for newly unlocked achievement
              result.notifications.push(this.createNotification(achievement));
            }
          }
        }

        // Unlock achievement directly if specified
        if (rule.shouldUnlock && !result.newlyUnlocked.find(a => a.id === rule.achievementId)) {
          const unlockResult = await this.achievementRepository.unlock(rule.achievementId);
          if (unlockResult.success && unlockResult.achievement) {
            result.newlyUnlocked.push(unlockResult.achievement);
            result.notifications.push(this.createNotification(unlockResult.achievement));
          }
        }

      } catch (error) {
        console.error(`Error applying rule for achievement ${rule.achievementId}:`, error);
        // Continue with other rules even if one fails
      }
    }

    return result;
  }

  /**
   * Create notification for unlocked achievement
   */
  private createNotification(achievement: Achievement): AchievementNotification {
    return {
      achievement,
      message: `Достижение разблокировано: ${achievement.title}!`,
      timestamp: new Date(),
      displayed: false
    };
  }
}