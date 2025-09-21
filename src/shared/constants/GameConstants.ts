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
 * Difficulty settings according to business requirements
 * Source: 1.4-functional-requirements.md sections 1.4.1
 */
export const DIFFICULTY_SETTINGS = {
  easy: {
    targetClues: 52,
    minClues: 50,
    maxClues: 55,
    estimatedTime: 10, // 5-15 minutes average
    techniques: ['Basic Sudoku rules only']
  },
  medium: {
    targetClues: 42,
    minClues: 40,
    maxClues: 45,
    estimatedTime: 22, // 15-30 minutes average
    techniques: ['Hidden singles', 'Naked pairs']
  },
  hard: {
    targetClues: 32,
    minClues: 30,
    maxClues: 35,
    estimatedTime: 45, // 30-60 minutes average
    techniques: ['Hidden pairs', 'Naked triples', 'X-Wing']
  },
  expert: {
    targetClues: 27,
    minClues: 25,
    maxClues: 30,
    estimatedTime: 75, // 60+ minutes average
    techniques: ['Swordfish', 'XY-Wing', 'Advanced chains']
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