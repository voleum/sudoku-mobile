export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type SudokuGrid = CellValue[][];
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface CellPosition {
  row: number;
  col: number;
}

export interface SudokuPuzzle {
  id: string;
  seed: number;
  difficulty: DifficultyLevel;
  grid: SudokuGrid;
  solution: SudokuGrid;
  hints: number;
  estimatedTime: number;
  techniques: string[];
  createdAt: Date;
}

export interface GameEntity {
  id: string;
  puzzleId: string;
  grid: SudokuGrid;
  originalGrid: SudokuGrid;
  solution: SudokuGrid;
  difficulty: DifficultyLevel;
  startTime: Date;
  currentTime: number;
  hintsUsed: number;
  errorsCount: number;
  isCompleted: boolean;
}

export interface GameMove {
  position: CellPosition;
  value: CellValue;
  previousValue: CellValue;
  timestamp: Date;
}

export interface GameStatistics {
  gamesPlayed: number;
  gamesCompleted: number;
  totalTime: number;
  bestTimes: Record<DifficultyLevel, number>;
  averageTimes: Record<DifficultyLevel, number>;
  hintsUsed: number;
  errorsCount: number;
}

export interface GameSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'ru';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showTimer: boolean;
  showErrors: boolean;
  highlightSameNumbers: boolean;
  highlightRowColumn: boolean;
}

export enum ErrorType {
  ROW_DUPLICATE = 'row_duplicate',
  COLUMN_DUPLICATE = 'column_duplicate',
  BOX_DUPLICATE = 'box_duplicate',
  INVALID_NUMBER = 'invalid_number',
  MODIFY_CLUE = 'modify_clue'
}

export interface ValidationResult {
  isValid: boolean;
  conflicts: CellPosition[];
  errorType?: ErrorType;
  affectedCells: CellPosition[];
  errorMessage?: string;
}

export interface MoveValidationOptions {
  allowErrors: boolean;
  realTimeValidation: boolean;
  strictMode: boolean;
}