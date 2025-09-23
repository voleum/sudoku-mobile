export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type SudokuGrid = CellValue[][];
export type DifficultyLevel = 'beginner' | 'easy' | 'medium' | 'hard' | 'expert';

export interface CellPosition {
  row: number;    // 0-8
  col: number;    // 0-8
  box: number;    // 0-8 (номер 3x3 квадрата)
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
  hintUsageHistory: GameHintUsage[];
  directSolutionHintsUsed: number; // Maximum 3 per game according to business analysis
  playerProfile?: PlayerProfile;
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

export type ValidationMode = 'immediate' | 'onComplete' | 'manual';

export interface MoveValidationOptions {
  mode: ValidationMode;
  allowErrors: boolean;
  strictMode: boolean;
}

export enum HintLevel {
  GENERAL_DIRECTION = 1,
  SPECIFIC_TECHNIQUE = 2,
  EXACT_LOCATION = 3,
  DIRECT_SOLUTION = 4
}

export interface HintRequest {
  grid: SudokuGrid;
  difficulty: DifficultyLevel;
  requestedLevel: HintLevel;
  playerProfile?: PlayerProfile;
}

export interface PlayerProfile {
  preferredTechniques: string[];
  problemAreas: string[];
  learningSpeed: 'slow' | 'medium' | 'fast';
  patienceLevel: 'low' | 'medium' | 'high';
  visualPreference: boolean;
}

export interface HintResponse {
  level: HintLevel;
  message: string;
  technique?: string;
  explanation?: string;
  targetCells: CellPosition[];
  relatedCells: CellPosition[];
  suggestedValue?: CellValue;
  confidence: number;
  colorHighlights: HintColorHighlight[];
  visualAnimations?: HintAnimation[];
  ratingPenalty: number; // Percentage penalty for final rating (Business Analysis requirement)
}

export interface HintColorHighlight {
  cells: CellPosition[];
  color: 'blue' | 'yellow' | 'green' | 'red' | 'purple';
  purpose: 'target' | 'related' | 'positive' | 'exclude' | 'pattern';
}

export interface HintAnimation {
  type: 'arrow' | 'pulse' | 'fade' | 'highlight';
  fromCells?: CellPosition[];
  toCells?: CellPosition[];
  duration: number;
}

export interface GameHintUsage {
  level: HintLevel;
  technique: string;
  timestamp: Date;
  wasHelpful: boolean;
  ratingPenalty: number; // Percentage penalty applied (Business Analysis requirement)
}