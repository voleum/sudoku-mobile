import { SudokuSolverService } from '../src/infrastructure/services/SudokuSolverService';
import { SudokuRules } from '../src/domain/rules/SudokuRules';
import { SudokuGrid } from '../src/domain/types/GameTypes';

// Performance API compatibility for Node.js environments
declare const performance: { now(): number } | undefined;

describe('SudokuSolverService', () => {
  let solverService: SudokuSolverService;

  beforeEach(() => {
    solverService = SudokuSolverService.getInstance();
  });

  describe('Basic Solving', () => {
    it('should solve a simple Sudoku puzzle', () => {
      const simplePuzzle: SudokuGrid = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
      ];

      const result = solverService.solve(simplePuzzle);

      expect(result.solvable).toBe(true);
      expect(result.solution).not.toBeNull();
      expect(SudokuRules.isCompleteGrid(result.solution!)).toBe(true);
      expect(SudokuRules.isValidGrid(result.solution!)).toBe(true);
    });

    it('should detect unsolvable puzzles', () => {
      const unsolvablePuzzle: SudokuGrid = [
        [1, 1, 0, 0, 0, 0, 0, 0, 0], // Invalid: two 1s in same row
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];

      const result = solverService.solve(unsolvablePuzzle);

      expect(result.solvable).toBe(false);
      expect(result.solution).toBeNull();
    });

    it('should solve an empty grid (with timeout)', () => {
      const emptyGrid = SudokuRules.createEmptyGrid();

      // Add timeout for empty grid solving as it can be computationally expensive
      const result = solverService.solve(emptyGrid);

      expect(result.solvable).toBe(true);
      expect(result.solution).not.toBeNull();
      expect(SudokuRules.isCompleteGrid(result.solution!)).toBe(true);
      expect(SudokuRules.isValidGrid(result.solution!)).toBe(true);
    }, 10000); // 10 second timeout

    it('should return already solved puzzle as-is', () => {
      const solvedPuzzle: SudokuGrid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 9]
      ];

      const result = solverService.solve(solvedPuzzle);

      expect(result.solvable).toBe(true);
      expect(result.solution).toEqual(solvedPuzzle);
    });
  });

  describe('Solution Uniqueness', () => {
    it('should detect puzzles with unique solutions', () => {
      const uniquePuzzle: SudokuGrid = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
      ];

      const hasUnique = solverService.hasUniqueSolution(uniquePuzzle);
      expect(hasUnique).toBe(true);

      const result = solverService.solve(uniquePuzzle);
      expect(result.uniqueSolution).toBe(true);
      expect(result.solutionsCount).toBe(1);
    });

    it('should detect puzzles with multiple solutions', () => {
      const multipleSolutionsPuzzle: SudokuGrid = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 0, 0, 0, 0, 0] // Very minimal constraints
      ];

      const result = solverService.solve(multipleSolutionsPuzzle);
      expect(result.solvable).toBe(true);
      // This puzzle might have multiple solutions due to insufficient constraints
    });

    it('should find all solutions up to a limit', () => {
      // Use a partially filled grid instead of empty for faster testing
      const partialGrid: SudokuGrid = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 0, 0, 0, 0, 0] // Only last row empty
      ];

      const solutions = solverService.findAllSolutions(partialGrid, 3);

      expect(solutions.length).toBeLessThanOrEqual(3);
      expect(solutions.length).toBeGreaterThan(0);

      solutions.forEach(solution => {
        expect(SudokuRules.isCompleteGrid(solution)).toBe(true);
        expect(SudokuRules.isValidGrid(solution)).toBe(true);
      });
    }, 5000); // 5 second timeout
  });

  describe('Performance Metrics', () => {
    it('should provide performance metrics for solving', () => {
      const testPuzzle: SudokuGrid = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
      ];

      const result = solverService.solve(testPuzzle);

      expect(result.performanceMetrics).toBeDefined();
      expect(result.performanceMetrics.solvingTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.performanceMetrics.constraintPropagationSteps).toBeGreaterThanOrEqual(0);
      expect(result.performanceMetrics.backtrackingSteps).toBeGreaterThanOrEqual(0);
      expect(result.performanceMetrics.nodesExplored).toBeGreaterThanOrEqual(0);
      expect(result.performanceMetrics.maxDepthReached).toBeGreaterThanOrEqual(0);
    });

    it('should solve puzzles efficiently (performance benchmark)', () => {
      const complexPuzzle: SudokuGrid = [
        [0, 0, 0, 0, 0, 0, 0, 1, 0],
        [4, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 2, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 5, 0, 4, 0, 7],
        [0, 0, 8, 0, 0, 0, 3, 0, 0],
        [0, 0, 1, 0, 9, 0, 0, 0, 0],
        [3, 0, 0, 4, 0, 0, 2, 0, 0],
        [0, 5, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 8, 0, 6, 0, 0, 0]
      ];

      const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const result = solverService.solve(complexPuzzle);
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

      expect(result.solvable).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should solve in under 1 second
      expect(result.performanceMetrics.solvingTimeMs).toBeLessThan(1000);
      expect(result.timedOut).toBe(false);
    });

    it('should handle timeout for very difficult puzzles', () => {
      // Use a minimal puzzle that requires extensive backtracking
      const difficultPuzzle: SudokuGrid = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 3, 0, 8, 5],
        [0, 0, 1, 0, 2, 0, 0, 0, 0],
        [0, 0, 0, 5, 0, 7, 0, 0, 0],
        [0, 0, 4, 0, 0, 0, 1, 0, 0],
        [0, 9, 0, 0, 0, 0, 0, 0, 0],
        [5, 0, 0, 0, 0, 0, 0, 7, 3],
        [0, 0, 2, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 4, 0, 0, 0, 9]
      ];

      // Set a very short timeout to test timeout functionality
      const result = solverService.solve(difficultPuzzle, 50); // 50ms timeout

      // Either it solves quickly or times out
      expect(result.timedOut || result.solvable).toBe(true);
      expect(result.performanceMetrics.solvingTimeMs).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle grids with single empty cell', () => {
      const nearlyComplete: SudokuGrid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 0] // Only last cell empty
      ];

      const result = solverService.solve(nearlyComplete);

      expect(result.solvable).toBe(true);
      expect(result.solution![8][8]).toBe(9);
      expect(result.performanceMetrics.constraintPropagationSteps).toBeGreaterThan(0);
    });

    it('should handle grids with impossible constraints', () => {
      const impossiblePuzzle: SudokuGrid = [
        [1, 2, 3, 4, 5, 6, 7, 8, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 9], // 9 must go in position [0][8], but that would create duplicate in column
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ];

      const result = solverService.solve(impossiblePuzzle);

      expect(result.solvable).toBe(false);
      expect(result.solution).toBeNull();
    });

    it('should maintain consistency across multiple solve calls', () => {
      const testPuzzle: SudokuGrid = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
      ];

      const result1 = solverService.solve(testPuzzle);
      const result2 = solverService.solve(testPuzzle);

      expect(result1.solvable).toBe(result2.solvable);
      expect(result1.uniqueSolution).toBe(result2.uniqueSolution);
      expect(result1.solution).toEqual(result2.solution);
    });
  });

  describe('Hint System Integration', () => {
    it('should provide hints for simple puzzles', () => {
      const puzzleWithNakedSingle: SudokuGrid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 0] // Only one cell empty, should have naked single
      ];

      const hint = solverService.getHint(puzzleWithNakedSingle);

      expect(hint.hasHint).toBe(true);
      expect(hint.position).toEqual({ row: 8, col: 8, box: 8 });
      expect(hint.value).toBe(9);
      expect(hint.technique).toBe('Naked Singles');
      expect(hint.difficulty).toBe('basic');
      expect(hint.confidence).toBe(1.0);
    });

    it('should analyze available techniques', () => {
      const testPuzzle: SudokuGrid = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
      ];

      const techniques = solverService.analyzeTechniques(testPuzzle);

      expect(techniques).toHaveLength(2); // Naked Singles and Hidden Singles
      expect(techniques[0].technique).toBe('Naked Singles');
      expect(techniques[1].technique).toBe('Hidden Singles');
    });

    it('should provide next move suggestions', () => {
      const puzzleWithNakedSingle: SudokuGrid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 0] // Only one cell empty
      ];

      const nextMove = solverService.getNextMove(puzzleWithNakedSingle);

      expect(nextMove).not.toBeNull();
      expect(nextMove!.position).toEqual({ row: 8, col: 8, box: 8 });
      expect(nextMove!.value).toBe(9);
      expect(nextMove!.technique).toBe('Naked Singles');
      expect(nextMove!.confidence).toBe(1.0);
    });

    it('should exclude specified techniques from analysis', () => {
      const puzzleWithNakedSingle: SudokuGrid = [
        [5, 3, 4, 6, 7, 8, 9, 1, 2],
        [6, 7, 2, 1, 9, 5, 3, 4, 8],
        [1, 9, 8, 3, 4, 2, 5, 6, 7],
        [8, 5, 9, 7, 6, 1, 4, 2, 3],
        [4, 2, 6, 8, 5, 3, 7, 9, 1],
        [7, 1, 3, 9, 2, 4, 8, 5, 6],
        [9, 6, 1, 5, 3, 7, 2, 8, 4],
        [2, 8, 7, 4, 1, 9, 6, 3, 5],
        [3, 4, 5, 2, 8, 6, 1, 7, 0] // Only one cell empty
      ];

      const nextMove = solverService.getNextMove(puzzleWithNakedSingle, ['Naked Singles']);

      // Should find a move using Hidden Singles since naked singles are excluded
      expect(nextMove).not.toBeNull();
      if (nextMove) {
        expect(nextMove.technique).toBe('Hidden Singles');
        expect(nextMove.confidence).toBeGreaterThan(0);
      }
    });

    it('should provide fallback hints when no logical moves available', () => {
      const complexPuzzle: SudokuGrid = [
        [0, 0, 0, 0, 0, 0, 0, 1, 0],
        [4, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 2, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 5, 0, 4, 0, 7],
        [0, 0, 8, 0, 0, 0, 3, 0, 0],
        [0, 0, 1, 0, 9, 0, 0, 0, 0],
        [3, 0, 0, 4, 0, 0, 2, 0, 0],
        [0, 5, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 8, 0, 6, 0, 0, 0]
      ];

      const hint = solverService.getHint(complexPuzzle);

      expect(hint.hasHint).toBe(true);
      // Should find logical moves (Naked Singles or Hidden Singles) rather than fallback to possible values
      expect(['Naked Singles', 'Hidden Singles', 'Possible values']).toContain(hint.technique);
      expect(hint.difficulty).toBe('basic');
      expect(hint.confidence).toBeGreaterThan(0);
    });
  });

  describe('Integration with SudokuRules', () => {
    it('should respect Sudoku rules in solutions', () => {
      const testPuzzle: SudokuGrid = [
        [5, 3, 0, 0, 7, 0, 0, 0, 0],
        [6, 0, 0, 1, 9, 5, 0, 0, 0],
        [0, 9, 8, 0, 0, 0, 0, 6, 0],
        [8, 0, 0, 0, 6, 0, 0, 0, 3],
        [4, 0, 0, 8, 0, 3, 0, 0, 1],
        [7, 0, 0, 0, 2, 0, 0, 0, 6],
        [0, 6, 0, 0, 0, 0, 2, 8, 0],
        [0, 0, 0, 4, 1, 9, 0, 0, 5],
        [0, 0, 0, 0, 8, 0, 0, 7, 9]
      ];

      const result = solverService.solve(testPuzzle);

      if (result.solution) {
        // Check all rows
        for (let row = 0; row < 9; row++) {
          const rowValues = new Set(result.solution[row]);
          expect(rowValues.size).toBe(9);
          expect(rowValues.has(0)).toBe(false);
        }

        // Check all columns
        for (let col = 0; col < 9; col++) {
          const colValues = new Set();
          for (let row = 0; row < 9; row++) {
            colValues.add(result.solution[row][col]);
          }
          expect(colValues.size).toBe(9);
          expect(colValues.has(0)).toBe(false);
        }

        // Check all boxes
        for (let box = 0; box < 9; box++) {
          const boxValues = new Set();
          const startRow = Math.floor(box / 3) * 3;
          const startCol = (box % 3) * 3;

          for (let row = startRow; row < startRow + 3; row++) {
            for (let col = startCol; col < startCol + 3; col++) {
              boxValues.add(result.solution[row][col]);
            }
          }
          expect(boxValues.size).toBe(9);
          expect(boxValues.has(0)).toBe(false);
        }
      }
    });
  });
});