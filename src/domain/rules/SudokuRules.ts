import { SudokuGrid, CellValue, DifficultyLevel } from '../types/GameTypes';
import { QUALITY_VALIDATION } from '../../shared/constants/GameConstants';

export class SudokuRules {
  static readonly GRID_SIZE = 9;
  static readonly BOX_SIZE = 3;
  static readonly EMPTY_CELL = 0;

  static createEmptyGrid(): SudokuGrid {
    return Array(this.GRID_SIZE).fill(null).map(() =>
      Array(this.GRID_SIZE).fill(this.EMPTY_CELL) as CellValue[]
    );
  }

  static isValidPlacement(grid: SudokuGrid, row: number, col: number, value: CellValue): boolean {
    if (value === this.EMPTY_CELL) return true;

    return this.isValidInRow(grid, row, col, value) &&
           this.isValidInColumn(grid, row, col, value) &&
           this.isValidInBox(grid, row, col, value);
  }

  static isValidInRow(grid: SudokuGrid, row: number, excludeCol: number, value: CellValue): boolean {
    for (let col = 0; col < this.GRID_SIZE; col++) {
      if (col !== excludeCol && grid[row][col] === value) {
        return false;
      }
    }
    return true;
  }

  static isValidInColumn(grid: SudokuGrid, excludeRow: number, col: number, value: CellValue): boolean {
    for (let row = 0; row < this.GRID_SIZE; row++) {
      if (row !== excludeRow && grid[row][col] === value) {
        return false;
      }
    }
    return true;
  }

  static isValidInBox(grid: SudokuGrid, row: number, col: number, value: CellValue): boolean {
    const boxStartRow = Math.floor(row / this.BOX_SIZE) * this.BOX_SIZE;
    const boxStartCol = Math.floor(col / this.BOX_SIZE) * this.BOX_SIZE;

    for (let r = boxStartRow; r < boxStartRow + this.BOX_SIZE; r++) {
      for (let c = boxStartCol; c < boxStartCol + this.BOX_SIZE; c++) {
        if (r !== row && c !== col && grid[r][c] === value) {
          return false;
        }
      }
    }
    return true;
  }

  static isCompleteGrid(grid: SudokuGrid): boolean {
    for (let row = 0; row < this.GRID_SIZE; row++) {
      for (let col = 0; col < this.GRID_SIZE; col++) {
        if (grid[row][col] === this.EMPTY_CELL) {
          return false;
        }
      }
    }
    return this.isValidGrid(grid);
  }

  static isValidGrid(grid: SudokuGrid): boolean {
    for (let row = 0; row < this.GRID_SIZE; row++) {
      for (let col = 0; col < this.GRID_SIZE; col++) {
        const value = grid[row][col];
        if (value !== this.EMPTY_CELL && !this.isValidPlacement(grid, row, col, value)) {
          return false;
        }
      }
    }
    return true;
  }

  static getEmptyCells(grid: SudokuGrid): Array<{ row: number; col: number }> {
    const emptyCells: Array<{ row: number; col: number }> = [];

    for (let row = 0; row < this.GRID_SIZE; row++) {
      for (let col = 0; col < this.GRID_SIZE; col++) {
        if (grid[row][col] === this.EMPTY_CELL) {
          emptyCells.push({ row, col });
        }
      }
    }

    return emptyCells;
  }

  static getPossibleValues(grid: SudokuGrid, row: number, col: number): CellValue[] {
    if (grid[row][col] !== this.EMPTY_CELL) {
      return [];
    }

    const possibleValues: CellValue[] = [];

    for (let value = 1; value <= 9; value++) {
      if (this.isValidPlacement(grid, row, col, value as CellValue)) {
        possibleValues.push(value as CellValue);
      }
    }

    return possibleValues;
  }

  static getDifficultySettings(difficulty: DifficultyLevel): {
    targetClues: number;
    minClues: number;
    maxClues: number;
    estimatedTime: number;
    techniques: string[];
  } {
    switch (difficulty) {
      case 'easy':
        return {
          targetClues: 52,
          minClues: 50,
          maxClues: 55,
          estimatedTime: 10,
          techniques: ['Basic Sudoku rules only']
        };
      case 'medium':
        return {
          targetClues: 42,
          minClues: 40,
          maxClues: 45,
          estimatedTime: 22,
          techniques: ['Hidden singles', 'Naked pairs']
        };
      case 'hard':
        return {
          targetClues: 32,
          minClues: 30,
          maxClues: 35,
          estimatedTime: 45,
          techniques: ['Hidden pairs', 'Naked triples', 'X-Wing']
        };
      case 'expert':
        return {
          targetClues: 27,
          minClues: 25,
          maxClues: 30,
          estimatedTime: 75,
          techniques: ['Swordfish', 'XY-Wing', 'Advanced chains']
        };
      default:
        return {
          targetClues: 52,
          minClues: 50,
          maxClues: 55,
          estimatedTime: 10,
          techniques: ['Basic rules']
        };
    }
  }

  static copyGrid(grid: SudokuGrid): SudokuGrid {
    return grid.map(row => [...row]);
  }

  // Removed unused shuffleArray method that used Math.random()
  // PuzzleGeneratorService has its own crypto-secure shuffleArray implementation

  // Quality validation functions according to business requirements

  static analyzeSolvingTechniques(grid: SudokuGrid): string[] {
    const techniques: string[] = [];

    // Basic analysis - if puzzle has obvious singles
    if (this.hasNakedSingles(grid)) {
      techniques.push('Naked singles');
    }

    if (this.hasHiddenSingles(grid)) {
      techniques.push('Hidden singles');
    }

    if (this.hasNakedPairs(grid)) {
      techniques.push('Naked pairs');
    }

    if (this.hasHiddenPairs(grid)) {
      techniques.push('Hidden pairs');
    }

    return techniques;
  }

  static evaluateSymmetry(grid: SudokuGrid): number {
    let symmetricPairs = 0;
    let totalPairs = 0;

    // Check rotational symmetry (180 degrees)
    for (let row = 0; row < this.GRID_SIZE; row++) {
      for (let col = 0; col < this.GRID_SIZE; col++) {
        const mirrorRow = this.GRID_SIZE - 1 - row;
        const mirrorCol = this.GRID_SIZE - 1 - col;

        if (row < mirrorRow || (row === mirrorRow && col < mirrorCol)) {
          totalPairs++;
          const cell1Empty = grid[row][col] === this.EMPTY_CELL;
          const cell2Empty = grid[mirrorRow][mirrorCol] === this.EMPTY_CELL;

          if (cell1Empty === cell2Empty) {
            symmetricPairs++;
          }
        }
      }
    }

    return totalPairs > 0 ? symmetricPairs / totalPairs : 0;
  }

  static checkDigitDistribution(grid: SudokuGrid): { [digit: number]: number } {
    const distribution: { [digit: number]: number } = {};

    for (let digit = 1; digit <= 9; digit++) {
      distribution[digit] = 0;
    }

    for (let row = 0; row < this.GRID_SIZE; row++) {
      for (let col = 0; col < this.GRID_SIZE; col++) {
        const value = grid[row][col];
        if (value !== this.EMPTY_CELL) {
          distribution[value]++;
        }
      }
    }

    return distribution;
  }

  static isDistributionBalanced(grid: SudokuGrid): boolean {
    const distribution = this.checkDigitDistribution(grid);
    const counts = Object.values(distribution);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);

    // Distribution is balanced if difference between max and min is not too large
    return (maxCount - minCount) <= QUALITY_VALIDATION.MAX_DISTRIBUTION_DIFFERENCE;
  }

  // Helper methods for technique analysis

  private static hasNakedSingles(grid: SudokuGrid): boolean {
    for (let row = 0; row < this.GRID_SIZE; row++) {
      for (let col = 0; col < this.GRID_SIZE; col++) {
        if (grid[row][col] === this.EMPTY_CELL) {
          const possibleValues = this.getPossibleValues(grid, row, col);
          if (possibleValues.length === 1) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private static hasHiddenSingles(grid: SudokuGrid): boolean {
    // Simplified check - look for digits that can only go in one place in a unit
    for (let unit = 0; unit < 9; unit++) {
      // Check rows
      if (this.hasHiddenSingleInRow(grid, unit)) return true;
      // Check columns
      if (this.hasHiddenSingleInColumn(grid, unit)) return true;
      // Check boxes
      if (this.hasHiddenSingleInBox(grid, unit)) return true;
    }
    return false;
  }

  private static hasNakedPairs(grid: SudokuGrid): boolean {
    // Simplified analysis - look for cells with exactly 2 candidates
    let pairCandidates = 0;
    for (let row = 0; row < this.GRID_SIZE; row++) {
      for (let col = 0; col < this.GRID_SIZE; col++) {
        if (grid[row][col] === this.EMPTY_CELL) {
          const possibleValues = this.getPossibleValues(grid, row, col);
          if (possibleValues.length === 2) {
            pairCandidates++;
          }
        }
      }
    }
    return pairCandidates >= QUALITY_VALIDATION.NAKED_PAIRS_THRESHOLD;
  }

  private static hasHiddenPairs(grid: SudokuGrid): boolean {
    // Simplified heuristic - if there are enough empty cells with constraints
    let constrainedCells = 0;
    for (let row = 0; row < this.GRID_SIZE; row++) {
      for (let col = 0; col < this.GRID_SIZE; col++) {
        if (grid[row][col] === this.EMPTY_CELL) {
          const possibleValues = this.getPossibleValues(grid, row, col);
          if (possibleValues.length <= 4) {
            constrainedCells++;
          }
        }
      }
    }
    return constrainedCells >= QUALITY_VALIDATION.CONSTRAINED_CELLS_THRESHOLD;
  }

  private static hasHiddenSingleInRow(grid: SudokuGrid, row: number): boolean {
    for (let digit = 1; digit <= 9; digit++) {
      let possiblePositions = 0;
      for (let col = 0; col < this.GRID_SIZE; col++) {
        if (grid[row][col] === this.EMPTY_CELL &&
            this.isValidPlacement(grid, row, col, digit as CellValue)) {
          possiblePositions++;
        }
      }
      if (possiblePositions === 1) return true;
    }
    return false;
  }

  private static hasHiddenSingleInColumn(grid: SudokuGrid, col: number): boolean {
    for (let digit = 1; digit <= 9; digit++) {
      let possiblePositions = 0;
      for (let row = 0; row < this.GRID_SIZE; row++) {
        if (grid[row][col] === this.EMPTY_CELL &&
            this.isValidPlacement(grid, row, col, digit as CellValue)) {
          possiblePositions++;
        }
      }
      if (possiblePositions === 1) return true;
    }
    return false;
  }

  private static hasHiddenSingleInBox(grid: SudokuGrid, boxIndex: number): boolean {
    const boxRow = Math.floor(boxIndex / 3) * 3;
    const boxCol = (boxIndex % 3) * 3;

    for (let digit = 1; digit <= 9; digit++) {
      let possiblePositions = 0;
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          if (grid[r][c] === this.EMPTY_CELL &&
              this.isValidPlacement(grid, r, c, digit as CellValue)) {
            possiblePositions++;
          }
        }
      }
      if (possiblePositions === 1) return true;
    }
    return false;
  }
}