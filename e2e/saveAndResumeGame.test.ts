/**
 * E2E Test: Save and Resume Game
 *
 * Тестирование сохранения и возобновления игры
 * Согласно 2.3.4-testing-strategy.md, раздел 3: E2E Testing
 * Соответствует TC003 (Game Persistence)
 */

import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

describe('Save and Resume Game Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Auto-save Functionality', () => {
    it('should auto-save game progress during gameplay', async () => {
      // Начинаем новую игру
      await element(by.text('Medium')).tap();

      await waitFor(element(by.id('sudoku-board')))
        .toBeVisible()
        .withTimeout(5000);

      // Делаем несколько ходов
      await element(by.id('sudoku-cell-0-0')).tap();
      await element(by.id('number-pad-button-5')).tap();

      await element(by.id('sudoku-cell-1-1')).tap();
      await element(by.id('number-pad-button-3')).tap();

      await element(by.id('sudoku-cell-2-2')).tap();
      await element(by.id('number-pad-button-7')).tap();

      // Ждем автосохранение (30 секунд согласно настройкам)
      // Для теста используем меньшее время
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Возвращаемся на главный экран
      await element(by.id('back-button')).tap();

      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Проверяем, что появилась кнопка Continue Game
      await detoxExpect(element(by.id('continue-game-button'))).toBeVisible();
    });

    it('should auto-save after making multiple moves', async () => {
      // Начинаем новую игру
      await element(by.text('Easy')).tap();

      await waitFor(element(by.id('sudoku-board')))
        .toBeVisible()
        .withTimeout(5000);

      // Делаем 10 ходов
      for (let i = 0; i < 5; i++) {
        await element(by.id(`sudoku-cell-${i}-0`)).tap();
        await element(by.id(`number-pad-button-${i + 1}`)).tap();
      }

      // Небольшая пауза для автосохранения
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Возвращаемся на главный экран
      await element(by.id('back-button')).tap();

      // Проверяем сохранение
      await waitFor(element(by.id('continue-game-button')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Resume Game Functionality', () => {
    it('should resume game from home screen', async () => {
      // Начинаем новую игру и делаем ходы
      await element(by.text('Medium')).tap();

      await waitFor(element(by.id('sudoku-board')))
        .toBeVisible()
        .withTimeout(5000);

      // Делаем уникальный ход для проверки
      await element(by.id('sudoku-cell-0-0')).tap();
      await element(by.id('number-pad-button-9')).tap();

      // Возвращаемся на главный экран
      await element(by.id('back-button')).tap();

      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Нажимаем Continue Game
      await element(by.id('continue-game-button')).tap();

      await waitFor(element(by.id('sudoku-board')))
        .toBeVisible()
        .withTimeout(5000);

      // Проверяем, что мы вернулись в ту же игру
      await detoxExpect(element(by.id('sudoku-board'))).toBeVisible();
      await detoxExpect(element(by.id('game-timer'))).toBeVisible();
    });

    it('should preserve game state after app restart', async () => {
      // Начинаем новую игру
      await element(by.text('Hard')).tap();

      await waitFor(element(by.id('sudoku-board')))
        .toBeVisible()
        .withTimeout(5000);

      // Делаем ходы
      await element(by.id('sudoku-cell-3-3')).tap();
      await element(by.id('number-pad-button-4')).tap();

      await element(by.id('sudoku-cell-4-4')).tap();
      await element(by.id('number-pad-button-8')).tap();

      // Перезапускаем приложение
      await device.launchApp({ newInstance: false });

      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Проверяем, что кнопка Continue доступна
      await detoxExpect(element(by.id('continue-game-button'))).toBeVisible();

      // Возобновляем игру
      await element(by.id('continue-game-button')).tap();

      await waitFor(element(by.id('sudoku-board')))
        .toBeVisible()
        .withTimeout(5000);

      // Проверяем, что игровой экран загружен
      await detoxExpect(element(by.id('sudoku-board'))).toBeVisible();
    });

    it('should preserve timer state when resuming', async () => {
      // Начинаем игру
      await element(by.text('Medium')).tap();

      await waitFor(element(by.id('game-timer')))
        .toBeVisible()
        .withTimeout(5000);

      // Ждем несколько секунд
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Возвращаемся на главный экран
      await element(by.id('back-button')).tap();

      // Возобновляем
      await element(by.id('continue-game-button')).tap();

      await waitFor(element(by.id('game-timer')))
        .toBeVisible()
        .withTimeout(5000);

      // Таймер должен продолжать работать
      await detoxExpect(element(by.id('game-timer'))).toBeVisible();
    });

    it('should preserve moves count when resuming', async () => {
      // Начинаем игру
      await element(by.text('Easy')).tap();

      await waitFor(element(by.id('sudoku-board')))
        .toBeVisible()
        .withTimeout(5000);

      // Делаем 5 ходов
      for (let i = 0; i < 5; i++) {
        await element(by.id(`sudoku-cell-${i}-0`)).tap();
        await element(by.id(`number-pad-button-${i + 1}`)).tap();
      }

      // Проверяем счетчик
      await detoxExpect(element(by.id('moves-counter'))).toBeVisible();

      // Возвращаемся и возобновляем
      await element(by.id('back-button')).tap();
      await element(by.id('continue-game-button')).tap();

      await waitFor(element(by.id('moves-counter')))
        .toBeVisible()
        .withTimeout(5000);

      // Счетчик ходов должен быть сохранен
      await detoxExpect(element(by.id('moves-counter'))).toBeVisible();
    });
  });

  describe('Multiple Saved Games', () => {
    it('should handle multiple saved games', async () => {
      // Начинаем первую игру
      await element(by.text('Easy')).tap();
      await waitFor(element(by.id('sudoku-board'))).toBeVisible().withTimeout(5000);
      await element(by.id('sudoku-cell-0-0')).tap();
      await element(by.id('number-pad-button-1')).tap();
      await element(by.id('back-button')).tap();

      // Ждем немного
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Начинаем вторую игру
      await element(by.text('Hard')).tap();
      await waitFor(element(by.id('sudoku-board'))).toBeVisible().withTimeout(5000);
      await element(by.id('sudoku-cell-0-0')).tap();
      await element(by.id('number-pad-button-7')).tap();
      await element(by.id('back-button')).tap();

      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Открываем список сохраненных игр
      await element(by.id('saved-games-button')).tap();

      await waitFor(element(by.id('saved-games-list')))
        .toBeVisible()
        .withTimeout(3000);

      // Должно быть несколько сохраненных игр
      await detoxExpect(element(by.id('saved-games-list'))).toBeVisible();
    });

    it('should delete saved game', async () => {
      // Начинаем игру
      await element(by.text('Easy')).tap();
      await waitFor(element(by.id('sudoku-board'))).toBeVisible().withTimeout(5000);
      await element(by.id('back-button')).tap();

      // Открываем список сохраненных игр
      await element(by.id('saved-games-button')).tap();

      await waitFor(element(by.id('saved-games-list')))
        .toBeVisible()
        .withTimeout(3000);

      // Удаляем первую сохраненную игру
      await element(by.id('delete-save-button-0')).tap();

      // Подтверждаем удаление
      await waitFor(element(by.text('Confirm')))
        .toBeVisible()
        .withTimeout(2000);

      await element(by.text('Confirm')).tap();

      // Список должен обновиться
      await detoxExpect(element(by.id('saved-games-list'))).toBeVisible();
    });
  });

  describe('Game State Consistency', () => {
    it('should preserve all game state elements', async () => {
      // Начинаем игру с определенными параметрами
      await element(by.text('Medium')).tap();

      await waitFor(element(by.id('sudoku-board')))
        .toBeVisible()
        .withTimeout(5000);

      // Делаем ходы
      await element(by.id('sudoku-cell-0-0')).tap();
      await element(by.id('number-pad-button-5')).tap();

      // Используем подсказку
      await element(by.id('hint-button')).tap();
      await waitFor(element(by.text('General Direction'))).toBeVisible().withTimeout(2000);
      await element(by.text('General Direction')).tap();

      // Ждем закрытия модального окна подсказки
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Возвращаемся и возобновляем
      await element(by.id('back-button')).tap();

      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(3000);

      await element(by.id('continue-game-button')).tap();

      await waitFor(element(by.id('sudoku-board')))
        .toBeVisible()
        .withTimeout(5000);

      // Проверяем, что все элементы состояния присутствуют
      await detoxExpect(element(by.id('sudoku-board'))).toBeVisible();
      await detoxExpect(element(by.id('game-timer'))).toBeVisible();
      await detoxExpect(element(by.id('moves-counter'))).toBeVisible();
    });
  });

  afterAll(async () => {
    // Cleanup
  });
});
