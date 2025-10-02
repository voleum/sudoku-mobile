/**
 * E2E Test Setup
 * Начальная настройка для всех Detox E2E тестов
 */

import { device } from 'detox';

beforeAll(async () => {
  // Установка ориентации устройства в портретный режим
  await device.setOrientation('portrait');

  // Отключение синхронизации с анимациями для более быстрых тестов
  await device.disableSynchronization();
});

beforeEach(async () => {
  // Перезагрузка React Native перед каждым тестом для чистого состояния
  await device.reloadReactNative();

  // Включение синхронизации для тестов
  await device.enableSynchronization();
});

afterAll(async () => {
  // Cleanup after all tests
});
