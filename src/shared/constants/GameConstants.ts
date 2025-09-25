/**
 * Game configuration constants according to business analysis requirements
 * Based on 1.4-functional-requirements.md
 */

export const GENERATION_CONFIG = {
  /** Maximum attempts to generate a valid puzzle before fallback */
  MAX_ATTEMPTS: 100,

  /** Maximum generation time in milliseconds (2 seconds per business requirements) */
  TIMEOUT_MS: 2000,

  /** Maximum attempts to remove cells while maintaining unique solution */
  MAX_CELL_REMOVAL_ATTEMPTS: 200,

  /** Default seed range for random puzzle generation */
  DEFAULT_SEED_RANGE: 1000000,
} as const;

export const QUALITY_VALIDATION = {
  /** Minimum symmetry percentage for puzzle quality (10% - more reasonable) */
  MIN_SYMMETRY: 0.1,

  /** Threshold for detecting naked pairs technique requirement */
  NAKED_PAIRS_THRESHOLD: 4,

  /** Threshold for detecting hidden pairs potential */
  CONSTRAINED_CELLS_THRESHOLD: 15,

  /** Maximum difference between min and max digit distribution */
  MAX_DISTRIBUTION_DIFFERENCE: 5,
} as const;

export const SUDOKU_RULES = {
  /** Standard Sudoku grid size */
  GRID_SIZE: 9,

  /** Standard Sudoku box size (3x3) */
  BOX_SIZE: 3,

  /** Empty cell value */
  EMPTY_CELL: 0,

  /** Total cells in a Sudoku grid */
  TOTAL_CELLS: 81,
} as const;

/**
 * Difficulty settings according to business analysis requirements
 * Source: 1.2-game-rules-gameplay.md section 1.2.2
 * Note: These constants are for reference only.
 * Actual implementation uses SudokuRules.getDifficultySettings() to avoid duplication.
 */
export const DIFFICULTY_REFERENCE = {
  beginner: {
    clueRange: '36-40 clues (44-49% filled)',
    timeRange: '10-20 minutes',
    techniques: 'Naked singles, Hidden singles'
  },
  easy: {
    clueRange: '32-35 clues (39-43% filled)',
    timeRange: '15-30 minutes',
    techniques: 'Naked singles, Hidden singles, Pointing pairs'
  },
  medium: {
    clueRange: '28-31 clues (34-38% filled)',
    timeRange: '25-45 minutes',
    techniques: 'Box/line reduction, Naked pairs, Hidden pairs'
  },
  hard: {
    clueRange: '24-27 clues (29-33% filled)',
    timeRange: '40-80 minutes',
    techniques: 'X-Wing, Swordfish, Coloring'
  },
  expert: {
    clueRange: '20-23 clues (24-28% filled)',
    timeRange: '60-120+ minutes',
    techniques: 'All known techniques, Unique patterns'
  }
} as const;

export const ERROR_MESSAGES = {
  GENERATION_TIMEOUT: 'Puzzle generation exceeded 2-second performance limit',
  GENERATION_FAILED: 'Failed to generate puzzle after maximum attempts',
  INVALID_DIFFICULTY: 'Invalid difficulty level provided',
  INVALID_SEED: 'Seed must be a non-negative integer',
  UNSOLVABLE_PUZZLE: 'Provided puzzle has no solution',
  MULTIPLE_SOLUTIONS: 'Provided puzzle has multiple solutions',
} as const;