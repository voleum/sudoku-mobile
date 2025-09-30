/**
 * Achievement System Types
 * Based on business requirements from 1.4-functional-requirements.md (section 1.4.4)
 * and database schema from 2.2.4-database-schema.md (achievements table)
 */

import { DifficultyLevel } from './GameTypes';

/**
 * Achievement categories based on business analysis (1.4-functional-requirements.md)
 */
export enum AchievementCategory {
  PROGRESSIVE = 'progressive',    // Прогрессивные достижения (Новичок, Любитель, Энтузиаст, Мастер, Гроссмейстер)
  TIME_BASED = 'time_based',      // Достижения по времени (Скоростной демон, Эффективность, Молниеносный)
  SPECIAL = 'special'             // Особые достижения (Перфекционист, Без подсказок, Марафон, Ежедневно)
}

/**
 * Achievement type - how it's tracked
 * Based on database schema: 'single' | 'progress' | 'milestone'
 */
export enum AchievementType {
  SINGLE = 'single',        // Одноразовое достижение
  PROGRESS = 'progress',    // С прогрессом (напр., 0/100 игр)
  MILESTONE = 'milestone'   // Веха (этапное)
}

/**
 * Achievement rarity
 * Based on database schema: 'common' | 'rare' | 'epic' | 'legendary'
 */
export enum AchievementRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

/**
 * Reward types for achievements
 */
export enum RewardType {
  POINTS = 'points',
  BADGE = 'badge',
  THEME = 'theme',
  ICON = 'icon',
  TITLE = 'title'
}

/**
 * Achievement IDs based strictly on business analysis requirements (1.4-functional-requirements.md section 1.4.4)
 * ONLY 14 achievements as specified in business requirements
 */
export enum AchievementId {
  // Прогрессивные достижения (5)
  NEWBIE = 'newbie',                    // Новичок - завершить первую игру
  AMATEUR = 'amateur',                  // Любитель - завершить 10 игр
  ENTHUSIAST = 'enthusiast',            // Энтузиаст - завершить 50 игр
  MASTER = 'master',                    // Мастер - завершить 100 игр
  GRANDMASTER = 'grandmaster',          // Гроссмейстер - завершить 500 игр

  // Достижения по времени (3)
  SPEED_DEMON = 'speed_demon',          // Скоростной демон - легкую за <3 минуты
  EFFICIENCY = 'efficiency',            // Эффективность - среднюю за <15 минут
  LIGHTNING = 'lightning',              // Молниеносный - сложную за <30 минут

  // Особые достижения (4)
  PERFECTIONIST = 'perfectionist',      // Перфекционист - игра без ошибок
  NO_HINTS = 'no_hints',                // Без подсказок - игра без подсказок
  MARATHON = 'marathon',                // Марафон - играть 60+ минут подряд
  DAILY_PLAYER = 'daily_player'         // Ежедневно - играть 7 дней подряд
}

/**
 * Achievement entity based on database schema
 */
export interface Achievement {
  // Основные поля
  id: AchievementId;
  category: AchievementCategory;
  title: string;
  description: string;

  // Прогресс
  isUnlocked: boolean;
  progressCurrent: number;
  progressTarget: number;

  // Типы
  achievementType: AchievementType;
  difficultySpecific?: DifficultyLevel;

  // Награды
  rewardType?: RewardType;
  rewardValue?: string;

  // Временные метки
  unlockedAt?: Date;
  firstProgressAt?: Date;
  lastProgressAt?: Date;

  // Метаданные
  icon: string;
  rarity: AchievementRarity;
  points: number;
  hidden: boolean;
}

/**
 * Achievement progress update data
 */
export interface AchievementProgress {
  achievementId: AchievementId;
  previousProgress: number;
  currentProgress: number;
  isNewlyUnlocked: boolean;
  unlockedAt?: Date;
}

/**
 * Achievement unlock result
 */
export interface AchievementUnlockResult {
  success: boolean;
  achievement?: Achievement;
  error?: string;
}

/**
 * Achievement query filters
 */
export interface AchievementFilter {
  category?: AchievementCategory;
  isUnlocked?: boolean;
  difficultySpecific?: DifficultyLevel;
  rarity?: AchievementRarity;
  hidden?: boolean;
}

/**
 * Achievement statistics
 */
export interface AchievementStatistics {
  totalAchievements: number;
  unlockedAchievements: number;
  progressPercentage: number;
  totalPoints: number;
  earnedPoints: number;
  byCategory: {
    [key in AchievementCategory]?: {
      total: number;
      unlocked: number;
    };
  };
  byRarity: {
    [key in AchievementRarity]?: {
      total: number;
      unlocked: number;
    };
  };
}

/**
 * Achievement notification data
 */
export interface AchievementNotification {
  achievement: Achievement;
  message: string;
  timestamp: Date;
  displayed: boolean;
}

/**
 * Achievement evaluation context
 * Used to determine which achievements to check
 */
export interface AchievementEvaluationContext {
  // Game completion data
  gameCompleted?: boolean;
  difficulty?: DifficultyLevel;
  playTime?: number;
  hintsUsed?: number;
  errorsCount?: number;

  // Player statistics
  totalGamesCompleted?: number;
  currentStreak?: number;
  consecutiveDaysPlayed?: number;

  // Session data
  sessionDuration?: number;
}

/**
 * Result of achievement evaluation
 */
export interface AchievementEvaluationResult {
  newlyUnlocked: Achievement[];
  progressUpdated: AchievementProgress[];
  notifications: AchievementNotification[];
}