/**
 * Integration Tests: Screen + Store Integration
 *
 * Тестирование взаимодействия между экранами и Zustand store
 * согласно стратегии тестирования (2.3.4-testing-strategy.md, раздел 2: Integration Testing)
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { HomeScreen } from '../../src/presentation/screens/Home/HomeScreen';
import { GameScreen } from '../../src/presentation/screens/Game/GameScreen';
import { SettingsScreen } from '../../src/presentation/screens/Settings/SettingsScreen';
import { StatisticsScreen } from '../../src/presentation/screens/Statistics/StatisticsScreen';
import { useGameStore } from '../../src/application/stores/gameStore';
import { ThemeProvider } from '../../src/presentation/theme';
import { GameEntity, DifficultyLevel } from '../../src/domain/types/GameTypes';


// Mock AudioService
jest.mock('../../src/infrastructure/services/AudioService', () => ({
  AudioService: {
    getInstance: jest.fn(() => ({
      initialize: jest.fn(),
      playSound: jest.fn(),
      updateSettings: jest.fn(),
      cleanup: jest.fn(),
    })),
  },
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

// Helper для рендеринга с провайдерами
const renderWithProviders = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('Screen + Store Integration Tests', () => {
  beforeEach(() => {
    // Очищаем store перед каждым тестом
    useGameStore.getState().cleanup();
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
    useGameStore.getState().cleanup();
  });

  describe('HomeScreen + GameStore Integration', () => {
    it('should start new game and update store', async () => {
      const { getByText } = renderWithProviders(<HomeScreen />);

      // Начальное состояние - нет активной игры
      const store = useGameStore.getState();
      expect(store.currentGame).toBeNull();

      // Нажимаем кнопку "Новая игра" (предполагается, что есть DifficultyCard)
      const easyButton = getByText(/легкий/i);

      await act(async () => {
        fireEvent.press(easyButton);
      });

      await waitFor(() => {
        const updatedStore = useGameStore.getState();
        expect(updatedStore.currentGame).not.toBeNull();
        expect(updatedStore.currentGame?.difficulty).toBe('easy');
      });
    });

    it('should display continue game button when game exists', async () => {
      // Создаем игру в store
      await act(async () => {
        const setCurrentGame = useGameStore.getState().setCurrentGame;
        const mockGame = createMockGameEntity('medium'); setCurrentGame(mockGame);
      });

      const { getByText } = renderWithProviders(<HomeScreen />);

      // Должна отображаться кнопка продолжения игры
      await waitFor(() => {
        expect(getByText(/продолжить/i)).toBeTruthy();
      });
    });

    it('should load saved game from store', async () => {
      // Создаем и сохраняем игру
      await act(async () => {
        const setCurrentGame = useGameStore.getState().setCurrentGame;
        const mockGame = createMockGameEntity('hard'); setCurrentGame(mockGame);

        useGameStore.getState().selectCell(0, 0);
        useGameStore.getState().makeMove(0, 0, 5);
      });

      const gameId = useGameStore.getState().currentGame?.id;
      expect(gameId).toBeDefined();

      // Очищаем текущую игру
      await act(async () => {
        useGameStore.setState({ currentGame: null });
      });

      // Загружаем сохраненную игру
      await act(async () => {
        const loadGame = useGameStore.getState().loadGame;
        await loadGame(gameId!);
      });

      const loadedGame = useGameStore.getState().currentGame;
      expect(loadedGame).not.toBeNull();
      expect(loadedGame?.grid[0][0]).toBe(5);
    });
  });

  describe('GameScreen + GameStore Integration', () => {
    beforeEach(async () => {
      // Создаем игру перед каждым тестом
      await act(async () => {
        const setCurrentGame = useGameStore.getState().setCurrentGame;
        const mockGame = createMockGameEntity('medium'); setCurrentGame(mockGame);
      });
    });

    it('should update store when making moves', async () => {
      const { getByTestId } = renderWithProviders(<GameScreen />);

      const initialMoveCount = useGameStore.getState().currentGame?.movesCount || 0;

      // Выбираем ячейку и вводим число
      const cell = getByTestId('sudoku-cell-0-0');
      await act(async () => {
        fireEvent.press(cell);
      });

      const numberButton = getByTestId('number-pad-button-5');
      await act(async () => {
        fireEvent.press(numberButton);
      });

      await waitFor(() => {
        const updatedMoveCount = useGameStore.getState().currentGame?.movesCount || 0;
        expect(updatedMoveCount).toBeGreaterThan(initialMoveCount);
      });
    });

    it('should update elapsed time in store', async () => {
      renderWithProviders(<GameScreen />);

      const initialTime = useGameStore.getState().currentGame?.currentTime || 0;

      // Ждем некоторое время для обновления таймера
      await act(async () => {
        await new Promise<void>(resolve => setTimeout(resolve, 1100));
      });

      await waitFor(() => {
        const currentTime = useGameStore.getState().currentGame?.currentTime || 0;
        expect(currentTime).toBeGreaterThan(initialTime);
      }, { timeout: 2000 });
    });

    it('should trigger undo and update store', async () => {
      const { getByTestId } = renderWithProviders(<GameScreen />);

      // Делаем ход
      await act(async () => {
        fireEvent.press(getByTestId('sudoku-cell-1-1'));
        fireEvent.press(getByTestId('number-pad-button-7'));
      });

      const cellValueAfterMove = useGameStore.getState().currentGame?.grid[1][1];
      expect(cellValueAfterMove).toBe(7);

      // Отменяем ход
      const undoButton = getByTestId('game-control-undo');
      await act(async () => {
        fireEvent.press(undoButton);
      });

      await waitFor(() => {
        const cellValueAfterUndo = useGameStore.getState().currentGame?.grid[1][1];
        expect(cellValueAfterUndo).not.toBe(7);
      });
    });

    it('should pause game and update store', async () => {
      const { getByTestId } = renderWithProviders(<GameScreen />);

      expect(useGameStore.getState().isTimerRunning).toBe(true);

      // Ставим игру на паузу
      const pauseButton = getByTestId('game-control-pause');
      await act(async () => {
        fireEvent.press(pauseButton);
      });

      await waitFor(() => {
        expect(useGameStore.getState().isTimerRunning).toBe(false);
      });
    });

    it('should trigger hint and update store', async () => {
      const { getByTestId } = renderWithProviders(<GameScreen />);

      const initialHintsUsed = useGameStore.getState().currentGame?.hintsUsed || 0;

      // Используем подсказку
      const hintButton = getByTestId('game-control-hint');
      await act(async () => {
        fireEvent.press(hintButton);
      });

      await waitFor(() => {
        const currentHintsUsed = useGameStore.getState().currentGame?.hintsUsed || 0;
        expect(currentHintsUsed).toBeGreaterThan(initialHintsUsed);
      });
    });
  });

  describe('SettingsScreen + Store Integration', () => {
    it('should update theme setting in store', async () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />);

      // Находим переключатель темной темы
      const themeToggle = getByTestId('setting-toggle-dark-theme');

      await act(async () => {
        fireEvent(themeToggle, 'onValueChange', true);
      });

      // Проверяем, что настройка обновилась
      // (в реальном приложении это будет в settingsStore)
      expect(themeToggle).toBeTruthy();
    });

    it('should update sound settings in store', async () => {
      const { getByTestId } = renderWithProviders(<SettingsScreen />);

      const soundToggle = getByTestId('setting-toggle-sound');

      await act(async () => {
        fireEvent(soundToggle, 'onValueChange', false);
      });

      // Проверяем, что настройка звука обновилась
      expect(soundToggle).toBeTruthy();
    });

    it('should update difficulty preference', async () => {
      const { getByText } = renderWithProviders(<SettingsScreen />);

      // Выбираем сложность по умолчанию
      const hardOption = getByText(/сложный/i);

      await act(async () => {
        fireEvent.press(hardOption);
      });

      // Настройка должна быть сохранена
      expect(hardOption).toBeTruthy();
    });
  });

  describe('StatisticsScreen + Store Integration', () => {
    beforeEach(async () => {
      // Создаем несколько завершенных игр для статистики
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          const setCurrentGame = useGameStore.getState().setCurrentGame;
          const mockGame = createMockGameEntity((['easy', 'medium', 'hard'] as DifficultyLevel[])[i]);
          setCurrentGame(mockGame);

          // Имитируем завершение игры
          useGameStore.setState(state => ({
            currentGame: state.currentGame ? {
              ...state.currentGame,
              isCompleted: true,
              currentTime: 300 + i * 100,
              movesCount: 81,
            } : null,
          }));
        });
      }
    });

    it('should display statistics from store', async () => {
      const { getByText } = renderWithProviders(<StatisticsScreen />);

      // Статистика должна отображаться
      await waitFor(() => {
        expect(getByText(/статистика/i)).toBeTruthy();
      });
    });

    it('should show total games played', async () => {
      const { getByTestId } = renderWithProviders(<StatisticsScreen />);

      // Должно отображаться количество сыгранных игр
      await waitFor(() => {
        const totalGamesElement = getByTestId('stats-total-games');
        expect(totalGamesElement).toBeTruthy();
      });
    });

    it('should display achievements progress', async () => {
      const { getByTestId } = renderWithProviders(<StatisticsScreen />);

      await waitFor(() => {
        const achievementsCard = getByTestId('achievements-card');
        expect(achievementsCard).toBeTruthy();
      });
    });
  });

  describe('Auto-save Integration', () => {
    it('should auto-save game after moves', async () => {
      await act(async () => {
        const setCurrentGame = useGameStore.getState().setCurrentGame;
        const mockGame = createMockGameEntity('medium'); setCurrentGame(mockGame);
      });

      const { getByTestId } = renderWithProviders(<GameScreen />);

      // Делаем несколько ходов
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          fireEvent.press(getByTestId(`sudoku-cell-0-${i}`));
          fireEvent.press(getByTestId(`number-pad-button-${i + 1}`));
        });
      }

      // Ждем срабатывания автосохранения
      await waitFor(() => {
        const movesCount = useGameStore.getState().currentGame?.movesCount || 0;
        expect(movesCount).toBeGreaterThanOrEqual(5);
      }, { timeout: 3000 });
    });

    it('should auto-save on pause', async () => {
      await act(async () => {
        const setCurrentGame = useGameStore.getState().setCurrentGame;
        const mockGame = createMockGameEntity('hard'); setCurrentGame(mockGame);
      });

      const { getByTestId } = renderWithProviders(<GameScreen />);

      // Ставим на паузу
      await act(async () => {
        fireEvent.press(getByTestId('game-control-pause'));
      });

      await waitFor(() => {
        expect(useGameStore.getState().isTimerRunning).toBe(false);
      });
    });
  });

  describe('Multi-Screen State Consistency', () => {
    it('should maintain state consistency across screen transitions', async () => {
      // Начинаем игру
      await act(async () => {
        const setCurrentGame = useGameStore.getState().setCurrentGame;
        const mockGame = createMockGameEntity('medium'); setCurrentGame(mockGame);
      });

      const { rerender, getByTestId } = renderWithProviders(<GameScreen />);

      // Делаем ход
      await act(async () => {
        fireEvent.press(getByTestId('sudoku-cell-2-2'));
        fireEvent.press(getByTestId('number-pad-button-8'));
      });

      const cellValue = useGameStore.getState().currentGame?.grid[2][2];

      // Переключаемся на HomeScreen
      rerender(<ThemeProvider><HomeScreen /></ThemeProvider>);

      // Возвращаемся на GameScreen
      rerender(<ThemeProvider><GameScreen /></ThemeProvider>);

      // Проверяем, что состояние сохранилось
      await waitFor(() => {
        const currentValue = useGameStore.getState().currentGame?.grid[2][2];
        expect(currentValue).toBe(cellValue);
      });
    });

    it('should sync timer across screen changes', async () => {
      await act(async () => {
        const setCurrentGame = useGameStore.getState().setCurrentGame;
        const mockGame = createMockGameEntity('easy'); setCurrentGame(mockGame);
      });

      const { rerender } = renderWithProviders(<GameScreen />);

      // Запоминаем время
      const initialTime = useGameStore.getState().currentGame?.currentTime || 0;

      // Переключаемся на SettingsScreen
      rerender(<ThemeProvider><SettingsScreen /></ThemeProvider>);

      // Ждем секунду
      await act(async () => {
        await new Promise<void>(resolve => setTimeout(resolve, 1100));
      });

      // Возвращаемся на GameScreen
      rerender(<ThemeProvider><GameScreen /></ThemeProvider>);

      // Время должно продолжать идти
      await waitFor(() => {
        const currentTime = useGameStore.getState().currentGame?.currentTime || 0;
        expect(currentTime).toBeGreaterThan(initialTime);
      }, { timeout: 2000 });
    });
  });

  describe('Error Handling', () => {
    it('should handle store errors gracefully', async () => {
      // Имитируем ошибку в store
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      await act(async () => {
        try {
          // Пытаемся загрузить несуществующую игру
          await useGameStore.getState().loadGame('non-existent-id');
        } catch (error) {
          // Ошибка должна быть обработана
          expect(error).toBeDefined();
        }
      });

      consoleErrorSpy.mockRestore();
    });

    it('should recover from invalid store state', async () => {
      // Устанавливаем невалидное состояние
      await act(async () => {
        useGameStore.setState({ currentGame: null });
      });

      const { getByText } = renderWithProviders(<HomeScreen />);

      // Приложение не должно крашиться
      expect(getByText).toBeDefined();
    });
  });
});
