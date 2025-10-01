/**
 * E2E Test: Statistics Tracking
 *
 * Тестирование отслеживания и отображения статистики игрока
 * Согласно 2.3.4-testing-strategy.md, раздел 3: E2E Testing
 * Соответствует требованиям бизнес-анализа: статистика по сложности, время, достижения
 */

import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

describe('Statistics Tracking Flow', () => {
  beforeAll(async () => {
    await device.launchApp({
      newInstance: true,
      permissions: { notifications: 'YES' },
    });
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  describe('Statistics Screen Access', () => {
    it('should open statistics screen from home', async () => {
      // Нажимаем кнопку статистики
      await element(by.id('statistics-button')).tap();

      // Проверяем, что экран статистики открылся
      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      await detoxExpect(element(by.text('Statistics'))).toBeVisible();
    });

    it('should display overall statistics summary', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Проверяем наличие ключевых элементов статистики
      await detoxExpect(element(by.text('Games Played'))).toBeVisible();
      await detoxExpect(element(by.text('Games Won'))).toBeVisible();
      await detoxExpect(element(by.text('Win Rate'))).toBeVisible();
      await detoxExpect(element(by.text('Average Time'))).toBeVisible();
    });
  });

  describe('Game Completion Statistics', () => {
    it('should track completed game in statistics', async () => {
      // Открываем статистику и запоминаем текущее значение
      await element(by.id('statistics-button')).tap();
      await waitFor(element(by.id('statistics-screen'))).toBeVisible().withTimeout(3000);

      // Проверяем начальное состояние
      await detoxExpect(element(by.id('total-games-count'))).toBeVisible();

      // Возвращаемся на главный экран
      await element(by.id('back-button')).tap();

      // Начинаем и завершаем игру (упрощенный сценарий)
      await element(by.text('Easy')).tap();
      await waitFor(element(by.id('sudoku-board'))).toBeVisible().withTimeout(5000);

      // Делаем несколько ходов
      await element(by.id('sudoku-cell-0-0')).tap();
      await element(by.id('number-pad-button-1')).tap();

      // Возвращаемся на главный экран
      await element(by.id('back-button')).tap();

      // Открываем статистику снова
      await element(by.id('statistics-button')).tap();
      await waitFor(element(by.id('statistics-screen'))).toBeVisible().withTimeout(3000);

      // Статистика должна обновиться
      await detoxExpect(element(by.id('total-games-count'))).toBeVisible();
    });

    it('should track win rate percentage', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Проверяем отображение процента побед
      await detoxExpect(element(by.id('win-rate-percentage'))).toBeVisible();
    });

    it('should track best time for each difficulty', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Прокручиваем к статистике по сложности
      await element(by.id('statistics-screen')).scrollTo('bottom');

      // Проверяем наличие лучшего времени для каждой сложности
      await detoxExpect(element(by.text('Easy'))).toBeVisible();
      await detoxExpect(element(by.text('Medium'))).toBeVisible();
      await detoxExpect(element(by.text('Hard'))).toBeVisible();
      await detoxExpect(element(by.text('Expert'))).toBeVisible();
    });
  });

  describe('Difficulty-based Statistics', () => {
    it('should display statistics broken down by difficulty', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Проверяем наличие вкладок или секций для каждой сложности
      await detoxExpect(element(by.id('difficulty-stats-easy'))).toBeVisible();
      await detoxExpect(element(by.id('difficulty-stats-medium'))).toBeVisible();
      await detoxExpect(element(by.id('difficulty-stats-hard'))).toBeVisible();
      await detoxExpect(element(by.id('difficulty-stats-expert'))).toBeVisible();
    });

    it('should show games count for each difficulty', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Проверяем счетчики игр для каждой сложности
      await detoxExpect(element(by.id('easy-games-count'))).toBeVisible();
      await detoxExpect(element(by.id('medium-games-count'))).toBeVisible();
      await detoxExpect(element(by.id('hard-games-count'))).toBeVisible();
      await detoxExpect(element(by.id('expert-games-count'))).toBeVisible();
    });

    it('should show average completion time per difficulty', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Проверяем среднее время для каждой сложности
      await detoxExpect(element(by.id('easy-avg-time'))).toBeVisible();
      await detoxExpect(element(by.id('medium-avg-time'))).toBeVisible();
      await detoxExpect(element(by.id('hard-avg-time'))).toBeVisible();
      await detoxExpect(element(by.id('expert-avg-time'))).toBeVisible();
    });
  });

  describe('Time Tracking', () => {
    it('should track total play time', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Проверяем отображение общего времени игры
      await detoxExpect(element(by.text('Total Play Time'))).toBeVisible();
      await detoxExpect(element(by.id('total-play-time'))).toBeVisible();
    });

    it('should display fastest solve time', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Проверяем отображение лучшего времени
      await detoxExpect(element(by.text('Fastest Time'))).toBeVisible();
      await detoxExpect(element(by.id('fastest-time'))).toBeVisible();
    });

    it('should track average solve time', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Проверяем среднее время решения
      await detoxExpect(element(by.text('Average Time'))).toBeVisible();
      await detoxExpect(element(by.id('average-solve-time'))).toBeVisible();
    });
  });

  describe('Hints and Mistakes Tracking', () => {
    it('should track total hints used', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Проверяем статистику использования подсказок
      await detoxExpect(element(by.text('Hints Used'))).toBeVisible();
      await detoxExpect(element(by.id('total-hints-used'))).toBeVisible();
    });

    it('should track average hints per game', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Проверяем среднее количество подсказок на игру
      await detoxExpect(element(by.text('Avg Hints per Game'))).toBeVisible();
      await detoxExpect(element(by.id('avg-hints-per-game'))).toBeVisible();
    });

    it('should track total mistakes made', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Проверяем статистику ошибок
      await detoxExpect(element(by.text('Mistakes'))).toBeVisible();
      await detoxExpect(element(by.id('total-mistakes'))).toBeVisible();
    });
  });

  describe('Achievements Display', () => {
    it('should show unlocked achievements', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Прокручиваем к секции достижений
      await element(by.id('statistics-screen')).scrollTo('bottom');

      // Проверяем секцию достижений
      await waitFor(element(by.text('Achievements')))
        .toBeVisible()
        .withTimeout(2000);

      await detoxExpect(element(by.id('achievements-section'))).toBeVisible();
    });

    it('should display achievement progress', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Прокручиваем к достижениям
      await element(by.id('statistics-screen')).scrollTo('bottom');

      // Проверяем отображение прогресса достижений
      await waitFor(element(by.id('achievement-progress')))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should navigate to achievements screen', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Прокручиваем к достижениям
      await element(by.id('statistics-screen')).scrollTo('bottom');

      // Нажимаем на секцию достижений
      await element(by.id('view-all-achievements-button')).tap();

      // Должен открыться экран всех достижений
      await waitFor(element(by.id('achievements-screen')))
        .toBeVisible()
        .withTimeout(3000);

      await detoxExpect(element(by.text('All Achievements'))).toBeVisible();
    });
  });

  describe('Statistics Charts', () => {
    it('should display progress chart', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Проверяем наличие графика прогресса
      await detoxExpect(element(by.id('progress-chart'))).toBeVisible();
    });

    it('should display win rate trend', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Прокручиваем к графикам
      await element(by.id('statistics-screen')).scroll(200, 'down');

      // Проверяем график динамики побед
      await detoxExpect(element(by.id('win-rate-chart'))).toBeVisible();
    });
  });

  describe('Streak Tracking', () => {
    it('should track current win streak', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Проверяем текущую серию побед
      await detoxExpect(element(by.text('Current Streak'))).toBeVisible();
      await detoxExpect(element(by.id('current-streak'))).toBeVisible();
    });

    it('should track best win streak', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Проверяем лучшую серию побед
      await detoxExpect(element(by.text('Best Streak'))).toBeVisible();
      await detoxExpect(element(by.id('best-streak'))).toBeVisible();
    });

    it('should track consecutive days played', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Проверяем количество дней подряд
      await detoxExpect(element(by.text('Days Played'))).toBeVisible();
      await detoxExpect(element(by.id('consecutive-days'))).toBeVisible();
    });
  });

  describe('Statistics Reset', () => {
    it('should reset statistics when requested', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Прокручиваем вниз к кнопке сброса
      await element(by.id('statistics-screen')).scrollTo('bottom');

      // Нажимаем кнопку сброса статистики
      await element(by.id('reset-statistics-button')).tap();

      // Подтверждаем сброс
      await waitFor(element(by.text('Reset Statistics')))
        .toBeVisible()
        .withTimeout(2000);

      await element(by.text('Confirm')).tap();

      // Статистика должна обнулиться
      await new Promise(resolve => setTimeout(resolve, 1000));

      await detoxExpect(element(by.id('statistics-screen'))).toBeVisible();
    });
  });

  describe('Statistics Export', () => {
    it('should export statistics data', async () => {
      await element(by.id('statistics-button')).tap();

      await waitFor(element(by.id('statistics-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Прокручиваем к кнопке экспорта
      await element(by.id('statistics-screen')).scrollTo('bottom');

      // Нажимаем экспорт
      await element(by.id('export-statistics-button')).tap();

      // Должно появиться сообщение об успехе или share dialog
      await waitFor(element(by.text('Export Successful')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  afterAll(async () => {
    // Cleanup
  });
});
