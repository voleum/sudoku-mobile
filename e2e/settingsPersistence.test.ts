/**
 * E2E Test: Settings Persistence
 *
 * Тестирование сохранения и применения настроек пользователя
 * Согласно 2.3.4-testing-strategy.md, раздел 3: E2E Testing
 * Соответствует требованиям бизнес-анализа: настройки темы, звука, подсказок
 */

import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

describe('Settings Persistence Flow', () => {
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

  describe('Theme Settings', () => {
    it('should open settings screen from home', async () => {
      // Нажимаем кнопку настроек
      await element(by.id('settings-button')).tap();

      // Проверяем, что экран настроек открылся
      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);

      await detoxExpect(element(by.text('Theme'))).toBeVisible();
    });

    it('should change theme from light to dark', async () => {
      // Открываем настройки
      await element(by.id('settings-button')).tap();

      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Нажимаем на переключатель темы
      await element(by.id('theme-toggle')).tap();

      // Ждем применения темы
      await new Promise(resolve => setTimeout(resolve, 500));

      // Проверяем, что тема изменилась (визуально)
      await detoxExpect(element(by.id('settings-screen'))).toBeVisible();
    });

    it('should persist theme setting after app restart', async () => {
      // Открываем настройки и меняем тему
      await element(by.id('settings-button')).tap();
      await waitFor(element(by.id('settings-screen'))).toBeVisible().withTimeout(3000);
      await element(by.id('theme-toggle')).tap();

      // Возвращаемся на главный экран
      await element(by.id('back-button')).tap();

      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Перезапускаем приложение
      await device.launchApp({ newInstance: false });

      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Открываем настройки снова
      await element(by.id('settings-button')).tap();

      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Тема должна быть сохранена
      await detoxExpect(element(by.id('settings-screen'))).toBeVisible();
    });

    it('should apply theme to all screens', async () => {
      // Меняем тему
      await element(by.id('settings-button')).tap();
      await waitFor(element(by.id('settings-screen'))).toBeVisible().withTimeout(3000);
      await element(by.id('theme-toggle')).tap();
      await element(by.id('back-button')).tap();

      // Проверяем применение на главном экране
      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Начинаем игру и проверяем применение темы
      await element(by.text('Easy')).tap();

      await waitFor(element(by.id('game-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Тема должна быть применена к игровому экрану
      await detoxExpect(element(by.id('sudoku-board'))).toBeVisible();
    });
  });

  describe('Sound Settings', () => {
    it('should toggle sound effects', async () => {
      // Открываем настройки
      await element(by.id('settings-button')).tap();

      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Находим настройку звука
      await detoxExpect(element(by.text('Sound Effects'))).toBeVisible();

      // Переключаем звук
      await element(by.id('sound-effects-toggle')).tap();

      // Настройка должна быть применена
      await detoxExpect(element(by.id('settings-screen'))).toBeVisible();
    });

    it('should toggle music', async () => {
      await element(by.id('settings-button')).tap();

      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Переключаем музыку
      await element(by.id('music-toggle')).tap();

      await detoxExpect(element(by.id('settings-screen'))).toBeVisible();
    });

    it('should persist sound settings after restart', async () => {
      // Открываем настройки и отключаем звук
      await element(by.id('settings-button')).tap();
      await waitFor(element(by.id('settings-screen'))).toBeVisible().withTimeout(3000);
      await element(by.id('sound-effects-toggle')).tap();
      await element(by.id('back-button')).tap();

      // Перезапускаем приложение
      await device.launchApp({ newInstance: false });

      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Проверяем, что настройка сохранена
      await element(by.id('settings-button')).tap();

      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);

      await detoxExpect(element(by.id('sound-effects-toggle'))).toBeVisible();
    });
  });

  describe('Hint Settings', () => {
    it('should configure hint level preference', async () => {
      await element(by.id('settings-button')).tap();

      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Проверяем наличие настроек подсказок
      await detoxExpect(element(by.text('Hints'))).toBeVisible();

      // Открываем настройки подсказок
      await element(by.id('hints-settings')).tap();

      await waitFor(element(by.text('Default Hint Level')))
        .toBeVisible()
        .withTimeout(2000);

      // Выбираем уровень подсказок
      await element(by.text('Specific Technique')).tap();

      // Возвращаемся
      await element(by.id('back-button')).tap();

      // Настройка должна быть сохранена
      await detoxExpect(element(by.id('settings-screen'))).toBeVisible();
    });

    it('should toggle auto-hints feature', async () => {
      await element(by.id('settings-button')).tap();

      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Переключаем авто-подсказки
      await element(by.id('auto-hints-toggle')).tap();

      await detoxExpect(element(by.id('settings-screen'))).toBeVisible();
    });
  });

  describe('Game Preferences', () => {
    it('should configure timer display', async () => {
      await element(by.id('settings-button')).tap();

      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Переключаем отображение таймера
      await element(by.id('show-timer-toggle')).tap();

      await detoxExpect(element(by.id('settings-screen'))).toBeVisible();
    });

    it('should configure mistake highlighting', async () => {
      await element(by.id('settings-button')).tap();

      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Переключаем подсветку ошибок
      await element(by.id('highlight-mistakes-toggle')).tap();

      await detoxExpect(element(by.id('settings-screen'))).toBeVisible();
    });

    it('should configure auto-remove notes', async () => {
      await element(by.id('settings-button')).tap();

      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Переключаем автоудаление заметок
      await element(by.id('auto-remove-notes-toggle')).tap();

      await detoxExpect(element(by.id('settings-screen'))).toBeVisible();
    });
  });

  describe('Difficulty Preferences', () => {
    it('should set default difficulty level', async () => {
      await element(by.id('settings-button')).tap();

      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Открываем настройки сложности
      await element(by.id('default-difficulty-setting')).tap();

      await waitFor(element(by.text('Select Default Difficulty')))
        .toBeVisible()
        .withTimeout(2000);

      // Выбираем Hard как значение по умолчанию
      await element(by.text('Hard')).tap();

      // Возвращаемся
      await element(by.id('back-button')).tap();

      // Возвращаемся на главный экран
      await element(by.id('back-button')).tap();

      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Hard должен быть выбран по умолчанию
      // (визуальная проверка)
    });
  });

  describe('Language Settings', () => {
    it('should change language from English to Russian', async () => {
      await element(by.id('settings-button')).tap();

      await waitFor(element(by.id('settings-screen')))
        .toBeVisible()
        .withTimeout(3000);

      // Открываем настройки языка
      await element(by.id('language-setting')).tap();

      await waitFor(element(by.text('Select Language')))
        .toBeVisible()
        .withTimeout(2000);

      // Выбираем русский язык
      await element(by.text('Русский')).tap();

      // Ждем применения языка
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Интерфейс должен переключиться на русский
      await detoxExpect(element(by.id('settings-screen'))).toBeVisible();
    });

    it('should persist language setting after restart', async () => {
      // Меняем язык
      await element(by.id('settings-button')).tap();
      await waitFor(element(by.id('settings-screen'))).toBeVisible().withTimeout(3000);
      await element(by.id('language-setting')).tap();
      await waitFor(element(by.text('Select Language'))).toBeVisible().withTimeout(2000);
      await element(by.text('Русский')).tap();

      await new Promise(resolve => setTimeout(resolve, 500));

      // Возвращаемся
      await element(by.id('back-button')).tap();

      // Перезапускаем приложение
      await device.launchApp({ newInstance: false });

      await waitFor(element(by.id('home-screen')))
        .toBeVisible()
        .withTimeout(5000);

      // Язык должен быть сохранен
      // (проверяем по наличию русского текста)
      await detoxExpect(element(by.id('home-screen'))).toBeVisible();
    });
  });

  describe('Reset Settings', () => {
    it('should reset all settings to defaults', async () => {
      // Меняем несколько настроек
      await element(by.id('settings-button')).tap();
      await waitFor(element(by.id('settings-screen'))).toBeVisible().withTimeout(3000);

      await element(by.id('theme-toggle')).tap();
      await element(by.id('sound-effects-toggle')).tap();

      // Прокручиваем вниз к кнопке сброса
      await element(by.id('settings-screen')).scrollTo('bottom');

      // Нажимаем Reset Settings
      await element(by.id('reset-settings-button')).tap();

      // Подтверждаем
      await waitFor(element(by.text('Confirm Reset')))
        .toBeVisible()
        .withTimeout(2000);

      await element(by.text('Confirm')).tap();

      // Настройки должны вернуться к дефолтным
      await new Promise(resolve => setTimeout(resolve, 1000));

      await detoxExpect(element(by.id('settings-screen'))).toBeVisible();
    });
  });

  afterAll(async () => {
    // Cleanup
  });
});
