/**
 * Achievement Evaluator
 * Based on business requirements from 1.4-functional-requirements.md (section 1.4.4)
 *
 * Contains business rules for determining when achievements should be unlocked
 * This is part of the Domain layer - pure business logic with no dependencies
 */

import {
  Achievement,
  AchievementId,
  AchievementEvaluationContext
} from '../types/AchievementTypes';

/**
 * Evaluation rule result
 */
export interface EvaluationRule {
  achievementId: AchievementId;
  shouldUpdate: boolean;
  newProgress?: number;
  shouldUnlock?: boolean;
}

/**
 * Achievement Evaluator
 * Evaluates game events and determines which achievements should be updated or unlocked
 */
export class AchievementEvaluator {
  /**
   * Evaluate achievements based on game completion
   * Returns list of achievements that should be updated
   */
  evaluateGameCompletion(
    context: AchievementEvaluationContext,
    currentAchievements: Achievement[]
  ): EvaluationRule[] {
    const rules: EvaluationRule[] = [];

    if (!context.gameCompleted) {
      return rules;
    }

    // Progressive achievements (games completed count)
    rules.push(...this.evaluateProgressiveAchievements(context, currentAchievements));

    // Time-based achievements (speed records)
    if (context.playTime !== undefined && context.difficulty) {
      rules.push(...this.evaluateTimeBasedAchievements(context, currentAchievements));
    }

    // Special achievements (perfect play, no hints, etc.)
    rules.push(...this.evaluateSpecialAchievements(context, currentAchievements));

    return rules;
  }

  /**
   * Evaluate session-based achievements (not tied to game completion)
   */
  evaluateSessionAchievements(
    context: AchievementEvaluationContext,
    currentAchievements: Achievement[]
  ): EvaluationRule[] {
    const rules: EvaluationRule[] = [];

    // Marathon achievement (60+ minutes continuous play)
    if (context.sessionDuration !== undefined && context.sessionDuration >= 3600) {
      const marathon = currentAchievements.find(a => a.id === AchievementId.MARATHON);
      if (marathon && !marathon.isUnlocked) {
        rules.push({
          achievementId: AchievementId.MARATHON,
          shouldUpdate: true,
          newProgress: 1,
          shouldUnlock: true
        });
      }
    }

    // Daily player achievement (7 consecutive days)
    if (context.consecutiveDaysPlayed !== undefined && context.consecutiveDaysPlayed >= 7) {
      const dailyPlayer = currentAchievements.find(a => a.id === AchievementId.DAILY_PLAYER);
      if (dailyPlayer && !dailyPlayer.isUnlocked) {
        rules.push({
          achievementId: AchievementId.DAILY_PLAYER,
          shouldUpdate: true,
          newProgress: 7,
          shouldUnlock: true
        });
      }
    }

    return rules;
  }

  /**
   * Progressive achievements: Новичок(1), Любитель(10), Энтузиаст(50), Мастер(100), Гроссмейстер(500)
   */
  private evaluateProgressiveAchievements(
    context: AchievementEvaluationContext,
    currentAchievements: Achievement[]
  ): EvaluationRule[] {
    const rules: EvaluationRule[] = [];
    const totalGames = context.totalGamesCompleted || 0;

    const progressiveAchievements = [
      { id: AchievementId.NEWBIE, target: 1 },
      { id: AchievementId.AMATEUR, target: 10 },
      { id: AchievementId.ENTHUSIAST, target: 50 },
      { id: AchievementId.MASTER, target: 100 },
      { id: AchievementId.GRANDMASTER, target: 500 }
    ];

    for (const progressive of progressiveAchievements) {
      const achievement = currentAchievements.find(a => a.id === progressive.id);
      if (achievement && !achievement.isUnlocked) {
        rules.push({
          achievementId: progressive.id,
          shouldUpdate: true,
          newProgress: totalGames,
          shouldUnlock: totalGames >= progressive.target
        });
      }
    }

    return rules;
  }

  /**
   * Time-based achievements: Speed demon(<3min easy), Efficiency(<15min medium), Lightning(<30min hard)
   */
  private evaluateTimeBasedAchievements(
    context: AchievementEvaluationContext,
    currentAchievements: Achievement[]
  ): EvaluationRule[] {
    const rules: EvaluationRule[] = [];
    const playTimeMinutes = (context.playTime || 0) / 60;

    // Speed Demon: Easy difficulty in under 3 minutes
    if (context.difficulty === 'easy' && playTimeMinutes < 3) {
      const speedDemon = currentAchievements.find(a => a.id === AchievementId.SPEED_DEMON);
      if (speedDemon && !speedDemon.isUnlocked) {
        rules.push({
          achievementId: AchievementId.SPEED_DEMON,
          shouldUpdate: true,
          newProgress: 1,
          shouldUnlock: true
        });
      }
    }

    // Efficiency: Medium difficulty in under 15 minutes
    if (context.difficulty === 'medium' && playTimeMinutes < 15) {
      const efficiency = currentAchievements.find(a => a.id === AchievementId.EFFICIENCY);
      if (efficiency && !efficiency.isUnlocked) {
        rules.push({
          achievementId: AchievementId.EFFICIENCY,
          shouldUpdate: true,
          newProgress: 1,
          shouldUnlock: true
        });
      }
    }

    // Lightning: Hard difficulty in under 30 minutes
    if (context.difficulty === 'hard' && playTimeMinutes < 30) {
      const lightning = currentAchievements.find(a => a.id === AchievementId.LIGHTNING);
      if (lightning && !lightning.isUnlocked) {
        rules.push({
          achievementId: AchievementId.LIGHTNING,
          shouldUpdate: true,
          newProgress: 1,
          shouldUnlock: true
        });
      }
    }

    return rules;
  }

  /**
   * Special achievements: Perfectionist(no errors), No hints, Marathon(60min), Daily(7 days)
   */
  private evaluateSpecialAchievements(
    context: AchievementEvaluationContext,
    currentAchievements: Achievement[]
  ): EvaluationRule[] {
    const rules: EvaluationRule[] = [];

    // Perfectionist: Complete game without errors
    if (context.errorsCount === 0) {
      const perfectionist = currentAchievements.find(a => a.id === AchievementId.PERFECTIONIST);
      if (perfectionist && !perfectionist.isUnlocked) {
        rules.push({
          achievementId: AchievementId.PERFECTIONIST,
          shouldUpdate: true,
          newProgress: 1,
          shouldUnlock: true
        });
      }
    }

    // No Hints: Complete game without using hints
    if (context.hintsUsed === 0) {
      const noHints = currentAchievements.find(a => a.id === AchievementId.NO_HINTS);
      if (noHints && !noHints.isUnlocked) {
        rules.push({
          achievementId: AchievementId.NO_HINTS,
          shouldUpdate: true,
          newProgress: 1,
          shouldUnlock: true
        });
      }
    }

    return rules;
  }

  /**
   * Validate achievement progress against business rules
   */
  validateProgress(achievement: Achievement, newProgress: number): boolean {
    // Progress cannot be negative
    if (newProgress < 0) {
      return false;
    }

    // Progress cannot exceed target
    if (newProgress > achievement.progressTarget) {
      return false;
    }

    // Progress must increase (or stay same for single achievements)
    if (newProgress < achievement.progressCurrent) {
      return false;
    }

    return true;
  }

  /**
   * Check if achievement should be automatically unlocked when progress reaches target
   */
  shouldAutoUnlock(achievement: Achievement, newProgress: number): boolean {
    return newProgress >= achievement.progressTarget && !achievement.isUnlocked;
  }
}