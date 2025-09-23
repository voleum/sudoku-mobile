import { HintRequest, HintResponse, PlayerProfile, SudokuGrid, HintLevel, DifficultyLevel } from '../types/GameTypes';

export interface IHintSystem {
  /**
   * Provides intelligent hint based on current grid state and requested level
   * Implements 4-level hint system according to business analysis
   * @param request - Hint request with grid state and preferences
   * @returns Structured hint response with visual aids
   */
  getHint(request: HintRequest): Promise<HintResponse>;

  /**
   * Analyzes current grid to determine available techniques
   * @param grid - Current Sudoku grid state
   * @returns Array of applicable techniques with difficulty ratings
   */
  getAvailableTechniques(grid: SudokuGrid): Promise<string[]>;

  /**
   * Updates player profile based on hint usage patterns
   * @param profile - Current player profile
   * @param hintUsage - Recent hint usage data
   * @returns Updated player profile
   */
  updatePlayerProfile(profile: PlayerProfile, hintUsage: any[]): PlayerProfile;

  /**
   * Validates if hint request is within game limits using hybrid system
   * Combines Business Analysis educational progression with Technical Specification limits
   *
   * Business Analysis: Progressive difficulty with level-specific restrictions
   * Technical Specification: Higher overall limits (Easy: 10, Medium: 7, Hard: 5, Expert: 3)
   *
   * @param level - Requested hint level
   * @param currentUsage - Current hint usage for the game
   * @param difficulty - Game difficulty level for limit calculation
   * @returns True if request is allowed
   */
  isHintAllowed(level: HintLevel, currentUsage: any[], difficulty: DifficultyLevel): boolean;

  /**
   * Calculates complexity score for current position
   * @param grid - Current Sudoku grid state
   * @returns Complexity score for technique selection
   */
  calculateComplexity(grid: SudokuGrid): number;

  /**
   * Calculates rating penalty for hint usage according to Business Analysis
   * Level 1: -5%, Level 2: -10%, Level 3: -20%, Level 4: -50%
   * @param level - Hint level used
   * @returns Percentage penalty (0-50)
   */
  calculateRatingPenalty(level: HintLevel): number;
}