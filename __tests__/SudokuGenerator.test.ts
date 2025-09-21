import { SudokuGeneratorService } from '../src/application/services/SudokuGeneratorService';
import { SudokuRules } from '../src/domain/rules/SudokuRules';
import { DifficultyLevel, SudokuGrid } from '../src/domain/types/GameTypes';

describe('SudokuGeneratorService', () => {
  let generator: SudokuGeneratorService;

  beforeEach(() => {
    generator = SudokuGeneratorService.getInstance();
  });

  test('should be a singleton', () => {
    const generator1 = SudokuGeneratorService.getInstance();
    const generator2 = SudokuGeneratorService.getInstance();
    expect(generator1).toBe(generator2);
  });

  describe('generatePuzzle', () => {
    const difficulties: DifficultyLevel[] = ['easy', 'medium', 'hard', 'expert'];

    difficulties.forEach(difficulty => {
      test(`should generate valid ${difficulty} puzzle`, async () => {
        const puzzle = await generator.generatePuzzle(difficulty);

        expect(puzzle).toBeDefined();
        expect(puzzle.getDifficulty()).toBe(difficulty);

        const grid = puzzle.getGrid();
        const solution = puzzle.getSolution();

        expect(SudokuRules.isValidGrid(grid)).toBe(true);
        expect(SudokuRules.isCompleteGrid(solution)).toBe(true);

        expect(puzzle.getEmptyCellsCount()).toBeGreaterThan(0);
      });
    });
  });

  describe('solvePuzzle', () => {
    test('should solve a solvable puzzle', () => {
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
      ] as SudokuGrid;

      const solution = generator.solvePuzzle(testPuzzle);

      expect(solution).toBeDefined();
      if (solution) {
        expect(SudokuRules.isCompleteGrid(solution)).toBe(true);
      }
    });

    test('should return null for unsolvable puzzle', () => {
      const unsolvablePuzzle: SudokuGrid = [
        [1, 1, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ] as SudokuGrid;

      const solution = generator.solvePuzzle(unsolvablePuzzle);
      expect(solution).toBeNull();
    });
  });

  describe('isUniqueSolution', () => {
    test('should detect unique solution', async () => {
      const puzzle = await generator.generatePuzzle('easy');
      const grid = puzzle.getGrid();

      expect(generator.isUniqueSolution(grid)).toBe(true);
    });

    test('should detect multiple solutions', () => {
      const multipleSolutionPuzzle: SudokuGrid = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0]
      ] as SudokuGrid;

      expect(generator.isUniqueSolution(multipleSolutionPuzzle)).toBe(false);
    });
  });
});