import {
  IGameSaveRepository,
  GameSave,
  SaveSlot,
  SaveOperationResult,
  LoadOperationResult,
  DifficultyLevel,
  GameMove
} from '../../domain/types/GameTypes';
import { DatabaseManager } from '../storage/DatabaseManager';

/**
 * SQLite implementation of the GameSave repository
 * Based on business analysis requirements from 1.4-functional-requirements.md
 * and database schema from 2.2.4-database-schema.md
 */
export class SQLiteGameSaveRepository implements IGameSaveRepository {
  private dbManager: DatabaseManager;

  constructor() {
    this.dbManager = DatabaseManager.getInstance();
  }

  // Core Save Operations

  async save(gameSave: GameSave): Promise<SaveOperationResult> {
    try {
      const queries = [
        {
          query: `
            INSERT OR REPLACE INTO games (
              id, name, puzzle_id, difficulty, status, original_grid, current_grid, solution_grid,
              created_at, started_at, last_played_at, play_time_seconds,
              pause_time_seconds, total_moves, hints_used, errors_count,
              game_version, metadata
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          params: [
            gameSave.id,
            gameSave.name || null,
            gameSave.puzzleId,
            gameSave.difficulty,
            gameSave.isCompleted ? 'completed' : 'active',
            JSON.stringify(gameSave.originalPuzzle),
            JSON.stringify(gameSave.currentState),
            JSON.stringify(gameSave.originalPuzzle), // Using original as solution for now
            Math.floor(gameSave.startTime.getTime() / 1000),
            Math.floor(gameSave.startTime.getTime() / 1000),
            Math.floor(gameSave.lastPlayed.getTime() / 1000),
            gameSave.totalPlayTime,
            gameSave.pausedTime,
            gameSave.movesCount,
            gameSave.hintsUsed,
            gameSave.errorsCount,
            '1.0',
            JSON.stringify({
              name: gameSave.name,
              hintsEnabled: gameSave.hintsEnabled,
              errorCheckEnabled: gameSave.errorCheckEnabled,
              timerVisible: gameSave.timerVisible,
              completedAt: gameSave.completedAt?.getTime(),
            })
          ]
        }
      ];

      // Save move history
      if (gameSave.moveHistory && gameSave.moveHistory.length > 0) {
        // First delete existing moves for this game
        queries.push({
          query: 'DELETE FROM game_moves WHERE game_id = ?',
          params: [gameSave.id]
        });

        // Insert new moves
        gameSave.moveHistory.forEach((move, index) => {
          queries.push({
            query: `
              INSERT INTO game_moves (
                game_id, move_number, row, col, old_value, new_value,
                move_type, timestamp, game_time_seconds
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            params: [
              gameSave.id,
              move.moveNumber || index + 1,
              move.position.row,
              move.position.col,
              move.previousValue,
              move.newValue,
              'user',
              Math.floor(move.timestamp.getTime() / 1000),
              gameSave.totalPlayTime
            ]
          });
        });
      }

      await this.dbManager.executeTransaction(queries);

      return {
        success: true,
        saveId: gameSave.id
      };

    } catch (error) {
      console.error('Error saving game:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async load(saveId: string): Promise<LoadOperationResult> {
    try {
      const [gameResult] = await this.dbManager.executeQuery(
        'SELECT * FROM games WHERE id = ?',
        [saveId]
      );

      if (gameResult.rows.length === 0) {
        return {
          success: false,
          error: 'Save not found'
        };
      }

      const gameData = gameResult.rows.item(0);
      const metadata = gameData.metadata ? JSON.parse(gameData.metadata) : {};

      // Load move history
      const [movesResult] = await this.dbManager.executeQuery(
        'SELECT * FROM game_moves WHERE game_id = ? ORDER BY move_number ASC',
        [saveId]
      );

      const moveHistory: GameMove[] = [];
      for (let i = 0; i < movesResult.rows.length; i++) {
        const moveData = movesResult.rows.item(i);
        moveHistory.push({
          position: {
            row: moveData.row,
            col: moveData.col,
            box: Math.floor(moveData.row / 3) * 3 + Math.floor(moveData.col / 3)
          },
          previousValue: moveData.old_value,
          newValue: moveData.new_value,
          timestamp: new Date(moveData.timestamp * 1000),
          moveNumber: moveData.move_number
        });
      }

      const gameSave: GameSave = {
        id: gameData.id,
        name: gameData.name || metadata.name, // Prefer direct field, fallback to metadata
        puzzleId: gameData.puzzle_id || gameData.id, // Prefer direct field, fallback to game id
        currentState: JSON.parse(gameData.current_grid),
        originalPuzzle: JSON.parse(gameData.original_grid),
        difficulty: gameData.difficulty as DifficultyLevel,
        startTime: new Date(gameData.started_at * 1000),
        totalPlayTime: gameData.play_time_seconds,
        pausedTime: gameData.pause_time_seconds,
        hintsUsed: gameData.hints_used,
        errorsCount: gameData.errors_count,
        movesCount: gameData.total_moves,
        lastPlayed: new Date(gameData.last_played_at * 1000),
        isCompleted: gameData.status === 'completed',
        completedAt: metadata.completedAt ? new Date(metadata.completedAt) : undefined,
        hintsEnabled: metadata.hintsEnabled ?? true,
        errorCheckEnabled: metadata.errorCheckEnabled ?? true,
        timerVisible: metadata.timerVisible ?? true,
        moveHistory,
        historyIndex: moveHistory.length - 1
      };

      return {
        success: true,
        gameData: gameSave
      };

    } catch (error) {
      console.error('Error loading game:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async delete(saveId: string): Promise<boolean> {
    try {
      await this.dbManager.executeQuery(
        'DELETE FROM games WHERE id = ?',
        [saveId]
      );
      return true;
    } catch (error) {
      console.error('Error deleting save:', error);
      return false;
    }
  }

  async exists(saveId: string): Promise<boolean> {
    try {
      const [result] = await this.dbManager.executeQuery(
        'SELECT COUNT(*) as count FROM games WHERE id = ?',
        [saveId]
      );
      return result.rows.item(0).count > 0;
    } catch (error) {
      console.error('Error checking save existence:', error);
      return false;
    }
  }

  // Named Saves Management

  async saveNamed(gameSave: GameSave, name: string): Promise<SaveOperationResult> {
    const namedSave = { ...gameSave, name };
    return this.save(namedSave);
  }

  async loadNamed(name: string): Promise<LoadOperationResult> {
    try {
      const [result] = await this.dbManager.executeQuery(
        `SELECT id FROM games WHERE name = ?`,
        [name]
      );

      if (result.rows.length === 0) {
        return {
          success: false,
          error: 'Named save not found'
        };
      }

      return this.load(result.rows.item(0).id);
    } catch (error) {
      console.error('Error loading named save:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async renameNamed(saveId: string, newName: string): Promise<boolean> {
    try {
      const loadResult = await this.load(saveId);
      if (!loadResult.success || !loadResult.gameData) {
        return false;
      }

      const gameSave = { ...loadResult.gameData, name: newName };
      const saveResult = await this.save(gameSave);
      return saveResult.success;
    } catch (error) {
      console.error('Error renaming save:', error);
      return false;
    }
  }

  async duplicateNamed(saveId: string, newName: string): Promise<SaveOperationResult> {
    try {
      const loadResult = await this.load(saveId);
      if (!loadResult.success || !loadResult.gameData) {
        return {
          success: false,
          error: 'Original save not found'
        };
      }

      const newId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const duplicatedSave = {
        ...loadResult.gameData,
        id: newId,
        name: newName
      };

      return this.save(duplicatedSave);
    } catch (error) {
      console.error('Error duplicating save:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Query Operations

  async findAll(): Promise<SaveSlot[]> {
    try {
      const [result] = await this.dbManager.executeQuery(`
        SELECT
          id,
          difficulty,
          status,
          created_at,
          last_played_at,
          metadata
        FROM games
        ORDER BY last_played_at DESC
      `);

      const slots: SaveSlot[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        const metadata = row.metadata ? JSON.parse(row.metadata) : {};

        slots.push({
          id: row.id,
          name: metadata.name || `Game ${row.difficulty}`,
          gameId: row.id,
          createdAt: new Date(row.created_at * 1000),
          lastModified: new Date(row.last_played_at * 1000),
          isAutoSave: !metadata.name // If no name, it's an auto-save
        });
      }

      return slots;
    } catch (error) {
      console.error('Error finding all saves:', error);
      return [];
    }
  }

  async findByDifficulty(difficulty: DifficultyLevel): Promise<SaveSlot[]> {
    try {
      const [result] = await this.dbManager.executeQuery(`
        SELECT
          id,
          difficulty,
          status,
          created_at,
          last_played_at,
          metadata
        FROM games
        WHERE difficulty = ?
        ORDER BY last_played_at DESC
      `, [difficulty]);

      const slots: SaveSlot[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        const metadata = row.metadata ? JSON.parse(row.metadata) : {};

        slots.push({
          id: row.id,
          name: metadata.name || `Game ${row.difficulty}`,
          gameId: row.id,
          createdAt: new Date(row.created_at * 1000),
          lastModified: new Date(row.last_played_at * 1000),
          isAutoSave: !metadata.name
        });
      }

      return slots;
    } catch (error) {
      console.error('Error finding saves by difficulty:', error);
      return [];
    }
  }

  async findInProgress(): Promise<SaveSlot[]> {
    return this.findByStatus('active');
  }

  async findCompleted(): Promise<SaveSlot[]> {
    return this.findByStatus('completed');
  }

  private async findByStatus(status: string): Promise<SaveSlot[]> {
    try {
      const [result] = await this.dbManager.executeQuery(`
        SELECT
          id,
          difficulty,
          status,
          created_at,
          last_played_at,
          metadata
        FROM games
        WHERE status = ?
        ORDER BY last_played_at DESC
      `, [status]);

      const slots: SaveSlot[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        const metadata = row.metadata ? JSON.parse(row.metadata) : {};

        slots.push({
          id: row.id,
          name: metadata.name || `Game ${row.difficulty}`,
          gameId: row.id,
          createdAt: new Date(row.created_at * 1000),
          lastModified: new Date(row.last_played_at * 1000),
          isAutoSave: !metadata.name
        });
      }

      return slots;
    } catch (error) {
      console.error(`Error finding saves by status ${status}:`, error);
      return [];
    }
  }

  async findAutoSaves(): Promise<SaveSlot[]> {
    try {
      const [result] = await this.dbManager.executeQuery(`
        SELECT
          id,
          difficulty,
          status,
          created_at,
          last_played_at,
          metadata
        FROM games
        WHERE name IS NULL
        ORDER BY last_played_at DESC
      `);

      const slots: SaveSlot[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);

        slots.push({
          id: row.id,
          name: `Auto-save ${row.difficulty}`,
          gameId: row.id,
          createdAt: new Date(row.created_at * 1000),
          lastModified: new Date(row.last_played_at * 1000),
          isAutoSave: true
        });
      }

      return slots;
    } catch (error) {
      console.error('Error finding auto saves:', error);
      return [];
    }
  }

  async findNamedSaves(): Promise<SaveSlot[]> {
    try {
      const [result] = await this.dbManager.executeQuery(`
        SELECT
          id,
          difficulty,
          status,
          created_at,
          last_played_at,
          metadata
        FROM games
        WHERE name IS NOT NULL
        ORDER BY last_played_at DESC
      `);

      const slots: SaveSlot[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        const metadata = row.metadata ? JSON.parse(row.metadata) : {};

        slots.push({
          id: row.id,
          name: metadata.name || `Named Game ${row.difficulty}`,
          gameId: row.id,
          createdAt: new Date(row.created_at * 1000),
          lastModified: new Date(row.last_played_at * 1000),
          isAutoSave: false
        });
      }

      return slots;
    } catch (error) {
      console.error('Error finding named saves:', error);
      return [];
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<SaveSlot[]> {
    try {
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const endTimestamp = Math.floor(endDate.getTime() / 1000);

      const [result] = await this.dbManager.executeQuery(`
        SELECT
          id,
          difficulty,
          status,
          created_at,
          last_played_at,
          metadata
        FROM games
        WHERE last_played_at BETWEEN ? AND ?
        ORDER BY last_played_at DESC
      `, [startTimestamp, endTimestamp]);

      const slots: SaveSlot[] = [];
      for (let i = 0; i < result.rows.length; i++) {
        const row = result.rows.item(i);
        const metadata = row.metadata ? JSON.parse(row.metadata) : {};

        slots.push({
          id: row.id,
          name: metadata.name || `Game ${row.difficulty}`,
          gameId: row.id,
          createdAt: new Date(row.created_at * 1000),
          lastModified: new Date(row.last_played_at * 1000),
          isAutoSave: !metadata.name
        });
      }

      return slots;
    } catch (error) {
      console.error('Error finding saves by date range:', error);
      return [];
    }
  }

  // Auto-save Operations

  async autoSave(gameSave: GameSave): Promise<SaveOperationResult> {
    // Auto-saves don't have names
    const autoSaveData = { ...gameSave, name: undefined };
    return this.save(autoSaveData);
  }

  async getLatestAutoSave(): Promise<LoadOperationResult> {
    try {
      const autoSaves = await this.findAutoSaves();
      if (autoSaves.length === 0) {
        return {
          success: false,
          error: 'No auto-saves found'
        };
      }

      return this.load(autoSaves[0].id);
    } catch (error) {
      console.error('Error getting latest auto save:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async cleanupOldAutoSaves(olderThanDays: number = 7): Promise<number> {
    try {
      const cutoffDate = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
      const cutoffTimestamp = Math.floor(cutoffDate / 1000);

      const [result] = await this.dbManager.executeQuery(`
        DELETE FROM games
        WHERE name IS NULL
        AND last_played_at < ?
      `, [cutoffTimestamp]);

      return result.rowsAffected || 0;
    } catch (error) {
      console.error('Error cleaning up old auto saves:', error);
      return 0;
    }
  }

  // Statistics and Metadata

  async getTotalSavesCount(): Promise<number> {
    try {
      const [result] = await this.dbManager.executeQuery(
        'SELECT COUNT(*) as count FROM games'
      );
      return result.rows.item(0).count;
    } catch (error) {
      console.error('Error getting total saves count:', error);
      return 0;
    }
  }

  async getNamedSavesCount(): Promise<number> {
    try {
      const [result] = await this.dbManager.executeQuery(
        `SELECT COUNT(*) as count FROM games WHERE name IS NOT NULL`
      );
      return result.rows.item(0).count;
    } catch (error) {
      console.error('Error getting named saves count:', error);
      return 0;
    }
  }

  async getAutoSavesCount(): Promise<number> {
    try {
      const [result] = await this.dbManager.executeQuery(
        `SELECT COUNT(*) as count FROM games WHERE name IS NULL`
      );
      return result.rows.item(0).count;
    } catch (error) {
      console.error('Error getting auto saves count:', error);
      return 0;
    }
  }

  async getSaveSize(saveId: string): Promise<number> {
    try {
      const [result] = await this.dbManager.executeQuery(`
        SELECT
          LENGTH(original_grid) + LENGTH(current_grid) +
          LENGTH(COALESCE(solution_grid, '')) + LENGTH(COALESCE(metadata, '')) as size
        FROM games
        WHERE id = ?
      `, [saveId]);

      if (result.rows.length === 0) {
        return 0;
      }

      return result.rows.item(0).size;
    } catch (error) {
      console.error('Error getting save size:', error);
      return 0;
    }
  }

  async getTotalStorageUsed(): Promise<number> {
    try {
      const [result] = await this.dbManager.executeQuery(`
        SELECT
          SUM(
            LENGTH(original_grid) + LENGTH(current_grid) +
            LENGTH(COALESCE(solution_grid, '')) + LENGTH(COALESCE(metadata, ''))
          ) as total_size
        FROM games
      `);

      return result.rows.item(0).total_size || 0;
    } catch (error) {
      console.error('Error getting total storage used:', error);
      return 0;
    }
  }

  // Batch Operations

  async deleteBatch(saveIds: string[]): Promise<boolean> {
    try {
      const placeholders = saveIds.map(() => '?').join(',');
      await this.dbManager.executeQuery(
        `DELETE FROM games WHERE id IN (${placeholders})`,
        saveIds
      );
      return true;
    } catch (error) {
      console.error('Error deleting batch saves:', error);
      return false;
    }
  }

  async exportSaves(saveIds: string[]): Promise<string> {
    try {
      const saves: GameSave[] = [];

      for (const saveId of saveIds) {
        const loadResult = await this.load(saveId);
        if (loadResult.success && loadResult.gameData) {
          saves.push(loadResult.gameData);
        }
      }

      return JSON.stringify({
        version: '1.0',
        exportDate: new Date().toISOString(),
        saves
      }, null, 2);
    } catch (error) {
      console.error('Error exporting saves:', error);
      throw error;
    }
  }

  async importSaves(jsonData: string): Promise<SaveOperationResult[]> {
    try {
      const importData = JSON.parse(jsonData);
      const results: SaveOperationResult[] = [];

      if (!importData.saves || !Array.isArray(importData.saves)) {
        throw new Error('Invalid import data format');
      }

      for (const saveData of importData.saves) {
        // Generate new ID to avoid conflicts
        const newId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const gameSave: GameSave = {
          ...saveData,
          id: newId
        };

        const result = await this.save(gameSave);
        results.push(result);
      }

      return results;
    } catch (error) {
      console.error('Error importing saves:', error);
      return [{
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }];
    }
  }

  // Maintenance Operations

  async vacuum(): Promise<void> {
    try {
      await this.dbManager.vacuum();
    } catch (error) {
      console.error('Error vacuuming database:', error);
      throw error;
    }
  }

  async validateSaveIntegrity(saveId: string): Promise<boolean> {
    try {
      const loadResult = await this.load(saveId);
      if (!loadResult.success || !loadResult.gameData) {
        return false;
      }

      const gameSave = loadResult.gameData;

      // Basic validation checks
      return Boolean(
        gameSave.id &&
        gameSave.currentState &&
        gameSave.originalPuzzle &&
        gameSave.currentState.length === 9 &&
        gameSave.originalPuzzle.length === 9 &&
        gameSave.currentState.every(row => row.length === 9) &&
        gameSave.originalPuzzle.every(row => row.length === 9)
      );
    } catch (error) {
      console.error('Error validating save integrity:', error);
      return false;
    }
  }

  async repairCorruptedSave(saveId: string): Promise<boolean> {
    try {
      // Basic repair attempt - this is a simplified implementation
      const loadResult = await this.load(saveId);
      if (!loadResult.success || !loadResult.gameData) {
        return false;
      }

      const gameSave = loadResult.gameData;

      // Fix any obvious issues
      if (!gameSave.moveHistory) {
        gameSave.moveHistory = [];
        gameSave.historyIndex = -1;
      }

      if (gameSave.totalPlayTime < 0) {
        gameSave.totalPlayTime = 0;
      }

      if (gameSave.pausedTime < 0) {
        gameSave.pausedTime = 0;
      }

      // Save the repaired data
      const saveResult = await this.save(gameSave);
      return saveResult.success;
    } catch (error) {
      console.error('Error repairing corrupted save:', error);
      return false;
    }
  }
}