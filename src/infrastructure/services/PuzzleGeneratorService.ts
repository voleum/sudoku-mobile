import { IPuzzleGenerator } from '../../domain/interfaces/IPuzzleGenerator';
import { SudokuPuzzle, DifficultyLevel, SudokuGrid } from '../../domain/types/GameTypes';
import { SudokuRules } from '../../domain/rules/SudokuRules';

export class PuzzleGeneratorService implements IPuzzleGenerator {
  private static instance: PuzzleGeneratorService;

  public static getInstance(): PuzzleGeneratorService {
    if (!PuzzleGeneratorService.instance) {
      PuzzleGeneratorService.instance = new PuzzleGeneratorService();
    }
    return PuzzleGeneratorService.instance;
  }

  async generate(difficulty: DifficultyLevel, seed?: number): Promise<SudokuPuzzle> {
    const startTime = Date.now();
    const maxGenerationTime = 2000; // 2 seconds as per business requirements
    const puzzleSeed = seed || Math.floor(Math.random() * 1000000);
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      // Check if we've exceeded the 2-second limit
      if (Date.now() - startTime > maxGenerationTime) {
        throw new Error('Puzzle generation exceeded 2-second performance limit');
      }

      try {
        const seededRandom = this.createSeededRandom(puzzleSeed + attempts);
        const solution = this.generateCompleteSolution(seededRandom);
        const puzzle = this.createPuzzleFromSolution(solution, difficulty, seededRandom);

        if (this.isUniqueSolution(puzzle) && this.validatePuzzleQuality(puzzle, difficulty)) {
          const difficultySettings = SudokuRules.getDifficultySettings(difficulty);
          const actualTechniques = SudokuRules.analyzeSolvingTechniques(puzzle);

          return {
            id: this.generateUUID(),
            seed: puzzleSeed,
            difficulty,
            grid: puzzle,
            solution,
            hints: this.countFilledCells(puzzle),
            estimatedTime: difficultySettings.estimatedTime,
            techniques: actualTechniques.length > 0 ? actualTechniques : difficultySettings.techniques,
            createdAt: new Date()
          };
        }
      } catch (error) {
        console.warn(`Generation attempt ${attempts + 1} failed:`, error);
      }
      attempts++;
    }

    throw new Error('Failed to generate puzzle after maximum attempts');
  }

  async generateWithSeed(difficulty: DifficultyLevel, seed: number): Promise<SudokuPuzzle> {
    return this.generate(difficulty, seed);
  }

  validatePuzzle(puzzle: SudokuPuzzle): boolean {
    return SudokuRules.isValidGrid(puzzle.grid) &&
           SudokuRules.isCompleteGrid(puzzle.solution) &&
           this.isUniqueSolution(puzzle.grid);
  }

  private validatePuzzleQuality(puzzle: SudokuGrid, difficulty: DifficultyLevel): boolean {
    // Validate according to business requirements:
    // 1. Check digit distribution balance
    if (!SudokuRules.isDistributionBalanced(puzzle)) {
      return false;
    }

    // 2. Evaluate symmetry (prefer puzzles with some symmetry)
    const symmetry = SudokuRules.evaluateSymmetry(puzzle);
    if (symmetry < 0.3) { // At least 30% symmetry
      return false;
    }

    // 3. Analyze solving techniques match difficulty
    const actualTechniques = SudokuRules.analyzeSolvingTechniques(puzzle);

    // For easy puzzles, should only require basic techniques
    if (difficulty === 'easy' && actualTechniques.length > 1) {
      return false;
    }

    // For medium+ puzzles, should require some advanced techniques
    if (difficulty !== 'easy' && actualTechniques.length === 0) {
      return false;
    }

    return true;
  }

  private createSeededRandom(seed: number): () => number {
    let state = seed;
    return function() {
      state = (state * 9301 + 49297) % 233280;
      return state / 233280;
    };
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      // eslint-disable-next-line no-bitwise
      const r = Math.random() * 16 | 0;
      // eslint-disable-next-line no-bitwise
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private countFilledCells(grid: SudokuGrid): number {
    let count = 0;
    for (let row = 0; row < SudokuRules.GRID_SIZE; row++) {
      for (let col = 0; col < SudokuRules.GRID_SIZE; col++) {
        if (grid[row][col] !== SudokuRules.EMPTY_CELL) count++;
      }
    }
    return count;
  }

  private generateCompleteSolution(random: () => number): SudokuGrid {
    const grid = SudokuRules.createEmptyGrid();

    if (this.fillGridRecursively(grid, random)) {
      return grid;
    }

    throw new Error('Failed to generate complete solution');
  }

  private fillGridRecursively(grid: SudokuGrid, random: () => number): boolean {
    const emptyCell = this.findBestEmptyCell(grid);

    if (!emptyCell) {
      return true;
    }

    const { row, col } = emptyCell;
    const possibleValues = this.shuffleArray(
      SudokuRules.getPossibleValues(grid, row, col),
      random
    );

    for (const value of possibleValues) {
      grid[row][col] = value;

      if (this.fillGridRecursively(grid, random)) {
        return true;
      }

      grid[row][col] = SudokuRules.EMPTY_CELL;
    }

    return false;
  }

  private findBestEmptyCell(grid: SudokuGrid): { row: number; col: number } | null {
    let bestCell = null;
    let minPossibilities = 10;

    for (let row = 0; row < SudokuRules.GRID_SIZE; row++) {
      for (let col = 0; col < SudokuRules.GRID_SIZE; col++) {
        if (grid[row][col] === SudokuRules.EMPTY_CELL) {
          const possibilities = SudokuRules.getPossibleValues(grid, row, col).length;

          if (possibilities < minPossibilities) {
            minPossibilities = possibilities;
            bestCell = { row, col };
          }

          if (possibilities === 1) {
            return bestCell;
          }
        }
      }
    }

    return bestCell;
  }

  private shuffleArray<T>(array: T[], random: () => number): T[] {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private createPuzzleFromSolution(solution: SudokuGrid, difficulty: DifficultyLevel, random: () => number): SudokuGrid {
    const puzzle = SudokuRules.copyGrid(solution);
    const difficultySettings = SudokuRules.getDifficultySettings(difficulty);
    const targetClues = difficultySettings.targetClues;
    const minClues = difficultySettings.minClues;

    const cellPositions = [];
    for (let row = 0; row < SudokuRules.GRID_SIZE; row++) {
      for (let col = 0; col < SudokuRules.GRID_SIZE; col++) {
        cellPositions.push({ row, col });
      }
    }

    const shuffledPositions = this.shuffleArray(cellPositions, random);
    let currentClues = 81;
    let maxAttempts = 200;
    let attempts = 0;

    for (const { row, col } of shuffledPositions) {
      if (currentClues <= targetClues || attempts >= maxAttempts) {
        break;
      }

      if (currentClues <= minClues) {
        break;
      }

      attempts++;
      const originalValue = puzzle[row][col];
      puzzle[row][col] = SudokuRules.EMPTY_CELL;

      if (this.isUniqueSolution(puzzle)) {
        currentClues--;
      } else {
        puzzle[row][col] = originalValue;
      }
    }

    return puzzle;
  }

  private isUniqueSolution(grid: SudokuGrid): boolean {
    const workingGrid = SudokuRules.copyGrid(grid);
    const solutions: SudokuGrid[] = [];

    this.findAllSolutions(workingGrid, solutions, 2);

    return solutions.length === 1;
  }

  private findAllSolutions(grid: SudokuGrid, solutions: SudokuGrid[], maxSolutions: number): void {
    if (solutions.length >= maxSolutions) {
      return;
    }

    const emptyCell = this.findBestEmptyCell(grid);

    if (!emptyCell) {
      solutions.push(SudokuRules.copyGrid(grid));
      return;
    }

    const { row, col } = emptyCell;
    const possibleValues = SudokuRules.getPossibleValues(grid, row, col);

    for (const value of possibleValues) {
      grid[row][col] = value;
      this.findAllSolutions(grid, solutions, maxSolutions);
      grid[row][col] = SudokuRules.EMPTY_CELL;

      if (solutions.length >= maxSolutions) {
        break;
      }
    }
  }
}