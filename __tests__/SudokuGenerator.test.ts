import { PuzzleGeneratorService } from '../src/infrastructure/services/PuzzleGeneratorService';
import { SudokuRules } from '../src/domain/rules/SudokuRules';
import { DifficultyLevel, SudokuGrid } from '../src/domain/types/GameTypes';

describe('PuzzleGeneratorService', () => {
  let generator: PuzzleGeneratorService;

  beforeEach(() => {
    generator = PuzzleGeneratorService.getInstance();
  });

  test('should be a singleton', () => {
    const generator1 = PuzzleGeneratorService.getInstance();
    const generator2 = PuzzleGeneratorService.getInstance();
    expect(generator1).toBe(generator2);
  });

  describe('generate', () => {
    const difficulties: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];

    difficulties.forEach(difficulty => {
      test(`should generate valid ${difficulty} puzzle`, async () => {
        const puzzle = await generator.generate(difficulty);

        expect(puzzle).toBeDefined();
        expect(puzzle.difficulty).toBe(difficulty);
        expect(puzzle.id).toBeDefined();
        expect(puzzle.seed).toBeDefined();

        expect(SudokuRules.isValidGrid(puzzle.grid)).toBe(true);
        expect(SudokuRules.isCompleteGrid(puzzle.solution)).toBe(true);

        // Count empty cells
        let emptyCells = 0;
        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            if (puzzle.grid[row][col] === 0) {
              emptyCells++;
            }
          }
        }
        expect(emptyCells).toBeGreaterThan(0);
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
      const puzzle = await generator.generate('easy');
      const grid = puzzle.grid;

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