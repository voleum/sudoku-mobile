import {
  IGameSaveRepository,
  SaveOperationResult
} from '../../../domain/types/GameTypes';

/**
 * Use case for managing saved games (delete, rename, export, import, etc.)
 * Based on business requirements from 1.4-functional-requirements.md
 */
export class ManageSavesUseCase {
  constructor(
    private readonly gameSaveRepository: IGameSaveRepository
  ) {}

  /**
   * Delete a saved game
   */
  async deleteSave(saveId: string): Promise<DeleteResult> {
    try {
      // Check if save exists
      const exists = await this.gameSaveRepository.exists(saveId);
      if (!exists) {
        return {
          success: false,
          error: 'Save not found'
        };
      }

      const deleted = await this.gameSaveRepository.delete(saveId);

      return {
        success: deleted,
        error: deleted ? undefined : 'Failed to delete save'
      };

    } catch (error) {
      console.error('Error deleting save:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete multiple saves
   */
  async deleteBatch(saveIds: string[]): Promise<BatchDeleteResult> {
    try {
      if (saveIds.length === 0) {
        return {
          success: true,
          deletedCount: 0,
          errors: []
        };
      }

      // Validate all saves exist
      const existingIds: string[] = [];
      const missingIds: string[] = [];

      for (const saveId of saveIds) {
        const exists = await this.gameSaveRepository.exists(saveId);
        if (exists) {
          existingIds.push(saveId);
        } else {
          missingIds.push(saveId);
        }
      }

      // Delete existing saves
      const deleted = await this.gameSaveRepository.deleteBatch(existingIds);

      const errors = missingIds.map(id => `Save ${id} not found`);
      if (!deleted && existingIds.length > 0) {
        errors.push('Failed to delete some saves');
      }

      return {
        success: deleted && missingIds.length === 0,
        deletedCount: deleted ? existingIds.length : 0,
        errors
      };

    } catch (error) {
      console.error('Error in batch delete:', error);
      return {
        success: false,
        deletedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Rename a saved game
   */
  async renameSave(saveId: string, newName: string): Promise<RenameResult> {
    try {
      // Validate new name
      if (!newName || newName.trim().length === 0) {
        return {
          success: false,
          error: 'Name cannot be empty'
        };
      }

      if (newName.length > 50) {
        return {
          success: false,
          error: 'Name too long (max 50 characters)'
        };
      }

      // Check if save exists
      const exists = await this.gameSaveRepository.exists(saveId);
      if (!exists) {
        return {
          success: false,
          error: 'Save not found'
        };
      }

      // Check if name is already used (optional)
      const existingWithName = await this.gameSaveRepository.findNamedSaves();
      const nameConflict = existingWithName.some(save =>
        save.name.toLowerCase() === newName.trim().toLowerCase() && save.id !== saveId
      );

      if (nameConflict) {
        return {
          success: false,
          error: 'A save with this name already exists'
        };
      }

      const renamed = await this.gameSaveRepository.renameNamed(saveId, newName.trim());

      return {
        success: renamed,
        error: renamed ? undefined : 'Failed to rename save'
      };

    } catch (error) {
      console.error('Error renaming save:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Duplicate a saved game
   */
  async duplicateSave(saveId: string, newName?: string): Promise<SaveOperationResult> {
    try {
      // Check if original save exists
      const exists = await this.gameSaveRepository.exists(saveId);
      if (!exists) {
        return {
          success: false,
          error: 'Original save not found'
        };
      }

      // Generate name if not provided
      const finalName = newName || `Copy of ${saveId}`;

      // Validate name
      if (finalName.length > 50) {
        return {
          success: false,
          error: 'Name too long (max 50 characters)'
        };
      }

      return await this.gameSaveRepository.duplicateNamed(saveId, finalName);

    } catch (error) {
      console.error('Error duplicating save:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Export saves to JSON format
   */
  async exportSaves(saveIds: string[]): Promise<ExportResult> {
    try {
      if (saveIds.length === 0) {
        return {
          success: false,
          error: 'No saves to export'
        };
      }

      // Validate all saves exist
      const validIds: string[] = [];
      for (const saveId of saveIds) {
        const exists = await this.gameSaveRepository.exists(saveId);
        if (exists) {
          validIds.push(saveId);
        }
      }

      if (validIds.length === 0) {
        return {
          success: false,
          error: 'No valid saves found'
        };
      }

      const exportData = await this.gameSaveRepository.exportSaves(validIds);

      return {
        success: true,
        exportData,
        exportedCount: validIds.length
      };

    } catch (error) {
      console.error('Error exporting saves:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Import saves from JSON format
   */
  async importSaves(jsonData: string): Promise<ImportResult> {
    try {
      // Validate JSON
      let importData;
      try {
        importData = JSON.parse(jsonData);
      } catch {
        return {
          success: false,
          importedCount: 0,
          failedCount: 0,
          errors: ['Invalid JSON format']
        };
      }

      // Validate structure
      if (!importData.saves || !Array.isArray(importData.saves)) {
        return {
          success: false,
          importedCount: 0,
          failedCount: 0,
          errors: ['Invalid export file format']
        };
      }

      const results = await this.gameSaveRepository.importSaves(jsonData);

      const successful = results.filter((r: SaveOperationResult) => r.success);
      const failed = results.filter((r: SaveOperationResult) => !r.success);

      return {
        success: failed.length === 0,
        importedCount: successful.length,
        failedCount: failed.length,
        errors: failed.map((r: SaveOperationResult) => r.error || 'Unknown error')
      };

    } catch (error) {
      console.error('Error importing saves:', error);
      return {
        success: false,
        importedCount: 0,
        failedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Clean up old saves (auto-saves and completed games)
   */
  async cleanupOldSaves(options: CleanupOptions): Promise<CleanupResult> {
    try {
      let deletedCount = 0;
      const errors: string[] = [];

      // Clean up old auto-saves
      if (options.autoSaveDays) {
        try {
          const autoSaveDeleted = await this.gameSaveRepository.cleanupOldAutoSaves(options.autoSaveDays);
          deletedCount += autoSaveDeleted;
        } catch (error) {
          errors.push(`Auto-save cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Clean up old completed games
      if (options.completedGamesDays) {
        try {
          const completedSaves = await this.gameSaveRepository.findCompleted();
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - options.completedGamesDays);

          const oldCompleted = completedSaves.filter(save =>
            save.lastModified < cutoffDate && save.isAutoSave
          );

          if (oldCompleted.length > 0) {
            const oldIds = oldCompleted.map(save => save.id);
            const deleted = await this.gameSaveRepository.deleteBatch(oldIds);
            if (deleted) {
              deletedCount += oldCompleted.length;
            } else {
              errors.push('Failed to delete old completed games');
            }
          }
        } catch (error) {
          errors.push(`Completed games cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return {
        success: errors.length === 0,
        deletedCount,
        errors
      };

    } catch (error) {
      console.error('Error in cleanup:', error);
      return {
        success: false,
        deletedCount: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<StorageStats> {
    try {
      const [
        totalSaves,
        namedSaves,
        autoSaves,
        totalStorage
      ] = await Promise.all([
        this.gameSaveRepository.getTotalSavesCount(),
        this.gameSaveRepository.getNamedSavesCount(),
        this.gameSaveRepository.getAutoSavesCount(),
        this.gameSaveRepository.getTotalStorageUsed()
      ]);

      return {
        totalSaves,
        namedSaves,
        autoSaves,
        totalStorageBytes: totalStorage,
        totalStorageMB: Math.round(totalStorage / (1024 * 1024) * 100) / 100
      };

    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {
        totalSaves: 0,
        namedSaves: 0,
        autoSaves: 0,
        totalStorageBytes: 0,
        totalStorageMB: 0
      };
    }
  }

  /**
   * Validate save integrity
   */
  async validateSaveIntegrity(saveId: string): Promise<ValidationResult> {
    try {
      const isValid = await this.gameSaveRepository.validateSaveIntegrity(saveId);

      return {
        success: true,
        isValid,
        error: isValid ? undefined : 'Save integrity check failed'
      };

    } catch (error) {
      console.error('Error validating save integrity:', error);
      return {
        success: false,
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Repair corrupted save
   */
  async repairSave(saveId: string): Promise<RepairResult> {
    try {
      const repaired = await this.gameSaveRepository.repairCorruptedSave(saveId);

      return {
        success: repaired,
        error: repaired ? undefined : 'Failed to repair save'
      };

    } catch (error) {
      console.error('Error repairing save:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Optimize database storage
   */
  async optimizeStorage(): Promise<OptimizationResult> {
    try {
      await this.gameSaveRepository.vacuum();

      return {
        success: true
      };

    } catch (error) {
      console.error('Error optimizing storage:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Supporting types

export interface DeleteResult {
  success: boolean;
  error?: string;
}

export interface BatchDeleteResult {
  success: boolean;
  deletedCount: number;
  errors: string[];
}

export interface RenameResult {
  success: boolean;
  error?: string;
}

export interface ExportResult {
  success: boolean;
  exportData?: string;
  exportedCount?: number;
  error?: string;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  failedCount: number;
  errors: string[];
}

export interface CleanupOptions {
  autoSaveDays?: number; // Delete auto-saves older than X days
  completedGamesDays?: number; // Delete completed games older than X days
}

export interface CleanupResult {
  success: boolean;
  deletedCount: number;
  errors: string[];
}

export interface StorageStats {
  totalSaves: number;
  namedSaves: number;
  autoSaves: number;
  totalStorageBytes: number;
  totalStorageMB: number;
}

export interface ValidationResult {
  success: boolean;
  isValid: boolean;
  error?: string;
}

export interface RepairResult {
  success: boolean;
  error?: string;
}

export interface OptimizationResult {
  success: boolean;
  error?: string;
}