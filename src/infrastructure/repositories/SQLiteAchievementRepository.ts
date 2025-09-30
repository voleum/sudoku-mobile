/**
 * SQLite Achievement Repository Implementation
 * Based on business requirements from 1.4-functional-requirements.md
 * and database schema from 2.2.4-database-schema.md
 */

import {
  Achievement,
  AchievementId,
  AchievementCategory,
  AchievementType,
  AchievementRarity,
  RewardType,
  AchievementFilter,
  AchievementStatistics,
  AchievementUnlockResult,
  AchievementProgress
} from '../../domain/types/AchievementTypes';
import { IAchievementRepository } from '../../domain/interfaces/IAchievementRepository';
import { DatabaseManager } from '../storage/DatabaseManager';
import { DifficultyLevel } from '../../domain/types/GameTypes';

/**
 * Achievement definitions based on business analysis (1.4.4)
 */
const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  // Прогрессивные достижения
  {
    id: AchievementId.NEWBIE,
    category: AchievementCategory.PROGRESSIVE,
    title: 'Новичок',
    description: 'Завершите первую игру',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 1,
    achievementType: AchievementType.SINGLE,
    icon: '🎯',
    rarity: AchievementRarity.COMMON,
    points: 10,
    hidden: false
  },
  {
    id: AchievementId.AMATEUR,
    category: AchievementCategory.PROGRESSIVE,
    title: 'Любитель',
    description: 'Завершите 10 игр',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 10,
    achievementType: AchievementType.PROGRESS,
    icon: '⭐',
    rarity: AchievementRarity.COMMON,
    points: 25,
    hidden: false
  },
  {
    id: AchievementId.ENTHUSIAST,
    category: AchievementCategory.PROGRESSIVE,
    title: 'Энтузиаст',
    description: 'Завершите 50 игр',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 50,
    achievementType: AchievementType.PROGRESS,
    icon: '🌟',
    rarity: AchievementRarity.RARE,
    points: 50,
    hidden: false
  },
  {
    id: AchievementId.MASTER,
    category: AchievementCategory.PROGRESSIVE,
    title: 'Мастер',
    description: 'Завершите 100 игр',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 100,
    achievementType: AchievementType.MILESTONE,
    icon: '💎',
    rarity: AchievementRarity.EPIC,
    points: 100,
    hidden: false
  },
  {
    id: AchievementId.GRANDMASTER,
    category: AchievementCategory.PROGRESSIVE,
    title: 'Гроссмейстер',
    description: 'Завершите 500 игр',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 500,
    achievementType: AchievementType.MILESTONE,
    icon: '👑',
    rarity: AchievementRarity.LEGENDARY,
    points: 500,
    hidden: false
  },

  // Достижения по времени
  {
    id: AchievementId.SPEED_DEMON,
    category: AchievementCategory.TIME_BASED,
    title: 'Скоростной демон',
    description: 'Завершите легкую игру за менее чем 3 минуты',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 1,
    achievementType: AchievementType.SINGLE,
    difficultySpecific: 'easy',
    icon: '⚡',
    rarity: AchievementRarity.RARE,
    points: 30,
    hidden: false
  },
  {
    id: AchievementId.EFFICIENCY,
    category: AchievementCategory.TIME_BASED,
    title: 'Эффективность',
    description: 'Завершите среднюю игру за менее чем 15 минут',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 1,
    achievementType: AchievementType.SINGLE,
    difficultySpecific: 'medium',
    icon: '🚀',
    rarity: AchievementRarity.RARE,
    points: 40,
    hidden: false
  },
  {
    id: AchievementId.LIGHTNING,
    category: AchievementCategory.TIME_BASED,
    title: 'Молниеносный',
    description: 'Завершите сложную игру за менее чем 30 минут',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 1,
    achievementType: AchievementType.SINGLE,
    difficultySpecific: 'hard',
    icon: '⚡',
    rarity: AchievementRarity.EPIC,
    points: 75,
    hidden: false
  },

  // Особые достижения
  {
    id: AchievementId.PERFECTIONIST,
    category: AchievementCategory.SPECIAL,
    title: 'Перфекционист',
    description: 'Завершите игру без ошибок',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 1,
    achievementType: AchievementType.SINGLE,
    icon: '✨',
    rarity: AchievementRarity.RARE,
    points: 50,
    hidden: false
  },
  {
    id: AchievementId.NO_HINTS,
    category: AchievementCategory.SPECIAL,
    title: 'Без подсказок',
    description: 'Завершите игру без использования подсказок',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 1,
    achievementType: AchievementType.SINGLE,
    icon: '🧠',
    rarity: AchievementRarity.RARE,
    points: 40,
    hidden: false
  },
  {
    id: AchievementId.MARATHON,
    category: AchievementCategory.SPECIAL,
    title: 'Марафон',
    description: 'Играйте 60+ минут подряд',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 3600, // 60 минут в секундах
    achievementType: AchievementType.PROGRESS,
    icon: '🏃',
    rarity: AchievementRarity.EPIC,
    points: 60,
    hidden: false
  },
  {
    id: AchievementId.DAILY_PLAYER,
    category: AchievementCategory.SPECIAL,
    title: 'Ежедневный игрок',
    description: 'Играйте 7 дней подряд',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 7,
    achievementType: AchievementType.PROGRESS,
    icon: '📅',
    rarity: AchievementRarity.EPIC,
    points: 70,
    hidden: false
  },

  // Достижения по сложности
  {
    id: AchievementId.BEGINNER_EXPERT,
    category: AchievementCategory.SKILL,
    title: 'Эксперт начального уровня',
    description: 'Завершите 10 игр на начальном уровне',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 10,
    achievementType: AchievementType.PROGRESS,
    difficultySpecific: 'beginner',
    icon: '🎓',
    rarity: AchievementRarity.COMMON,
    points: 20,
    hidden: false
  },
  {
    id: AchievementId.EASY_MASTER,
    category: AchievementCategory.SKILL,
    title: 'Мастер легкого уровня',
    description: 'Завершите 10 игр на легком уровне',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 10,
    achievementType: AchievementType.PROGRESS,
    difficultySpecific: 'easy',
    icon: '🥉',
    rarity: AchievementRarity.COMMON,
    points: 25,
    hidden: false
  },
  {
    id: AchievementId.MEDIUM_MASTER,
    category: AchievementCategory.SKILL,
    title: 'Мастер среднего уровня',
    description: 'Завершите 10 игр на среднем уровне',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 10,
    achievementType: AchievementType.PROGRESS,
    difficultySpecific: 'medium',
    icon: '🥈',
    rarity: AchievementRarity.RARE,
    points: 35,
    hidden: false
  },
  {
    id: AchievementId.HARD_MASTER,
    category: AchievementCategory.SKILL,
    title: 'Мастер сложного уровня',
    description: 'Завершите 10 игр на сложном уровне',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 10,
    achievementType: AchievementType.PROGRESS,
    difficultySpecific: 'hard',
    icon: '🥇',
    rarity: AchievementRarity.EPIC,
    points: 50,
    hidden: false
  },
  {
    id: AchievementId.EXPERT_MASTER,
    category: AchievementCategory.SKILL,
    title: 'Мастер экспертного уровня',
    description: 'Завершите 10 игр на экспертном уровне',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 10,
    achievementType: AchievementType.PROGRESS,
    difficultySpecific: 'expert',
    icon: '🏆',
    rarity: AchievementRarity.LEGENDARY,
    points: 100,
    hidden: false
  },

  // Достижения за серии
  {
    id: AchievementId.STREAK_3,
    category: AchievementCategory.PERSISTENCE,
    title: 'Серия из 3',
    description: 'Выиграйте 3 игры подряд',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 3,
    achievementType: AchievementType.PROGRESS,
    icon: '🔥',
    rarity: AchievementRarity.COMMON,
    points: 15,
    hidden: false
  },
  {
    id: AchievementId.STREAK_5,
    category: AchievementCategory.PERSISTENCE,
    title: 'Серия из 5',
    description: 'Выиграйте 5 игр подряд',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 5,
    achievementType: AchievementType.PROGRESS,
    icon: '🔥🔥',
    rarity: AchievementRarity.RARE,
    points: 30,
    hidden: false
  },
  {
    id: AchievementId.STREAK_10,
    category: AchievementCategory.PERSISTENCE,
    title: 'Серия из 10',
    description: 'Выиграйте 10 игр подряд',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 10,
    achievementType: AchievementType.PROGRESS,
    icon: '🔥🔥🔥',
    rarity: AchievementRarity.EPIC,
    points: 75,
    hidden: false
  },
  {
    id: AchievementId.STREAK_30,
    category: AchievementCategory.PERSISTENCE,
    title: 'Серия из 30',
    description: 'Выиграйте 30 игр подряд',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 30,
    achievementType: AchievementType.MILESTONE,
    icon: '🔥🔥🔥🔥',
    rarity: AchievementRarity.LEGENDARY,
    points: 200,
    hidden: true
  },

  // Достижения за исследование
  {
    id: AchievementId.EXPLORER,
    category: AchievementCategory.EXPLORATION,
    title: 'Исследователь',
    description: 'Попробуйте все уровни сложности',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 5, // 5 уровней сложности
    achievementType: AchievementType.PROGRESS,
    icon: '🗺️',
    rarity: AchievementRarity.COMMON,
    points: 20,
    hidden: false
  },
  {
    id: AchievementId.VERSATILE,
    category: AchievementCategory.EXPLORATION,
    title: 'Универсал',
    description: 'Завершите игры на всех уровнях сложности',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 5,
    achievementType: AchievementType.PROGRESS,
    icon: '🎭',
    rarity: AchievementRarity.RARE,
    points: 40,
    hidden: false
  },

  // Достижения за эффективность
  {
    id: AchievementId.HINT_FREE_STREAK,
    category: AchievementCategory.SKILL,
    title: 'Серия без подсказок',
    description: 'Завершите 5 игр подряд без подсказок',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 5,
    achievementType: AchievementType.PROGRESS,
    icon: '🧩',
    rarity: AchievementRarity.EPIC,
    points: 80,
    hidden: false
  },
  {
    id: AchievementId.ERROR_FREE_STREAK,
    category: AchievementCategory.SKILL,
    title: 'Серия без ошибок',
    description: 'Завершите 5 игр подряд без ошибок',
    isUnlocked: false,
    progressCurrent: 0,
    progressTarget: 5,
    achievementType: AchievementType.PROGRESS,
    icon: '💯',
    rarity: AchievementRarity.EPIC,
    points: 90,
    hidden: false
  }
];

export class SQLiteAchievementRepository implements IAchievementRepository {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }

  /**
   * Initialize achievements - create default achievements if they don't exist
   */
  async initialize(): Promise<void> {
    try {
      // Check if achievements table is empty
      const [result] = await this.dbManager.executeQuery(
        'SELECT COUNT(*) as count FROM achievements'
      );

      const count = result.rows.item(0).count;

      if (count === 0) {
        // Insert default achievements
        for (const achievement of DEFAULT_ACHIEVEMENTS) {
          await this.insertAchievement(achievement);
        }
        console.log(`Initialized ${DEFAULT_ACHIEVEMENTS.length} achievements`);
      }
    } catch (error) {
      console.error('Error initializing achievements:', error);
      throw error;
    }
  }

  /**
   * Insert achievement into database
   */
  private async insertAchievement(achievement: Achievement): Promise<void> {
    await this.dbManager.executeQuery(
      `INSERT INTO achievements (
        id, category, title, description,
        is_unlocked, progress_current, progress_target,
        achievement_type, difficulty_specific,
        reward_type, reward_value,
        icon, rarity, points, hidden
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        achievement.id,
        achievement.category,
        achievement.title,
        achievement.description,
        achievement.isUnlocked ? 1 : 0,
        achievement.progressCurrent,
        achievement.progressTarget,
        achievement.achievementType,
        achievement.difficultySpecific || null,
        achievement.rewardType || null,
        achievement.rewardValue || null,
        achievement.icon,
        achievement.rarity,
        achievement.points,
        achievement.hidden ? 1 : 0
      ]
    );
  }

  /**
   * Convert database row to Achievement object
   */
  private rowToAchievement(row: any): Achievement {
    return {
      id: row.id as AchievementId,
      category: row.category as AchievementCategory,
      title: row.title,
      description: row.description,
      isUnlocked: row.is_unlocked === 1,
      progressCurrent: row.progress_current,
      progressTarget: row.progress_target,
      achievementType: row.achievement_type as AchievementType,
      difficultySpecific: row.difficulty_specific as DifficultyLevel | undefined,
      rewardType: row.reward_type as RewardType | undefined,
      rewardValue: row.reward_value,
      unlockedAt: row.unlocked_at ? new Date(row.unlocked_at * 1000) : undefined,
      firstProgressAt: row.first_progress_at ? new Date(row.first_progress_at * 1000) : undefined,
      lastProgressAt: row.last_progress_at ? new Date(row.last_progress_at * 1000) : undefined,
      icon: row.icon,
      rarity: row.rarity as AchievementRarity,
      points: row.points,
      hidden: row.hidden === 1
    };
  }

  /**
   * Find achievement by ID
   */
  async findById(id: AchievementId): Promise<Achievement | null> {
    try {
      const [result] = await this.dbManager.executeQuery(
        'SELECT * FROM achievements WHERE id = ?',
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.rowToAchievement(result.rows.item(0));
    } catch (error) {
      console.error('Error finding achievement by ID:', error);
      throw error;
    }
  }

  /**
   * Find all achievements
   */
  async findAll(): Promise<Achievement[]> {
    try {
      const [result] = await this.dbManager.executeQuery(
        'SELECT * FROM achievements ORDER BY rarity DESC, points DESC'
      );

      const achievements: Achievement[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        achievements.push(this.rowToAchievement(result.rows.item(i)));
      }

      return achievements;
    } catch (error) {
      console.error('Error finding all achievements:', error);
      throw error;
    }
  }

  /**
   * Find achievements by filter
   */
  async findByFilter(filter: AchievementFilter): Promise<Achievement[]> {
    try {
      let query = 'SELECT * FROM achievements WHERE 1=1';
      const params: any[] = [];

      if (filter.category !== undefined) {
        query += ' AND category = ?';
        params.push(filter.category);
      }

      if (filter.isUnlocked !== undefined) {
        query += ' AND is_unlocked = ?';
        params.push(filter.isUnlocked ? 1 : 0);
      }

      if (filter.difficultySpecific !== undefined) {
        query += ' AND difficulty_specific = ?';
        params.push(filter.difficultySpecific);
      }

      if (filter.rarity !== undefined) {
        query += ' AND rarity = ?';
        params.push(filter.rarity);
      }

      if (filter.hidden !== undefined) {
        query += ' AND hidden = ?';
        params.push(filter.hidden ? 1 : 0);
      }

      query += ' ORDER BY rarity DESC, points DESC';

      const [result] = await this.dbManager.executeQuery(query, params);

      const achievements: Achievement[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        achievements.push(this.rowToAchievement(result.rows.item(i)));
      }

      return achievements;
    } catch (error) {
      console.error('Error finding achievements by filter:', error);
      throw error;
    }
  }

  /**
   * Find unlocked achievements
   */
  async findUnlocked(): Promise<Achievement[]> {
    return this.findByFilter({ isUnlocked: true });
  }

  /**
   * Find locked achievements
   */
  async findLocked(): Promise<Achievement[]> {
    return this.findByFilter({ isUnlocked: false });
  }

  /**
   * Update achievement progress
   */
  async updateProgress(
    id: AchievementId,
    progress: number
  ): Promise<AchievementProgress> {
    try {
      // Get current progress
      const achievement = await this.findById(id);
      if (!achievement) {
        throw new Error(`Achievement not found: ${id}`);
      }

      const previousProgress = achievement.progressCurrent;
      const now = Math.floor(Date.now() / 1000);

      // Update progress
      await this.dbManager.executeQuery(
        `UPDATE achievements
         SET progress_current = ?,
             last_progress_at = ?,
             first_progress_at = COALESCE(first_progress_at, ?)
         WHERE id = ?`,
        [progress, now, now, id]
      );

      // Check if should be unlocked
      const isNewlyUnlocked = progress >= achievement.progressTarget && !achievement.isUnlocked;
      if (isNewlyUnlocked) {
        await this.unlock(id);
      }

      return {
        achievementId: id,
        previousProgress,
        currentProgress: progress,
        isNewlyUnlocked,
        unlockedAt: isNewlyUnlocked ? new Date() : undefined
      };
    } catch (error) {
      console.error('Error updating achievement progress:', error);
      throw error;
    }
  }

  /**
   * Unlock achievement
   */
  async unlock(id: AchievementId): Promise<AchievementUnlockResult> {
    try {
      const achievement = await this.findById(id);
      if (!achievement) {
        return {
          success: false,
          error: `Achievement not found: ${id}`
        };
      }

      if (achievement.isUnlocked) {
        return {
          success: false,
          error: 'Achievement already unlocked'
        };
      }

      const now = Math.floor(Date.now() / 1000);

      await this.dbManager.executeQuery(
        `UPDATE achievements
         SET is_unlocked = 1,
             unlocked_at = ?,
             progress_current = progress_target
         WHERE id = ?`,
        [now, id]
      );

      const unlockedAchievement = await this.findById(id);

      return {
        success: true,
        achievement: unlockedAchievement || undefined
      };
    } catch (error) {
      console.error('Error unlocking achievement:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Check if achievement is unlocked
   */
  async isUnlocked(id: AchievementId): Promise<boolean> {
    try {
      const [result] = await this.dbManager.executeQuery(
        'SELECT is_unlocked FROM achievements WHERE id = ?',
        [id]
      );

      if (result.rows.length === 0) {
        return false;
      }

      return result.rows.item(0).is_unlocked === 1;
    } catch (error) {
      console.error('Error checking if achievement is unlocked:', error);
      return false;
    }
  }

  /**
   * Get achievement statistics
   */
  async getStatistics(): Promise<AchievementStatistics> {
    try {
      // Get total and unlocked counts
      const [totalResult] = await this.dbManager.executeQuery(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN is_unlocked = 1 THEN 1 ELSE 0 END) as unlocked,
          SUM(points) as total_points,
          SUM(CASE WHEN is_unlocked = 1 THEN points ELSE 0 END) as earned_points
         FROM achievements`
      );

      const totalRow = totalResult.rows.item(0);
      const totalAchievements = totalRow.total;
      const unlockedAchievements = totalRow.unlocked;
      const totalPoints = totalRow.total_points;
      const earnedPoints = totalRow.earned_points;

      // Get stats by category
      const [categoryResult] = await this.dbManager.executeQuery(
        `SELECT
          category,
          COUNT(*) as total,
          SUM(CASE WHEN is_unlocked = 1 THEN 1 ELSE 0 END) as unlocked
         FROM achievements
         GROUP BY category`
      );

      const byCategory: AchievementStatistics['byCategory'] = {};
      for (let i = 0; i < categoryResult.rows.length; i++) {
        const row = categoryResult.rows.item(i);
        byCategory[row.category as AchievementCategory] = {
          total: row.total,
          unlocked: row.unlocked
        };
      }

      // Get stats by rarity
      const [rarityResult] = await this.dbManager.executeQuery(
        `SELECT
          rarity,
          COUNT(*) as total,
          SUM(CASE WHEN is_unlocked = 1 THEN 1 ELSE 0 END) as unlocked
         FROM achievements
         GROUP BY rarity`
      );

      const byRarity: AchievementStatistics['byRarity'] = {};
      for (let i = 0; i < rarityResult.rows.length; i++) {
        const row = rarityResult.rows.item(i);
        byRarity[row.rarity as AchievementRarity] = {
          total: row.total,
          unlocked: row.unlocked
        };
      }

      return {
        totalAchievements,
        unlockedAchievements,
        progressPercentage: totalAchievements > 0
          ? (unlockedAchievements / totalAchievements) * 100
          : 0,
        totalPoints,
        earnedPoints,
        byCategory,
        byRarity
      };
    } catch (error) {
      console.error('Error getting achievement statistics:', error);
      throw error;
    }
  }

  /**
   * Get progress for specific achievement
   */
  async getProgress(id: AchievementId): Promise<number> {
    try {
      const [result] = await this.dbManager.executeQuery(
        'SELECT progress_current FROM achievements WHERE id = ?',
        [id]
      );

      if (result.rows.length === 0) {
        return 0;
      }

      return result.rows.item(0).progress_current;
    } catch (error) {
      console.error('Error getting achievement progress:', error);
      return 0;
    }
  }

  /**
   * Reset all achievements (for testing/debugging)
   */
  async resetAll(): Promise<void> {
    try {
      await this.dbManager.executeQuery(
        `UPDATE achievements
         SET is_unlocked = 0,
             progress_current = 0,
             unlocked_at = NULL,
             first_progress_at = NULL,
             last_progress_at = NULL`
      );

      console.log('All achievements reset');
    } catch (error) {
      console.error('Error resetting achievements:', error);
      throw error;
    }
  }

  /**
   * Get achievements by category
   */
  async findByCategory(category: string): Promise<Achievement[]> {
    return this.findByFilter({ category: category as AchievementCategory });
  }

  /**
   * Get total points earned
   */
  async getTotalPointsEarned(): Promise<number> {
    try {
      const [result] = await this.dbManager.executeQuery(
        'SELECT SUM(points) as total FROM achievements WHERE is_unlocked = 1'
      );

      return result.rows.item(0).total || 0;
    } catch (error) {
      console.error('Error getting total points earned:', error);
      return 0;
    }
  }

  /**
   * Get recently unlocked achievements
   */
  async getRecentlyUnlocked(limit: number = 10): Promise<Achievement[]> {
    try {
      const [result] = await this.dbManager.executeQuery(
        `SELECT * FROM achievements
         WHERE is_unlocked = 1 AND unlocked_at IS NOT NULL
         ORDER BY unlocked_at DESC
         LIMIT ?`,
        [limit]
      );

      const achievements: Achievement[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        achievements.push(this.rowToAchievement(result.rows.item(i)));
      }

      return achievements;
    } catch (error) {
      console.error('Error getting recently unlocked achievements:', error);
      return [];
    }
  }
}