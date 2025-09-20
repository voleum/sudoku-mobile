export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type SudokuGrid = CellValue[][];
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'expert';

export interface CellPosition {
  row: number;
  col: number;
}

export interface GameEntity {
  id: string;
  grid: SudokuGrid;
  originalGrid: SudokuGrid;
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