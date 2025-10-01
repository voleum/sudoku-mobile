/**
 * GameStore Unit Tests
 * Тесты для Zustand store управления игровым состоянием
 * Согласно стратегии тестирования (2.3.4-testing-strategy.md)
 */

import { renderHook, act } from '@testing-library/react-native';
import { useGameStore } from '../src/application/stores/gameStore';

// Mock dependencies
jest.mock('../src/infrastructure/storage/DatabaseManager');
jest.mock('../src/infrastructure/repositories/SQLiteGameSaveRepository');

describe('GameStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.cleanup();
    });
  });

  afterEach(() => {
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.cleanup();
    });
  });

  describe('Initial State', () => {
    test('should have correct initial state', () => {
      const { result } = renderHook(() => useGameStore());

      expect(result.current.currentGame).toBeNull();
      expect(result.current.selectedCell).toBeNull();
      expect(result.current.currentHint).toBeNull();
      expect(result.current.isHintActive).toBe(false);
      expect(result.current.isTimerRunning).toBe(false);
      expect(result.current.availableSaves).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    test('should have default save settings', () => {
      const { result } = renderHook(() => useGameStore());

      expect(result.current.saveSettings).toMatchObject({
        autoSaveEnabled: true,
        autoSaveInterval: 30,
        maxNamedSaves: 20,
        autoDeleteOldSaves: true,
        maxAutoSaves: 10,
      });
    });

    test('should have session tracking initialized', () => {
      const { result } = renderHook(() => useGameStore());

      expect(result.current.sessionStartTime).toBeDefined();
      expect(result.current.totalGamesCompleted).toBe(0);
      expect(result.current.currentStreak).toBe(0);
      expect(result.current.consecutiveDaysPlayed).toBe(0);
    });
  });

  describe('Cell Selection', () => {
    test('should select cell correctly', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.selectCell(3, 5);
      });

      expect(result.current.selectedCell).toMatchObject({
        row: 3,
        col: 5,
      });
    });

    test('should update selected cell when selecting different cell', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.selectCell(0, 0);
      });

      expect(result.current.selectedCell?.row).toBe(0);
      expect(result.current.selectedCell?.col).toBe(0);

      act(() => {
        result.current.selectCell(5, 5);
      });

      expect(result.current.selectedCell?.row).toBe(5);
      expect(result.current.selectedCell?.col).toBe(5);
    });
  });

  describe('Hint System', () => {
    test('should clear hint correctly', () => {
      const { result } = renderHook(() => useGameStore());

      // Set up a hint state first
      act(() => {
        result.current.clearHint();
      });

      expect(result.current.currentHint).toBeNull();
      expect(result.current.isHintActive).toBe(false);
    });

    test('should clear hint when starting new game', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startNewGame('medium');
      });

      expect(result.current.currentHint).toBeNull();
      expect(result.current.isHintActive).toBe(false);
    });
  });

  describe('Timer Management', () => {
    test('should start timer', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startTimer();
      });

      expect(result.current.isTimerRunning).toBe(true);
      expect(result.current.pauseStartTime).toBeUndefined();
    });

    test('should pause timer', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startTimer();
      });

      expect(result.current.isTimerRunning).toBe(true);

      act(() => {
        result.current.pauseTimer();
      });

      expect(result.current.isTimerRunning).toBe(false);
      expect(result.current.pauseStartTime).toBeDefined();
    });

    test('should resume timer after pause', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startTimer();
        result.current.pauseTimer();
      });

      expect(result.current.isTimerRunning).toBe(false);

      act(() => {
        result.current.resumeTimer();
      });

      expect(result.current.isTimerRunning).toBe(true);
      expect(result.current.pauseStartTime).toBeUndefined();
    });

    test('should stop timer and clear interval', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startTimer();
      });

      expect(result.current.isTimerRunning).toBe(true);

      act(() => {
        result.current.stopTimer();
      });

      expect(result.current.isTimerRunning).toBe(false);
      expect(result.current.gameTimerInterval).toBeUndefined();
      expect(result.current.pauseStartTime).toBeUndefined();
    });

    test('should handle multiple pause/resume cycles', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startTimer();
      });

      for (let i = 0; i < 3; i++) {
        act(() => {
          result.current.pauseTimer();
        });
        expect(result.current.isTimerRunning).toBe(false);

        act(() => {
          result.current.resumeTimer();
        });
        expect(result.current.isTimerRunning).toBe(true);
      }
    });
  });

  describe('Save Settings', () => {
    test('should update save settings partially', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.updateSaveSettings({
          autoSaveInterval: 60,
        });
      });

      expect(result.current.saveSettings.autoSaveInterval).toBe(60);
      expect(result.current.saveSettings.autoSaveEnabled).toBe(true); // Should remain unchanged
    });

    test('should update multiple save settings at once', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.updateSaveSettings({
          autoSaveEnabled: false,
          autoSaveInterval: 120,
          maxNamedSaves: 15,
        });
      });

      expect(result.current.saveSettings.autoSaveEnabled).toBe(false);
      expect(result.current.saveSettings.autoSaveInterval).toBe(120);
      expect(result.current.saveSettings.maxNamedSaves).toBe(15);
    });
  });

  describe('Auto-Save', () => {
    test('should enable auto-save with default interval', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.enableAutoSave();
      });

      expect(result.current.autoSaveInterval).toBeDefined();
    });

    test('should enable auto-save with custom interval', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.enableAutoSave(60);
      });

      expect(result.current.autoSaveInterval).toBeDefined();
    });

    test('should disable auto-save', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.enableAutoSave();
      });

      expect(result.current.autoSaveInterval).toBeDefined();

      act(() => {
        result.current.disableAutoSave();
      });

      expect(result.current.autoSaveInterval).toBeUndefined();
    });

    test('should clear existing auto-save interval when enabling new one', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.enableAutoSave(30);
      });

      const firstInterval = result.current.autoSaveInterval;

      act(() => {
        result.current.enableAutoSave(60);
      });

      const secondInterval = result.current.autoSaveInterval;

      expect(firstInterval).not.toBe(secondInterval);
    });
  });

  describe('Session Tracking', () => {
    test('should have session start time on initialization', () => {
      const { result } = renderHook(() => useGameStore());

      expect(result.current.sessionStartTime).toBeInstanceOf(Date);
    });

    test('should track total games completed', () => {
      const { result } = renderHook(() => useGameStore());

      expect(result.current.totalGamesCompleted).toBe(0);
    });

    test('should track current streak', () => {
      const { result } = renderHook(() => useGameStore());

      expect(result.current.currentStreak).toBe(0);
    });

    test('should track consecutive days played', () => {
      const { result } = renderHook(() => useGameStore());

      expect(result.current.consecutiveDaysPlayed).toBe(0);
    });
  });

  describe('Cleanup', () => {
    test('should clear all intervals on cleanup', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startTimer();
        result.current.enableAutoSave();
      });

      expect(result.current.gameTimerInterval).toBeDefined();
      expect(result.current.autoSaveInterval).toBeDefined();

      act(() => {
        result.current.cleanup();
      });

      expect(result.current.gameTimerInterval).toBeUndefined();
      expect(result.current.autoSaveInterval).toBeUndefined();
    });

    test('should reset timer state on cleanup', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.startTimer();
      });

      act(() => {
        result.current.cleanup();
      });

      expect(result.current.isTimerRunning).toBe(false);
      expect(result.current.pauseStartTime).toBeUndefined();
    });
  });

  describe('Loading State', () => {
    test('should have initial loading state as false', () => {
      const { result } = renderHook(() => useGameStore());

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle pause without starting timer', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.pauseTimer();
      });

      expect(result.current.isTimerRunning).toBe(false);
    });

    test('should handle resume without pausing', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.resumeTimer();
      });

      // Should not throw error
      expect(result.current.isTimerRunning).toBe(true);
    });

    test('should handle disabling auto-save when not enabled', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.disableAutoSave();
      });

      // Should not throw error
      expect(result.current.autoSaveInterval).toBeUndefined();
    });

    test('should handle multiple cleanup calls', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.cleanup();
        result.current.cleanup();
        result.current.cleanup();
      });

      // Should not throw error
      expect(result.current.gameTimerInterval).toBeUndefined();
      expect(result.current.autoSaveInterval).toBeUndefined();
    });
  });

  describe('State Persistence', () => {
    test('should maintain state after actions', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        result.current.selectCell(5, 5);
        result.current.startTimer();
        result.current.updateSaveSettings({ autoSaveInterval: 90 });
      });

      expect(result.current.selectedCell).toMatchObject({ row: 5, col: 5 });
      expect(result.current.isTimerRunning).toBe(true);
      expect(result.current.saveSettings.autoSaveInterval).toBe(90);
    });
  });

  describe('Performance', () => {
    test('should handle rapid cell selections', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.selectCell(i % 9, (i * 2) % 9);
        }
      });

      // Last selection should be preserved
      expect(result.current.selectedCell).toBeDefined();
    });

    test('should handle rapid timer state changes', () => {
      const { result } = renderHook(() => useGameStore());

      act(() => {
        for (let i = 0; i < 20; i++) {
          result.current.startTimer();
          result.current.pauseTimer();
          result.current.resumeTimer();
        }
      });

      // Should not throw error and maintain valid state
      expect(result.current.isTimerRunning).toBe(true);
    });
  });
});
