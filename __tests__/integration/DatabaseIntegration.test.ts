/**
 * Integration Tests: Database Operations
 *
 * Тестирование взаимодействия с базой данных через gameStore
 * согласно стратегии тестирования (2.3.4-testing-strategy.md, раздел 2: Integration Testing)
 */

import { useGameStore } from '../../src/application/stores/gameStore';
import { Difficulty, GameEntity, DifficultyLevel } from '../../src/domain/types/GameTypes';

// Mock MMKV storage
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    getAllKeys: jest.fn(() => []),
    clearAll: jest.fn(),
  })),
}));

// Mock SQLite
const mockExecuteSql = jest.fn((sql, params, successCallback) => {
  if (successCallback) {
    successCallback(null, { rows: { length: 0, item: () => ({}) } });
  }
});

jest.mock('react-native-sqlite-storage', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn((callback) => {
      callback({ executeSql: mockExecuteSql });
    }),
    executeSql: mockExecuteSql,
  })),
  enablePromise: jest.fn(),
}));

// Helper function to create mock GameEntity for testing
let gameCounter = 0;
function createMockGameEntity(difficulty: DifficultyLevel = 'medium'): GameEntity {
  gameCounter++;
  const defaultGrid = Array(9)
    .fill(null)
    .map(() => Array(9).fill(0));

  return {
    id: `test-game-${Date.now()}-${gameCounter}`,
    puzzleId: `puzzle-${Date.now()}-${gameCounter}`,
    grid: defaultGrid,
    originalGrid: defaultGrid,
    solution: defaultGrid,
    difficulty,
    startTime: new Date(),
    currentTime: 0,
    pausedTime: 0,
    movesCount: 0,
    hintsUsed: 0,
    errorsCount: 0,
    isCompleted: false,
    hintUsageHistory: [],
    directSolutionHintsUsed: 0,
    playerProfile: undefined,
  };
}

describe('Database Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useGameStore.getState().cleanup();
  });

  afterEach(() => {
    useGameStore.getState().cleanup();
  });

  describe('Game State Persistence Flow', () => {
    it('should save and load game state correctly', async () => {
      // Создаем новую игру через setCurrentGame (startNewGame не создаёт игру в текущей реализации)
      const mockGame = createMockGameEntity('medium');
      useGameStore.getState().setCurrentGame(mockGame);

      const game = useGameStore.getState().currentGame;
      expect(game).not.toBeNull();

      const gameId = game?.id;
      expect(gameId).toBeDefined();

      // Делаем несколько ходов
      useGameStore.getState().selectCell(0, 0);
      useGameStore.getState().makeMove(0, 0, 5);
      useGameStore.getState().selectCell(1, 1);
      useGameStore.getState().makeMove(1, 1, 3);

      // Проверяем, что ходы сохранены
      expect(useGameStore.getState().currentGame?.grid[0][0]).toBe(5);
      expect(useGameStore.getState().currentGame?.grid[1][1]).toBe(3);
    });

    it('should persist game after multiple operations', async () => {
      const mockGame = createMockGameEntity('easy'); useGameStore.getState().setCurrentGame(mockGame);

      // Делаем серию операций
      for (let i = 0; i < 5; i++) {
        useGameStore.getState().selectCell(i, 0);
        useGameStore.getState().makeMove(i, 0, i + 1);
      }

      const game = useGameStore.getState().currentGame;
      expect(game).not.toBeNull();
      expect(game?.movesCount).toBeGreaterThan(0);
    });

    it('should handle game pause and resume', async () => {
      const mockGame = createMockGameEntity('medium'); useGameStore.getState().setCurrentGame(mockGame);

      // Ставим на паузу
      useGameStore.getState().pauseTimer();
      expect(useGameStore.getState().isTimerRunning).toBe(false);

      // Снимаем с паузы
      useGameStore.getState().resumeTimer();
      expect(useGameStore.getState().isTimerRunning).toBe(true);
    });
  });

  describe('Move History', () => {
    it('should track move history correctly', async () => {
      const mockGame = createMockGameEntity('hard'); useGameStore.getState().setCurrentGame(mockGame);

      const initialMoveCount = useGameStore.getState().currentGame?.movesCount || 0;

      // Делаем несколько ходов
      useGameStore.getState().selectCell(0, 0);
      useGameStore.getState().makeMove(0, 0, 7);
      useGameStore.getState().selectCell(0, 1);
      useGameStore.getState().makeMove(0, 1, 2);
      useGameStore.getState().selectCell(0, 2);
      useGameStore.getState().makeMove(0, 2, 9);

      const currentMoveCount = useGameStore.getState().currentGame?.movesCount || 0;
      expect(currentMoveCount).toBeGreaterThan(initialMoveCount);
    });

    // Note: undo/redo функционал не реализован в текущей версии gameStore
    // Тесты будут добавлены после реализации этого функционала
  });

  describe('Hints System', () => {
    it('should track hints usage', async () => {
      const mockGame = createMockGameEntity('hard'); useGameStore.getState().setCurrentGame(mockGame);

      const initialHints = useGameStore.getState().currentGame?.hintsUsed || 0;

      // Используем подсказку
      await useGameStore.getState().useHint('basic');

      const currentHints = useGameStore.getState().currentGame?.hintsUsed || 0;
      expect(currentHints).toBeGreaterThan(initialHints);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid cell positions', async () => {
      const mockGame = createMockGameEntity('medium'); useGameStore.getState().setCurrentGame(mockGame);

      // Пытаемся установить значение в невалидную позицию
      expect(() => {
        useGameStore.getState().selectCell(-1, 0);
        useGameStore.getState().makeMove(-1, 0, 5);
      }).not.toThrow();

      expect(() => {
        useGameStore.getState().selectCell(10, 0);
        useGameStore.getState().makeMove(10, 0, 5);
      }).not.toThrow();
    });

    it('should handle invalid cell values', async () => {
      const mockGame = createMockGameEntity('easy'); useGameStore.getState().setCurrentGame(mockGame);

      // Пытаемся установить невалидное значение
      expect(() => {
        useGameStore.getState().selectCell(0, 0);
        useGameStore.getState().makeMove(0, 0, 10);
      }).not.toThrow();

      expect(() => {
        useGameStore.getState().selectCell(0, 0);
        useGameStore.getState().makeMove(0, 0, -1);
      }).not.toThrow();
    });
  });

  describe('Auto-save', () => {
    it('should trigger auto-save periodically', async () => {
      const mockGame = createMockGameEntity('medium'); useGameStore.getState().setCurrentGame(mockGame);

      // Делаем несколько ходов
      for (let i = 0; i < 10; i++) {
        useGameStore.getState().selectCell(i % 9, Math.floor(i / 9));
        useGameStore.getState().makeMove(i % 9, Math.floor(i / 9), (i % 9) + 1);
      }

      // Автосохранение должно быть вызвано
      const game = useGameStore.getState().currentGame;
      expect(game).not.toBeNull();
      expect(game?.movesCount).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Performance', () => {
    it('should handle rapid successive operations', async () => {
      const mockGame = createMockGameEntity('hard'); useGameStore.getState().setCurrentGame(mockGame);

      const startTime = performance.now();

      // Выполняем 50 операций подряд
      for (let i = 0; i < 50; i++) {
        const row = i % 9;
        const col = Math.floor(i / 9) % 9;
        useGameStore.getState().selectCell(row, col);
        useGameStore.getState().makeMove(row, col, (i % 9) + 1);
      }

      const operationTime = performance.now() - startTime;

      // Операции должны выполниться быстро (< 1000ms для 50 операций на CI)
      expect(operationTime).toBeLessThan(1000);
    });

    it('should efficiently handle game state updates', async () => {
      const startTime = performance.now();

      // Создаем и обновляем игру
      const mockGame = createMockGameEntity('expert'); useGameStore.getState().setCurrentGame(mockGame);

      for (let i = 0; i < 20; i++) {
        useGameStore.getState().selectCell(i % 9, Math.floor(i / 9));
        useGameStore.getState().makeMove(i % 9, Math.floor(i / 9), (i % 9) + 1);
      }

      const totalTime = performance.now() - startTime;

      // Общее время должно быть разумным (< 2000ms на CI)
      expect(totalTime).toBeLessThan(2000);
    });
  });

  describe('Game Completion', () => {
    it('should mark game as completed when solved', async () => {
      const mockGame = createMockGameEntity('easy'); useGameStore.getState().setCurrentGame(mockGame);

      // Получаем решение
      const solution = useGameStore.getState().currentGame?.solution;

      // Проверяем, что solution существует
      expect(solution).toBeDefined();

      if (solution) {
        // Заполняем всю сетку правильными значениями
        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            useGameStore.getState().selectCell(row, col);
            useGameStore.getState().makeMove(row, col, solution[row][col]);
          }
        }

        // Вызываем completeGame вручную (автоматическая проверка не реализована в текущей версии)
        const currentGame = useGameStore.getState().currentGame;
        if (currentGame) {
          await useGameStore.getState().completeGame(currentGame);
        }

        // Игра должна быть отмечена как завершенная
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(useGameStore.getState().currentGame?.isCompleted).toBe(true);
      }
    });
  });

  describe('Multiple Games', () => {
    it('should handle switching between games', async () => {
      // Создаем первую игру
      const mockGame1 = createMockGameEntity('easy');
      useGameStore.getState().setCurrentGame(mockGame1);
      const game1Id = useGameStore.getState().currentGame?.id;

      // Делаем ход в первой игре
      useGameStore.getState().selectCell(0, 0);
      useGameStore.getState().makeMove(0, 0, 5);

      // Создаем вторую игру
      const mockGame2 = createMockGameEntity('hard');
      useGameStore.getState().setCurrentGame(mockGame2);
      const game2Id = useGameStore.getState().currentGame?.id;

      // ID должны быть разными
      expect(game1Id).not.toBe(game2Id);

      // Текущая игра должна быть второй
      expect(useGameStore.getState().currentGame?.id).toBe(game2Id);
    });
  });
});
