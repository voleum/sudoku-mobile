import { SudokuGrid, DifficultyLevel, SudokuPuzzle } from '../../domain/types/GameTypes';
import { Sudoku } from '../../domain/entities/Sudoku';
import { SudokuRules } from '../../domain/rules/SudokuRules';

export interface ISudokuGeneratorService {
  generatePuzzle(difficulty: DifficultyLevel, seed?: number): Promise<Sudoku>;
  solvePuzzle(grid: SudokuGrid): SudokuGrid | null;
  isUniqueSolution(grid: SudokuGrid): boolean;
}

export class SudokuGeneratorService implements ISudokuGeneratorService {
  private static instance: SudokuGeneratorService;

  public static getInstance(): SudokuGeneratorService {
    if (!SudokuGeneratorService.instance) {
      SudokuGeneratorService.instance = new SudokuGeneratorService();
    }
    return SudokuGeneratorService.instance;
  }

  public async generatePuzzle(difficulty: DifficultyLevel, seed?: number): Promise<Sudoku> {
    const puzzleSeed = seed || Math.floor(Math.random() * 1000000);
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
      try {
        const seededRandom = this.createSeededRandom(puzzleSeed + attempts);
        const solution = this.generateCompleteSolution(seededRandom);
        const puzzle = this.createPuzzleFromSolution(solution, difficulty, seededRandom);

        if (this.isUniqueSolution(puzzle)) {
          const difficultySettings = SudokuRules.getDifficultySettings(difficulty);
          const sudokuPuzzle: SudokuPuzzle = {
            id: this.generateUUID(),
            seed: puzzleSeed,
            difficulty,
            grid: puzzle,
            solution,
            hints: this.countFilledCells(puzzle),
            estimatedTime: difficultySettings.estimatedTime,
            techniques: difficultySettings.techniques,
            createdAt: new Date()
          };

          return new Sudoku(sudokuPuzzle.grid, sudokuPuzzle.solution, sudokuPuzzle.difficulty);
        }
      } catch (error) {
        console.warn(`Generation attempt ${attempts + 1} failed:`, error);
      }
      attempts++;
    }

    console.error('Failed to generate puzzle after maximum attempts, returning fallback');
    return this.generateFallbackPuzzle(difficulty);
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

  private generateCompleteSolution(random?: () => number): SudokuGrid {
    const grid = SudokuRules.createEmptyGrid();

    if (this.fillGridRecursively(grid, random)) {
      return grid;
    }

    throw new Error('Failed to generate complete solution');
  }

  private fillGridRecursively(grid: SudokuGrid, random?: () => number): boolean {
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

  private shuffleArray<T>(array: T[], random?: () => number): T[] {
    const shuffled = [...array];
    const randomFunc = random || Math.random;

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(randomFunc() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
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

  private createPuzzleFromSolution(solution: SudokuGrid, difficulty: DifficultyLevel, random?: () => number): SudokuGrid {
    const puzzle = SudokuRules.copyGrid(solution);
    const difficultySettings = SudokuRules.getDifficultySettings(difficulty);
    const targetClues = difficultySettings.targetClues;
    const minClues = difficultySettings.minClues;
    const maxClues = difficultySettings.maxClues;

    const cellPositions = [];
    for (let row = 0; row < SudokuRules.GRID_SIZE; row++) {
      for (let col = 0; col < SudokuRules.GRID_SIZE; col++) {
        cellPositions.push({ row, col });
      }
    }

    const shuffledPositions = this.shuffleArray(cellPositions, random);
    let currentClues = 81; // Start with all cells filled
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

    // Ensure we're within the acceptable range
    const finalClues = this.countFilledCells(puzzle);
    if (finalClues < minClues || finalClues > maxClues) {
      console.warn(`Generated puzzle has ${finalClues} clues, expected ${minClues}-${maxClues} for ${difficulty}`);
    }

    return puzzle;
  }

  public solvePuzzle(grid: SudokuGrid): SudokuGrid | null {
    const workingGrid = SudokuRules.copyGrid(grid);

    if (this.solveRecursively(workingGrid)) {
      return workingGrid;
    }

    return null;
  }

  private solveRecursively(grid: SudokuGrid): boolean {
    const emptyCell = this.findBestEmptyCell(grid);

    if (!emptyCell) {
      return true;
    }

    const { row, col } = emptyCell;
    const possibleValues = SudokuRules.getPossibleValues(grid, row, col);

    for (const value of possibleValues) {
      grid[row][col] = value;

      if (this.solveRecursively(grid)) {
        return true;
      }

      grid[row][col] = SudokuRules.EMPTY_CELL;
    }

    return false;
  }

  public isUniqueSolution(grid: SudokuGrid): boolean {
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

  private generateFallbackPuzzle(difficulty: DifficultyLevel): Sudoku {
    const baseSolution: SudokuGrid = [
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

    const puzzle = this.createPuzzleFromSolution(baseSolution, difficulty);
    return new Sudoku(puzzle, baseSolution, difficulty);
  }
}