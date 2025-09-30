import { GameSave, SaveSlot, SaveOperationResult, LoadOperationResult, DifficultyLevel } from '../types/GameTypes';

/**
 * Repository interface for game save/load operations
 * Based on business analysis requirements from 1.4-functional-requirements.md
 */
export interface IGameSaveRepository {
  // Core Save Operations
  save(gameSave: GameSave): Promise<SaveOperationResult>;
  load(saveId: string): Promise<LoadOperationResult>;
  delete(saveId: string): Promise<boolean>;
  exists(saveId: string): Promise<boolean>;

  // Named Saves Management
  saveNamed(gameSave: GameSave, name: string): Promise<SaveOperationResult>;
  loadNamed(name: string): Promise<LoadOperationResult>;
  renameNamed(saveId: string, newName: string): Promise<boolean>;
  duplicateNamed(saveId: string, newName: string): Promise<SaveOperationResult>;

  // Query Operations
  findAll(): Promise<SaveSlot[]>;
  findByDifficulty(difficulty: DifficultyLevel): Promise<SaveSlot[]>;
  findInProgress(): Promise<SaveSlot[]>;
  findCompleted(): Promise<SaveSlot[]>;
  findAutoSaves(): Promise<SaveSlot[]>;
  findNamedSaves(): Promise<SaveSlot[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<SaveSlot[]>;

  // Auto-save Operations
  autoSave(gameSave: GameSave): Promise<SaveOperationResult>;
  getLatestAutoSave(): Promise<LoadOperationResult>;
  cleanupOldAutoSaves(olderThanDays?: number): Promise<number>; // Returns number of deleted saves

  // Statistics and Metadata
  getTotalSavesCount(): Promise<number>;
  getNamedSavesCount(): Promise<number>;
  getAutoSavesCount(): Promise<number>;
  getSaveSize(saveId: string): Promise<number>; // Size in bytes
  getTotalStorageUsed(): Promise<number>; // Total storage in bytes

  // Batch Operations
  deleteBatch(saveIds: string[]): Promise<boolean>;
  exportSaves(saveIds: string[]): Promise<string>; // JSON export
  importSaves(jsonData: string): Promise<SaveOperationResult[]>;

  // Maintenance Operations
  vacuum(): Promise<void>; // Database cleanup and optimization
  validateSaveIntegrity(saveId: string): Promise<boolean>;
  repairCorruptedSave(saveId: string): Promise<boolean>;
}