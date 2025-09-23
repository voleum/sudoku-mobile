import { SudokuGrid, CellValue, DifficultyLevel, ValidationResult, ErrorType, CellPosition, MoveValidationOptions } from '../types/GameTypes';
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

export class MoveValidator {
  static validateMove(
    grid: SudokuGrid,
    originalGrid: SudokuGrid,
    row: number,
    col: number,
    value: CellValue,
    options: MoveValidationOptions = {
      allowErrors: true,
      realTimeValidation: true,
      strictMode: false
    }
  ): ValidationResult {
    const conflicts: CellPosition[] = [];
    const affectedCells: CellPosition[] = [];
    let errorType: ErrorType | undefined;
    let errorMessage: string | undefined;

    // Validation 1: Check if trying to modify a clue (original grid cell)
    if (originalGrid[row][col] !== SudokuRules.EMPTY_CELL) {
      return {
        isValid: false,
        conflicts: [{ row, col }],
        errorType: ErrorType.MODIFY_CLUE,
        affectedCells: [{ row, col }],
        errorMessage: 'Cannot modify a given clue'
      };
    }

    // Validation 2: Check if value is in valid range
    if (value < 0 || value > 9) {
      return {
        isValid: false,
        conflicts: [{ row, col }],
        errorType: ErrorType.INVALID_NUMBER,
        affectedCells: [{ row, col }],
        errorMessage: 'Value must be between 1 and 9 or empty (0)'
      };
    }

    // If clearing cell (value = 0), it's always valid
    if (value === SudokuRules.EMPTY_CELL) {
      return {
        isValid: true,
        conflicts: [],
        affectedCells: [],
      };
    }

    // Validation 3: Check row conflicts
    const rowConflicts = this.findRowConflicts(grid, row, col, value);
    if (rowConflicts.length > 0) {
      conflicts.push(...rowConflicts);
      affectedCells.push(...rowConflicts);
      errorType = ErrorType.ROW_DUPLICATE;
      errorMessage = `Number ${value} already exists in row ${row + 1}`;
    }

    // Validation 4: Check column conflicts
    const colConflicts = this.findColumnConflicts(grid, row, col, value);
    if (colConflicts.length > 0) {
      conflicts.push(...colConflicts);
      affectedCells.push(...colConflicts);
      errorType = errorType || ErrorType.COLUMN_DUPLICATE;
      if (!errorMessage) {
        errorMessage = `Number ${value} already exists in column ${String.fromCharCode(65 + col)}`;
      }
    }

    // Validation 5: Check box conflicts
    const boxConflicts = this.findBoxConflicts(grid, row, col, value);
    if (boxConflicts.length > 0) {
      conflicts.push(...boxConflicts);
      affectedCells.push(...boxConflicts);
      errorType = errorType || ErrorType.BOX_DUPLICATE;
      if (!errorMessage) {
        const boxIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);
        errorMessage = `Number ${value} already exists in box ${boxIndex + 1}`;
      }
    }

    // Add the target cell to affected cells if there are conflicts
    if (conflicts.length > 0) {
      affectedCells.push({ row, col });
    }

    // Remove duplicates before returning
    const uniqueConflicts = this.removeDuplicatePositions(conflicts);
    const uniqueAffectedCells = this.removeDuplicatePositions(affectedCells);

    const isValid = uniqueConflicts.length === 0;

    // In strict mode, block invalid moves
    if (options.strictMode && !isValid) {
      return {
        isValid: false,
        conflicts: uniqueConflicts,
        errorType,
        affectedCells: uniqueAffectedCells,
        errorMessage
      };
    }

    return {
      isValid,
      conflicts: uniqueConflicts,
      errorType,
      affectedCells: uniqueAffectedCells,
      errorMessage
    };
  }

  static validateCompleteGrid(grid: SudokuGrid): ValidationResult {
    const conflicts: CellPosition[] = [];
    const affectedCells: CellPosition[] = [];

    // Check all cells for conflicts using the basic SudokuRules validation
    for (let row = 0; row < SudokuRules.GRID_SIZE; row++) {
      for (let col = 0; col < SudokuRules.GRID_SIZE; col++) {
        const value = grid[row][col];
        if (value !== SudokuRules.EMPTY_CELL) {
          // Use SudokuRules validation which checks for placement validity
          if (!SudokuRules.isValidPlacement(grid, row, col, value)) {
            conflicts.push({ row, col });
            affectedCells.push({ row, col });
          }
        }
      }
    }

    // Remove duplicates
    const uniqueConflicts = this.removeDuplicatePositions(conflicts);
    const uniqueAffectedCells = this.removeDuplicatePositions(affectedCells);

    return {
      isValid: uniqueConflicts.length === 0,
      conflicts: uniqueConflicts,
      affectedCells: uniqueAffectedCells,
      errorMessage: uniqueConflicts.length > 0 ? `Found ${uniqueConflicts.length} conflicting cells` : undefined
    };
  }

  static findAllErrors(grid: SudokuGrid, _originalGrid: SudokuGrid): ValidationResult {
    return this.validateCompleteGrid(grid);
  }

  private static findRowConflicts(grid: SudokuGrid, row: number, col: number, value: CellValue): CellPosition[] {
    const conflicts: CellPosition[] = [];

    for (let c = 0; c < SudokuRules.GRID_SIZE; c++) {
      if (c !== col && grid[row][c] === value) {
        conflicts.push({ row, col: c });
      }
    }

    return conflicts;
  }

  private static findColumnConflicts(grid: SudokuGrid, row: number, col: number, value: CellValue): CellPosition[] {
    const conflicts: CellPosition[] = [];

    for (let r = 0; r < SudokuRules.GRID_SIZE; r++) {
      if (r !== row && grid[r][col] === value) {
        conflicts.push({ row: r, col });
      }
    }

    return conflicts;
  }

  private static findBoxConflicts(grid: SudokuGrid, row: number, col: number, value: CellValue): CellPosition[] {
    const conflicts: CellPosition[] = [];
    const boxStartRow = Math.floor(row / SudokuRules.BOX_SIZE) * SudokuRules.BOX_SIZE;
    const boxStartCol = Math.floor(col / SudokuRules.BOX_SIZE) * SudokuRules.BOX_SIZE;

    for (let r = boxStartRow; r < boxStartRow + SudokuRules.BOX_SIZE; r++) {
      for (let c = boxStartCol; c < boxStartCol + SudokuRules.BOX_SIZE; c++) {
        if ((r !== row || c !== col) && grid[r][c] === value) {
          conflicts.push({ row: r, col: c });
        }
      }
    }

    return conflicts;
  }

  private static removeDuplicatePositions(positions: CellPosition[]): CellPosition[] {
    const seen = new Set<string>();
    return positions.filter(pos => {
      const key = `${pos.row}-${pos.col}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  static getBoxIndex(row: number, col: number): number {
    return Math.floor(row / SudokuRules.BOX_SIZE) * 3 + Math.floor(col / SudokuRules.BOX_SIZE);
  }

  static getCellsInSameRow(row: number): CellPosition[] {
    const cells: CellPosition[] = [];
    for (let col = 0; col < SudokuRules.GRID_SIZE; col++) {
      cells.push({ row, col });
    }
    return cells;
  }

  static getCellsInSameColumn(col: number): CellPosition[] {
    const cells: CellPosition[] = [];
    for (let row = 0; row < SudokuRules.GRID_SIZE; row++) {
      cells.push({ row, col });
    }
    return cells;
  }

  static getCellsInSameBox(row: number, col: number): CellPosition[] {
    const cells: CellPosition[] = [];
    const boxStartRow = Math.floor(row / SudokuRules.BOX_SIZE) * SudokuRules.BOX_SIZE;
    const boxStartCol = Math.floor(col / SudokuRules.BOX_SIZE) * SudokuRules.BOX_SIZE;

    for (let r = boxStartRow; r < boxStartRow + SudokuRules.BOX_SIZE; r++) {
      for (let c = boxStartCol; c < boxStartCol + SudokuRules.BOX_SIZE; c++) {
        cells.push({ row: r, col: c });
      }
    }

    return cells;
  }
}