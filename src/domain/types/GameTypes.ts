export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type SudokuGrid = CellValue[][];
export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export interface CellPosition {
  row: number;    // 0-8
  col: number;    // 0-8
  box: number;    // 0-8 (номер 3x3 квадрата)
}

export interface SudokuPuzzle {
  id: string;
  seed: number;
  difficulty: DifficultyLevel;
  grid: SudokuGrid;
  solution: SudokuGrid;
  hints: number;
  estimatedTime: number;
  techniques: string[];
  createdAt: Date;
}

export interface GameEntity {
  id: string;
  puzzleId: string;
  grid: SudokuGrid;
  originalGrid: SudokuGrid;
  solution: SudokuGrid;
  difficulty: DifficultyLevel;
  startTime: Date;
  currentTime: number;
  hintsUsed: number;
  errorsCount: number;
  isCompleted: boolean;
  hintUsageHistory: GameHintUsage[];
  directSolutionHintsUsed: number; // Maximum 3 per game according to business analysis
  playerProfile?: PlayerProfile;
}

export interface GameMove {
  position: CellPosition;
  value: CellValue;
  previousValue: CellValue;
  timestamp: Date;
}

// Comprehensive game statistics based on database schema (2.1.4-database-selection.md)
export interface GameStatistics {
  // Overall game statistics
  totalGames: number;
  gamesCompleted: number;
  gamesAbandoned: number;
  winRate: number;

  // Time-based statistics
  totalPlayTime: number;    // в секундах
  averageTime: number;      // среднее время завершения
  bestTime: number;         // лучшее время
  worstTime: number;        // худшее время

  // Move-based statistics
  totalMoves: number;
  averageMoves: number;
  bestMoves: number;

  // Hints and errors statistics
  totalHints: number;
  averageHints: number;
  totalErrors: number;
  averageErrors: number;

  // Streak statistics
  currentStreak: number;        // текущая серия побед
  longestStreak: number;        // самая длинная серия
  currentDailyStreak: number;   // ежедневная серия
  longestDailyStreak: number;

  // Timestamps
  lastPlayed?: Date;
  lastCompleted?: Date;
  updatedAt: Date;
}

// Statistics per difficulty level (based on database table)
export interface DifficultyStatistics {
  difficulty: DifficultyLevel;

  // Basic game counts
  gamesPlayed: number;
  gamesCompleted: number;
  gamesAbandoned: number;

  // Time statistics
  totalPlayTime: number;    // в секундах
  averageTime: number;      // среднее время завершения
  bestTime: number;         // лучшее время
  worstTime: number;        // худшее время

  // Move statistics
  totalMoves: number;
  averageMoves: number;
  bestMoves: number;

  // Hints and errors
  totalHints: number;
  averageHints: number;
  totalErrors: number;
  averageErrors: number;

  // Streaks
  currentStreak: number;
  longestStreak: number;
  currentDailyStreak: number;
  longestDailyStreak: number;

  // Calculated fields
  winRate: number;          // процент побед

  // Timestamps
  lastPlayed?: Date;
  lastCompleted?: Date;
  updatedAt: Date;
}

// Achievement system types
export type AchievementCategory = 'skill' | 'persistence' | 'exploration' | 'mastery';

export type AchievementType =
  | 'first_win'          // Первая победа
  | 'streak_3'           // Серия из 3 побед
  | 'streak_5'           // Серия из 5 побед
  | 'streak_10'          // Серия из 10 побед
  | 'speed_demon'        // Решение за < 5 минут
  | 'perfectionist'      // Решение без ошибок
  | 'no_hints'           // Решение без подсказок
  | 'beginner_master'    // 10 побед на уровне новичок
  | 'easy_master'        // 10 побед на легком уровне
  | 'medium_master'      // 10 побед на среднем уровне
  | 'hard_master'        // 10 побед на сложном уровне
  | 'expert_master'      // 10 побед на экспертном уровне
  | 'zen_player'         // 50 игр в дзен-режиме
  | 'marathon'           // 100 завершенных игр
  | 'dedication'         // 7 дней подряд игры
  | 'efficiency'         // Средняя точность > 90%
  | 'explorer';          // Пробовал все уровни сложности

export interface Achievement {
  id: AchievementType;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress: number;       // 0-100 процентов до разблокировки
  unlockedAt?: Date;
  category: AchievementCategory;
}

// Progress chart data points
export interface StatisticsDataPoint {
  date: Date;
  value: number;
  label?: string;
}

export interface GameSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'ru';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showTimer: boolean;
  showErrors: boolean;
  highlightSameNumbers: boolean;
  highlightRowColumn: boolean;
}

export enum ErrorType {
  ROW_DUPLICATE = 'row_duplicate',
  COLUMN_DUPLICATE = 'column_duplicate',
  BOX_DUPLICATE = 'box_duplicate',
  INVALID_NUMBER = 'invalid_number',
  MODIFY_CLUE = 'modify_clue'
}

export interface ValidationResult {
  isValid: boolean;
  conflicts: CellPosition[];
  errorType?: ErrorType;
  affectedCells: CellPosition[];
  errorMessage?: string;
}

export type ValidationMode = 'immediate' | 'onComplete' | 'manual';

export interface MoveValidationOptions {
  mode: ValidationMode;
  allowErrors: boolean;
  strictMode: boolean;
}

export enum HintLevel {
  GENERAL_DIRECTION = 1,
  SPECIFIC_TECHNIQUE = 2,
  EXACT_LOCATION = 3,
  DIRECT_SOLUTION = 4
}

export interface HintRequest {
  grid: SudokuGrid;
  difficulty: DifficultyLevel;
  requestedLevel: HintLevel;
  playerProfile?: PlayerProfile;
}

export interface PlayerProfile {
  preferredTechniques: string[];
  problemAreas: string[];
  learningSpeed: 'slow' | 'medium' | 'fast';
  patienceLevel: 'low' | 'medium' | 'high';
  visualPreference: boolean;
}

export interface HintResponse {
  level: HintLevel;
  message: string;
  technique?: string;
  explanation?: string;
  targetCells: CellPosition[];
  relatedCells: CellPosition[];
  suggestedValue?: CellValue;
  confidence: number;
  colorHighlights: HintColorHighlight[];
  visualAnimations?: HintAnimation[];
  ratingPenalty: number; // Percentage penalty for final rating (Business Analysis requirement)
}

export interface HintColorHighlight {
  cells: CellPosition[];
  color: 'blue' | 'yellow' | 'green' | 'red' | 'purple';
  purpose: 'target' | 'related' | 'positive' | 'exclude' | 'pattern';
}

export interface HintAnimation {
  type: 'arrow' | 'pulse' | 'fade' | 'highlight';
  fromCells?: CellPosition[];
  toCells?: CellPosition[];
  duration: number;
}

export interface GameHintUsage {
  level: HintLevel;
  technique: string;
  timestamp: Date;
  wasHelpful: boolean;
  ratingPenalty: number; // Percentage penalty applied (Business Analysis requirement)
}