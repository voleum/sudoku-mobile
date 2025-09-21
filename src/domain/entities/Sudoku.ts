import { SudokuGrid, CellValue, DifficultyLevel } from '../types/GameTypes';

export class Sudoku {
  private grid: SudokuGrid;
  private solution: SudokuGrid;
  private difficulty: DifficultyLevel;

  constructor(grid: SudokuGrid, solution: SudokuGrid, difficulty: DifficultyLevel) {
    this.grid = grid;
    this.solution = solution;
    this.difficulty = difficulty;
  }

  public getGrid(): SudokuGrid {
    return this.grid.map(row => [...row]);
  }

  public getSolution(): SudokuGrid {
    return this.solution.map(row => [...row]);
  }

  public getDifficulty(): DifficultyLevel {
    return this.difficulty;
  }

  public isValidMove(row: number, col: number, value: CellValue): boolean {
    if (value === 0) return true;

    const tempGrid = this.grid.map(r => [...r]);
    tempGrid[row][col] = value;

    return this.isValidGrid(tempGrid, row, col, value);
  }

  public makeMove(row: number, col: number, value: CellValue): boolean {
    if (this.grid[row][col] !== 0) return false;

    if (this.isValidMove(row, col, value)) {
      this.grid[row][col] = value;
      return true;
    }

    return false;
  }

  public isComplete(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.grid[row][col] === 0) return false;
      }
    }
    return this.isValidSolution();
  }

  public isValidSolution(): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = this.grid[row][col] as CellValue;
        if (value === 0 || !this.isValidGrid(this.grid, row, col, value)) {
          return false;
        }
      }
    }
    return true;
  }

  private isValidGrid(grid: SudokuGrid, row: number, col: number, value: CellValue): boolean {
    return this.isValidRow(grid, row, value, col) &&
           this.isValidColumn(grid, col, value, row) &&
           this.isValidBox(grid, row, col, value);
  }

  private isValidRow(grid: SudokuGrid, row: number, value: CellValue, excludeCol?: number): boolean {
    for (let col = 0; col < 9; col++) {
      if (col !== excludeCol && grid[row][col] === value) {
        return false;
      }
    }
    return true;
  }

  private isValidColumn(grid: SudokuGrid, col: number, value: CellValue, excludeRow?: number): boolean {
    for (let row = 0; row < 9; row++) {
      if (row !== excludeRow && grid[row][col] === value) {
        return false;
      }
    }
    return true;
  }

  private isValidBox(grid: SudokuGrid, row: number, col: number, value: CellValue): boolean {
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;

    for (let r = boxRow; r < boxRow + 3; r++) {
      for (let c = boxCol; c < boxCol + 3; c++) {
        if (r !== row && c !== col && grid[r][c] === value) {
          return false;
        }
      }
    }
    return true;
  }

  public getHint(): { row: number; col: number; value: CellValue } | null {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.grid[row][col] === 0) {
          return {
            row,
            col,
            value: this.solution[row][col]
          };
        }
      }
    }
    return null;
  }

  public getEmptyCellsCount(): number {
    let count = 0;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.grid[row][col] === 0) count++;
      }
    }
    return count;
  }
}