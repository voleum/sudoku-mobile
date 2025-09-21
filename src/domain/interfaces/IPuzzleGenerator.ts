import { SudokuPuzzle, DifficultyLevel } from '../types/GameTypes';

export interface IPuzzleGenerator {
  generate(difficulty: DifficultyLevel, seed?: number): Promise<SudokuPuzzle>;
  generateWithSeed(difficulty: DifficultyLevel, seed: number): Promise<SudokuPuzzle>;
  validatePuzzle(puzzle: SudokuPuzzle): boolean;
}