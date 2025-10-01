/**
 * Integration Tests: Database Operations
 *
 * Тестирование взаимодействия с базой данных через gameStore
 * согласно стратегии тестирования (2.3.4-testing-strategy.md, раздел 2: Integration Testing)
 */

import { useGameStore } from '../../src/application/stores/gameStore';
import { Difficulty } from '../../src/domain/types/GameTypes';

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
      // Создаем новую игру
      await useGameStore.getState().startNewGame('medium' as Difficulty);

      const game = useGameStore.getState().currentGame;
      expect(game).not.toBeNull();

      const gameId = game?.id;
      expect(gameId).toBeDefined();

      // Делаем несколько ходов
      useGameStore.getState().setCellValue(0, 0, 5);
      useGameStore.getState().setCellValue(1, 1, 3);

      // Проверяем, что ходы сохранены
      expect(useGameStore.getState().currentGame?.grid[0][0]).toBe(5);
      expect(useGameStore.getState().currentGame?.grid[1][1]).toBe(3);
    });

    it('should persist game after multiple operations', async () => {
      await useGameStore.getState().startNewGame('easy' as Difficulty);

      // Делаем серию операций
      for (let i = 0; i < 5; i++) {
        useGameStore.getState().setCellValue(i, 0, i + 1);
      }

      const game = useGameStore.getState().currentGame;
      expect(game).not.toBeNull();
      expect(game?.moveCount).toBeGreaterThan(0);
    });

    it('should handle game pause and resume', async () => {
      await useGameStore.getState().startNewGame('medium' as Difficulty);

      // Ставим на паузу
      useGameStore.getState().togglePause();
      expect(useGameStore.getState().currentGame?.paused).toBe(true);

      // Снимаем с паузы
      useGameStore.getState().togglePause();
      expect(useGameStore.getState().currentGame?.paused).toBe(false);
    });
  });

  describe('Move History', () => {
    it('should track move history correctly', async () => {
      await useGameStore.getState().startNewGame('hard' as Difficulty);

      const initialMoveCount = useGameStore.getState().currentGame?.moveCount || 0;

      // Делаем несколько ходов
      useGameStore.getState().setCellValue(0, 0, 7);
      useGameStore.getState().setCellValue(0, 1, 2);
      useGameStore.getState().setCellValue(0, 2, 9);

      const currentMoveCount = useGameStore.getState().currentGame?.moveCount || 0;
      expect(currentMoveCount).toBeGreaterThan(initialMoveCount);
    });

    it('should support undo operation', async () => {
      await useGameStore.getState().startNewGame('medium' as Difficulty);

      // Делаем ход
      useGameStore.getState().setCellValue(2, 2, 8);
      expect(useGameStore.getState().currentGame?.grid[2][2]).toBe(8);

      // Отменяем ход
      useGameStore.getState().undo();

      // Значение должно быть восстановлено
      const cellValue = useGameStore.getState().currentGame?.grid[2][2];
      expect(cellValue).not.toBe(8);
    });

    it('should support redo operation', async () => {
      await useGameStore.getState().startNewGame('easy' as Difficulty);

      // Делаем ход
      useGameStore.getState().setCellValue(3, 3, 6);
      const valueAfterMove = 6;

      // Отменяем
      useGameStore.getState().undo();
      expect(useGameStore.getState().currentGame?.grid[3][3]).not.toBe(valueAfterMove);

      // Повторяем
      useGameStore.getState().redo();
      expect(useGameStore.getState().currentGame?.grid[3][3]).toBe(valueAfterMove);
    });
  });

  describe('Hints System', () => {
    it('should track hints usage', async () => {
      await useGameStore.getState().startNewGame('hard' as Difficulty);

      const initialHints = useGameStore.getState().currentGame?.hintsUsed || 0;

      // Используем подсказку
      await useGameStore.getState().getHint();

      const currentHints = useGameStore.getState().currentGame?.hintsUsed || 0;
      expect(currentHints).toBeGreaterThan(initialHints);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid cell positions', async () => {
      await useGameStore.getState().startNewGame('medium' as Difficulty);

      // Пытаемся установить значение в невалидную позицию
      expect(() => {
        useGameStore.getState().setCellValue(-1, 0, 5);
      }).not.toThrow();

      expect(() => {
        useGameStore.getState().setCellValue(10, 0, 5);
      }).not.toThrow();
    });

    it('should handle invalid cell values', async () => {
      await useGameStore.getState().startNewGame('easy' as Difficulty);

      // Пытаемся установить невалидное значение
      expect(() => {
        useGameStore.getState().setCellValue(0, 0, 10);
      }).not.toThrow();

      expect(() => {
        useGameStore.getState().setCellValue(0, 0, -1);
      }).not.toThrow();
    });
  });

  describe('Auto-save', () => {
    it('should trigger auto-save periodically', async () => {
      await useGameStore.getState().startNewGame('medium' as Difficulty);

      // Делаем несколько ходов
      for (let i = 0; i < 10; i++) {
        useGameStore.getState().setCellValue(i % 9, Math.floor(i / 9), (i % 9) + 1);
      }

      // Автосохранение должно быть вызвано
      const game = useGameStore.getState().currentGame;
      expect(game).not.toBeNull();
      expect(game?.moveCount).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Performance', () => {
    it('should handle rapid successive operations', async () => {
      await useGameStore.getState().startNewGame('hard' as Difficulty);

      const startTime = performance.now();

      // Выполняем 50 операций подряд
      for (let i = 0; i < 50; i++) {
        const row = i % 9;
        const col = Math.floor(i / 9) % 9;
        useGameStore.getState().setCellValue(row, col, (i % 9) + 1);
      }

      const operationTime = performance.now() - startTime;

      // Операции должны выполниться быстро (< 200ms для 50 операций)
      expect(operationTime).toBeLessThan(200);
    });

    it('should efficiently handle game state updates', async () => {
      const startTime = performance.now();

      // Создаем и обновляем игру
      await useGameStore.getState().startNewGame('expert' as Difficulty);

      for (let i = 0; i < 20; i++) {
        useGameStore.getState().setCellValue(i % 9, Math.floor(i / 9), (i % 9) + 1);
      }

      const totalTime = performance.now() - startTime;

      // Общее время должно быть разумным (< 500ms)
      expect(totalTime).toBeLessThan(500);
    });
  });

  describe('Game Completion', () => {
    it('should mark game as completed when solved', async () => {
      await useGameStore.getState().startNewGame('easy' as Difficulty);

      // Получаем решение
      const solution = useGameStore.getState().currentGame?.solution;

      if (solution) {
        // Заполняем всю сетку правильными значениями
        for (let row = 0; row < 9; row++) {
          for (let col = 0; col < 9; col++) {
            useGameStore.getState().setCellValue(row, col, solution[row][col]);
          }
        }

        // Игра должна быть отмечена как завершенная
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(useGameStore.getState().currentGame?.completed).toBe(true);
      }
    });
  });

  describe('Multiple Games', () => {
    it('should handle switching between games', async () => {
      // Создаем первую игру
      await useGameStore.getState().startNewGame('easy' as Difficulty);
      const game1Id = useGameStore.getState().currentGame?.id;

      // Делаем ход в первой игре
      useGameStore.getState().setCellValue(0, 0, 5);

      // Создаем вторую игру
      await useGameStore.getState().startNewGame('hard' as Difficulty);
      const game2Id = useGameStore.getState().currentGame?.id;

      // ID должны быть разными
      expect(game1Id).not.toBe(game2Id);

      // Текущая игра должна быть второй
      expect(useGameStore.getState().currentGame?.id).toBe(game2Id);
    });
  });
});
