import { SudokuGrid, CellPosition } from '../types/GameTypes';

export interface SolverResult {
  solution: SudokuGrid | null;
  solvable: boolean;
  uniqueSolution: boolean;
  solutionsCount: number;
  timedOut: boolean;
  performanceMetrics: SolverPerformanceMetrics;
}

export interface SolverPerformanceMetrics {
  solvingTimeMs: number;
  constraintPropagationSteps: number;
  backtrackingSteps: number;
  nodesExplored: number;
  maxDepthReached: number;
}

export interface HintResult {
  hasHint: boolean;
  position?: CellPosition;
  value?: number;
  technique: string;
  explanation: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  confidence: number; // 0-1 scale, consistent with NextMoveResult
}

export interface TechniqueAnalysis {
  technique: string;
  applicable: boolean;
  positions: CellPosition[];
  explanation: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

export interface NextMoveResult {
  position: CellPosition;
  value: number;
  technique: string;
  confidence: number; // 0-1 scale
  explanation: string;
}

export interface ISudokuSolver {
  /**
   * Solves a Sudoku puzzle using constraint propagation with backtracking fallback
   * @param grid - The Sudoku grid to solve
   * @param timeoutMs - Optional timeout in milliseconds (default: 30000ms)
   * @returns Solution result with performance metrics
   */
  solve(grid: SudokuGrid, timeoutMs?: number): SolverResult;

  /**
   * Checks if a puzzle has a unique solution
   * @param grid - The Sudoku grid to analyze
   * @returns True if puzzle has exactly one solution
   */
  hasUniqueSolution(grid: SudokuGrid): boolean;

  /**
   * Finds all possible solutions for a puzzle (up to a limit)
   * @param grid - The Sudoku grid to analyze
   * @param maxSolutions - Maximum number of solutions to find
   * @returns Array of found solutions
   */
  findAllSolutions(grid: SudokuGrid, maxSolutions?: number): SudokuGrid[];

  /**
   * Validates if a grid configuration is solvable
   * @param grid - The Sudoku grid to validate
   * @returns True if the grid can be solved
   */
  isSolvable(grid: SudokuGrid): boolean;

  /**
   * Provides intelligent hint for the current grid state
   * @param grid - The current Sudoku grid
   * @returns Hint result with suggested move and explanation
   */
  getHint(grid: SudokuGrid): HintResult;

  /**
   * Analyzes available solving techniques for current grid state
   * @param grid - The Sudoku grid to analyze
   * @returns Array of applicable techniques with explanations
   */
  analyzeTechniques(grid: SudokuGrid): TechniqueAnalysis[];

  /**
   * Gets next logical move based on solving techniques
   * @param grid - The current Sudoku grid
   * @param excludeTechniques - Techniques to exclude from analysis
   * @returns Next move suggestion or null if no logical move found
   */
  getNextMove(grid: SudokuGrid, excludeTechniques?: string[]): NextMoveResult | null;
}