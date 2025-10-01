/**
 * SaveGameUseCase and LoadGameUseCase Unit Tests
 * Тесты для use cases сохранения и загрузки игр
 * Согласно стратегии тестирования (2.3.4-testing-strategy.md)
 * Согласно бизнес-анализу (1.4-functional-requirements.md - раздел сохранения)
 */

import { SaveGameUseCase } from '../src/application/usecases/save/SaveGameUseCase';
import { LoadGameUseCase } from '../src/application/usecases/save/LoadGameUseCase';
import {
  GameEntity,
  GameSave,
  IGameSaveRepository,
  SaveSlot,
  SaveOperationResult,
  LoadOperationResult,
} from '../src/domain/types/GameTypes';

// Mock repository implementation
class MockGameSaveRepository implements IGameSaveRepository {
  private saves: Map<string, GameSave> = new Map();
  private namedSaves: Map<string, GameSave> = new Map();
  private autoSaves: GameSave[] = [];

  async save(gameSave: GameSave): Promise<SaveOperationResult> {
    this.saves.set(gameSave.id, gameSave);
    return { success: true, saveId: gameSave.id };
  }

  async saveNamed(gameSave: GameSave, name: string): Promise<SaveOperationResult> {
    const savedGame = { ...gameSave, name };
    this.saves.set(gameSave.id, savedGame);
    this.namedSaves.set(name, savedGame);
    return { success: true, saveId: gameSave.id };
  }

  async autoSave(gameSave: GameSave): Promise<SaveOperationResult> {
    this.autoSaves.push(gameSave);
    this.saves.set(gameSave.id, gameSave);
    return { success: true, saveId: gameSave.id };
  }

  async load(id: string): Promise<LoadOperationResult> {
    const gameData = this.saves.get(id);
    if (!gameData) {
      return { success: false, error: 'Save not found' };
    }
    return { success: true, gameData };
  }

  async loadNamed(name: string): Promise<LoadOperationResult> {
    const gameData = this.namedSaves.get(name);
    if (!gameData) {
      return { success: false, error: 'Named save not found' };
    }
    return { success: true, gameData };
  }

  async delete(id: string): Promise<boolean> {
    // Also remove from autoSaves array if present
    const index = this.autoSaves.findIndex((save) => save.id === id);
    if (index !== -1) {
      this.autoSaves.splice(index, 1);
    }
    return this.saves.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.saves.has(id);
  }

  async renameNamed(saveId: string, newName: string): Promise<boolean> {
    const save = this.saves.get(saveId);
    if (!save || !save.name) return false;
    const oldName = save.name;
    this.namedSaves.delete(oldName);
    save.name = newName;
    this.namedSaves.set(newName, save);
    return true;
  }

  async duplicateNamed(saveId: string, newName: string): Promise<SaveOperationResult> {
    const save = this.saves.get(saveId);
    if (!save) return { success: false, error: 'Save not found' };
    const newSave = { ...save, id: `${saveId}-copy`, name: newName };
    return this.saveNamed(newSave, newName);
  }

  async findAll(): Promise<SaveSlot[]> {
    return Array.from(this.saves.values()).map(this.toSaveSlot);
  }

  async findAllPaginated(limit?: number, offset?: number): Promise<SaveSlot[]> {
    const all = await this.findAll();
    return all.slice(offset || 0, (offset || 0) + (limit || all.length));
  }

  async findByDifficulty(difficulty: string): Promise<SaveSlot[]> {
    return Array.from(this.saves.values())
      .filter((save) => save.difficulty === difficulty)
      .map(this.toSaveSlot);
  }

  async findCompleted(): Promise<SaveSlot[]> {
    return Array.from(this.saves.values())
      .filter((save) => save.isCompleted)
      .map(this.toSaveSlot);
  }

  async findInProgress(): Promise<SaveSlot[]> {
    return Array.from(this.saves.values())
      .filter((save) => !save.isCompleted)
      .map(this.toSaveSlot);
  }

  async findAutoSaves(): Promise<SaveSlot[]> {
    return this.autoSaves.map(this.toSaveSlot);
  }

  async findNamedSaves(): Promise<SaveSlot[]> {
    return Array.from(this.namedSaves.values()).map(this.toSaveSlot);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<SaveSlot[]> {
    return Array.from(this.saves.values())
      .filter((save) => save.lastPlayed >= startDate && save.lastPlayed <= endDate)
      .map(this.toSaveSlot);
  }

  async getLatestAutoSave(): Promise<LoadOperationResult> {
    if (this.autoSaves.length === 0) {
      return { success: false, error: 'No auto-saves found' };
    }
    const latest = this.autoSaves[this.autoSaves.length - 1];
    return { success: true, gameData: latest };
  }

  async cleanupOldAutoSaves(daysToKeep: number = 7): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const originalLength = this.autoSaves.length;
    this.autoSaves = this.autoSaves.filter(
      (save) => save.lastPlayed > cutoffDate
    );
    return originalLength - this.autoSaves.length;
  }

  async getTotalSavesCount(): Promise<number> {
    return this.saves.size;
  }

  async getAutoSavesCount(): Promise<number> {
    return this.autoSaves.length;
  }

  async getNamedSavesCount(): Promise<number> {
    return this.namedSaves.size;
  }

  async getSaveSize(_saveId: string): Promise<number> {
    return 1024; // Mock size in bytes
  }

  async getTotalStorageUsed(): Promise<number> {
    return this.saves.size * 1024; // Mock total storage
  }

  async deleteBatch(saveIds: string[]): Promise<boolean> {
    saveIds.forEach((id) => this.saves.delete(id));
    return true;
  }

  async exportSaves(saveIds: string[]): Promise<string> {
    const saves = saveIds.map((id) => this.saves.get(id)).filter(Boolean);
    return JSON.stringify(saves);
  }

  async importSaves(jsonData: string): Promise<SaveOperationResult[]> {
    const saves = JSON.parse(jsonData) as GameSave[];
    return Promise.all(saves.map((save) => this.save(save)));
  }

  async vacuum(): Promise<void> {
    // Mock vacuum operation
  }

  async validateSaveIntegrity(saveId: string): Promise<boolean> {
    return this.saves.has(saveId);
  }

  async repairCorruptedSave(_saveId: string): Promise<boolean> {
    return false; // Mock repair
  }

  private toSaveSlot(gameSave: GameSave): SaveSlot {
    return {
      id: gameSave.id,
      name: gameSave.name || `Game ${gameSave.difficulty}`,
      gameId: gameSave.id,
      createdAt: gameSave.startTime,
      lastModified: gameSave.lastPlayed,
      thumbnail: undefined,
      isAutoSave: false,
    };
  }
}

// Helper function to create mock GameEntity
function createMockGameEntity(overrides?: Partial<GameEntity>): GameEntity {
  const defaultGrid = Array(9)
    .fill(null)
    .map(() => Array(9).fill(0));

  return {
    id: 'test-game-1',
    puzzleId: 'puzzle-1',
    grid: defaultGrid,
    originalGrid: defaultGrid,
    solution: defaultGrid,
    difficulty: 'medium',
    startTime: new Date(),
    currentTime: 300,
    pausedTime: 0,
    movesCount: 10,
    hintsUsed: 1,
    errorsCount: 0,
    isCompleted: false,
    hintUsageHistory: [],
    directSolutionHintsUsed: 0,
    playerProfile: undefined,
    ...overrides,
  };
}

describe('SaveGameUseCase', () => {
  let saveGameUseCase: SaveGameUseCase;
  let mockRepository: MockGameSaveRepository;

  beforeEach(() => {
    mockRepository = new MockGameSaveRepository();
    saveGameUseCase = new SaveGameUseCase(mockRepository);
  });

  describe('execute', () => {
    test('should save game successfully', async () => {
      const gameEntity = createMockGameEntity();

      const result = await saveGameUseCase.execute(gameEntity);

      expect(result.success).toBe(true);
      expect(result.saveId).toBe(gameEntity.id);
    });

    test('should save named game when name provided', async () => {
      const gameEntity = createMockGameEntity();
      const saveName = 'My Progress';

      const result = await saveGameUseCase.execute(gameEntity, { name: saveName });

      expect(result.success).toBe(true);
      const namedSaves = await mockRepository.findNamedSaves();
      expect(namedSaves.length).toBe(1);
    });

    test('should handle save errors gracefully', async () => {
      const gameEntity = createMockGameEntity();

      // Mock repository error
      jest.spyOn(mockRepository, 'save').mockRejectedValueOnce(new Error('Storage full'));

      const result = await saveGameUseCase.execute(gameEntity);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Storage full');
    });
  });

  describe('autoSave', () => {
    test('should perform auto-save successfully', async () => {
      const gameEntity = createMockGameEntity();

      const result = await saveGameUseCase.autoSave(gameEntity);

      expect(result.success).toBe(true);
      const autoSaves = await mockRepository.findAutoSaves();
      expect(autoSaves.length).toBe(1);
    });

    test('should limit auto-saves to maximum count', async () => {
      // Create 15 auto-saves (exceeds limit of 10)
      for (let i = 0; i < 15; i++) {
        await saveGameUseCase.autoSave(
          createMockGameEntity({ id: `game-${i}` })
        );
      }

      const autoSavesCount = await mockRepository.getAutoSavesCount();

      // Should be limited to 10 according to business requirements
      expect(autoSavesCount).toBeLessThanOrEqual(10);
    });

    test('should cleanup old auto-saves', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 days ago

      // Create old auto-save
      await mockRepository.autoSave({
        ...createMockGameEntity(),
        lastPlayed: oldDate,
      } as any);

      // Create new auto-save
      await saveGameUseCase.autoSave(createMockGameEntity({ id: 'new-game' }));

      // Old auto-saves (> 7 days) should be cleaned up
      const autoSavesCount = await mockRepository.getAutoSavesCount();
      expect(autoSavesCount).toBe(1);
    });
  });

  describe('saveWithName', () => {
    test('should save game with custom name', async () => {
      const gameEntity = createMockGameEntity();
      const saveName = 'Expert Challenge';

      const result = await saveGameUseCase.saveWithName(gameEntity, saveName);

      expect(result.success).toBe(true);
      const namedSaves = await mockRepository.findNamedSaves();
      expect(namedSaves.length).toBe(1);
    });

    test('should reject empty save name', async () => {
      const gameEntity = createMockGameEntity();

      const result = await saveGameUseCase.saveWithName(gameEntity, '');

      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    test('should reject save name longer than 50 characters', async () => {
      const gameEntity = createMockGameEntity();
      const longName = 'A'.repeat(51);

      const result = await saveGameUseCase.saveWithName(gameEntity, longName);

      expect(result.success).toBe(false);
      expect(result.error).toContain('too long');
    });

    test('should enforce maximum named saves limit (20)', async () => {
      // Create 20 named saves
      for (let i = 0; i < 20; i++) {
        await saveGameUseCase.saveWithName(
          createMockGameEntity({ id: `game-${i}` }),
          `Save ${i}`
        );
      }

      // Attempt to create 21st save
      const result = await saveGameUseCase.saveWithName(
        createMockGameEntity({ id: 'game-21' }),
        'Save 21'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Maximum number of named saves reached');
    });

    test('should trim whitespace from save name', async () => {
      const gameEntity = createMockGameEntity();
      const result = await saveGameUseCase.saveWithName(gameEntity, '  Test Save  ');

      expect(result.success).toBe(true);
    });
  });

  describe('quickSave', () => {
    test('should create quick save with auto-generated name', async () => {
      const gameEntity = createMockGameEntity({ difficulty: 'hard' });

      const result = await saveGameUseCase.quickSave(gameEntity);

      expect(result.success).toBe(true);
      const saves = await mockRepository.findNamedSaves();
      expect(saves[0].name).toContain('Quick Save');
      expect(saves[0].name).toContain('hard');
    });
  });

  describe('validateGameForSave', () => {
    test('should validate valid game', async () => {
      const gameEntity = createMockGameEntity();

      const validation = await saveGameUseCase.validateGameForSave(gameEntity);

      expect(validation.valid).toBe(true);
    });

    test('should reject game without ID', async () => {
      const gameEntity = createMockGameEntity({ id: '' });

      const validation = await saveGameUseCase.validateGameForSave(gameEntity);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('ID');
    });

    test('should reject game with invalid grid dimensions', async () => {
      const invalidGrid = Array(8).fill([]);
      const gameEntity = createMockGameEntity({ grid: invalidGrid as any });

      const validation = await saveGameUseCase.validateGameForSave(gameEntity);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('dimensions');
    });

    test('should reject game with invalid cell values', async () => {
      const invalidGrid = Array(9)
        .fill(null)
        .map(() => Array(9).fill(10)); // Invalid values (should be 0-9)

      const gameEntity = createMockGameEntity({ grid: invalidGrid });

      const validation = await saveGameUseCase.validateGameForSave(gameEntity);

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('Invalid grid values');
    });
  });

  describe('getSaveRecommendations', () => {
    test('should recommend auto-save for long games', async () => {
      const gameEntity = createMockGameEntity({ currentTime: 400 }); // > 5 minutes

      const recommendations = await saveGameUseCase.getSaveRecommendations(gameEntity);

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations.some((r) => r.type === 'auto_save')).toBe(true);
    });

    test('should recommend named save for good progress', async () => {
      const gameEntity = createMockGameEntity({
        currentTime: 700, // > 10 minutes
        hintsUsed: 1, // < 3 hints
      });

      const recommendations = await saveGameUseCase.getSaveRecommendations(gameEntity);

      expect(recommendations.some((r) => r.type === 'named_save')).toBe(true);
    });

    test('should recommend completion save for completed games', async () => {
      const gameEntity = createMockGameEntity({ isCompleted: true });

      const recommendations = await saveGameUseCase.getSaveRecommendations(gameEntity);

      expect(recommendations.some((r) => r.type === 'completion_save')).toBe(true);
      expect(recommendations.find((r) => r.type === 'completion_save')?.priority).toBe('high');
    });
  });
});

describe('LoadGameUseCase', () => {
  let loadGameUseCase: LoadGameUseCase;
  let saveGameUseCase: SaveGameUseCase;
  let mockRepository: MockGameSaveRepository;

  beforeEach(() => {
    mockRepository = new MockGameSaveRepository();
    loadGameUseCase = new LoadGameUseCase(mockRepository);
    saveGameUseCase = new SaveGameUseCase(mockRepository);
  });

  describe('execute', () => {
    test('should load saved game successfully', async () => {
      const gameEntity = createMockGameEntity();
      await saveGameUseCase.execute(gameEntity);

      const result = await loadGameUseCase.execute(gameEntity.id);

      expect(result.success).toBe(true);
      expect(result.gameEntity).toBeDefined();
      expect(result.gameEntity?.id).toBe(gameEntity.id);
    });

    test('should return error for non-existent save', async () => {
      const result = await loadGameUseCase.execute('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should preserve game state after load', async () => {
      const gameEntity = createMockGameEntity({
        currentTime: 500,
        hintsUsed: 3,
        errorsCount: 2,
        movesCount: 25,
      });

      await saveGameUseCase.execute(gameEntity);
      const result = await loadGameUseCase.execute(gameEntity.id);

      expect(result.gameEntity?.currentTime).toBe(500);
      expect(result.gameEntity?.hintsUsed).toBe(3);
      expect(result.gameEntity?.errorsCount).toBe(2);
      expect(result.gameEntity?.movesCount).toBe(25);
    });
  });

  describe('loadByName', () => {
    test('should load game by name', async () => {
      const gameEntity = createMockGameEntity();
      const saveName = 'My Progress';
      await saveGameUseCase.saveWithName(gameEntity, saveName);

      const result = await loadGameUseCase.loadByName(saveName);

      expect(result.success).toBe(true);
      expect(result.saveMetadata?.saveName).toBe(saveName);
    });

    test('should return error for non-existent named save', async () => {
      const result = await loadGameUseCase.loadByName('Non-existent');

      expect(result.success).toBe(false);
    });
  });

  describe('loadLatestAutoSave', () => {
    test('should load latest auto-save', async () => {
      const game1 = createMockGameEntity({ id: 'game-1' });
      const game2 = createMockGameEntity({ id: 'game-2' });

      await saveGameUseCase.autoSave(game1);
      await saveGameUseCase.autoSave(game2);

      const result = await loadGameUseCase.loadLatestAutoSave();

      expect(result.success).toBe(true);
      expect(result.gameEntity?.id).toBe('game-2'); // Latest
    });

    test('should return error when no auto-saves exist', async () => {
      const result = await loadGameUseCase.loadLatestAutoSave();

      expect(result.success).toBe(false);
      expect(result.error).toContain('No auto-save');
    });
  });

  describe('getAvailableSaves', () => {
    beforeEach(async () => {
      // Create test saves
      await saveGameUseCase.execute(createMockGameEntity({ id: '1', difficulty: 'easy' }));
      await saveGameUseCase.execute(createMockGameEntity({ id: '2', difficulty: 'hard' }));
      await saveGameUseCase.execute(createMockGameEntity({ id: '3', difficulty: 'medium', isCompleted: true }));
    });

    test('should get all saves without filter', async () => {
      const saves = await loadGameUseCase.getAvailableSaves();

      expect(saves.length).toBe(3);
    });

    test('should filter by difficulty', async () => {
      const saves = await loadGameUseCase.getAvailableSaves({ difficulty: 'easy' });

      expect(saves.length).toBe(1);
    });

    test('should filter by completion status', async () => {
      const saves = await loadGameUseCase.getAvailableSaves({ status: 'completed' });

      expect(saves.length).toBe(1);
    });

    test('should filter in-progress games', async () => {
      const saves = await loadGameUseCase.getAvailableSaves({ status: 'in_progress' });

      expect(saves.length).toBe(2);
    });

    test('should limit results', async () => {
      const saves = await loadGameUseCase.getAvailableSaves({ limit: 2 });

      expect(saves.length).toBe(2);
    });
  });

  describe('getContinueGameRecommendations', () => {
    test('should recommend recently played games first', async () => {
      const recentGame = createMockGameEntity({ id: 'recent' });
      await saveGameUseCase.execute(recentGame);

      const recommendations = await loadGameUseCase.getContinueGameRecommendations();

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0].priority).toBe('high');
    });

    test('should include auto-saves in recommendations', async () => {
      await saveGameUseCase.autoSave(createMockGameEntity());

      const recommendations = await loadGameUseCase.getContinueGameRecommendations();

      expect(recommendations.length).toBeGreaterThan(0);
    });

    test('should sort recommendations by priority', async () => {
      await saveGameUseCase.execute(createMockGameEntity({ id: '1' }));
      await saveGameUseCase.execute(createMockGameEntity({ id: '2' }));

      const recommendations = await loadGameUseCase.getContinueGameRecommendations();

      // Check that priorities are in descending order
      for (let i = 0; i < recommendations.length - 1; i++) {
        const current = recommendations[i].priority;
        const next = recommendations[i + 1].priority;
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        expect(priorityOrder[current]).toBeGreaterThanOrEqual(priorityOrder[next]);
      }
    });
  });

  describe('quickContinue', () => {
    test('should load most recent game', async () => {
      const game1 = createMockGameEntity({ id: 'game-1' });
      const game2 = createMockGameEntity({ id: 'game-2' });

      await saveGameUseCase.execute(game1);
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 10)); // Small delay
      await saveGameUseCase.execute(game2);

      const result = await loadGameUseCase.quickContinue();

      expect(result.success).toBe(true);
      expect(result.gameEntity?.id).toBe('game-2');
    });

    test('should return error when no games available', async () => {
      const result = await loadGameUseCase.quickContinue();

      expect(result.success).toBe(false);
      expect(result.error).toContain('No games available');
    });
  });

  describe('Integration: Save and Load', () => {
    test('should preserve grid state through save/load cycle', async () => {
      const testGrid = Array(9)
        .fill(null)
        .map((_, i) => Array(9).fill(i + 1));

      const gameEntity = createMockGameEntity({ grid: testGrid });
      await saveGameUseCase.execute(gameEntity);

      const result = await loadGameUseCase.execute(gameEntity.id);

      expect(result.gameEntity?.grid).toEqual(testGrid);
    });

    test('should handle multiple save/load cycles', async () => {
      const gameEntity = createMockGameEntity();

      for (let i = 0; i < 5; i++) {
        gameEntity.movesCount = i * 10;
        await saveGameUseCase.execute(gameEntity);

        const loadResult = await loadGameUseCase.execute(gameEntity.id);
        expect(loadResult.gameEntity?.movesCount).toBe(i * 10);
      }
    });
  });
});
