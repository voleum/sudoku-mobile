# E2E Tests (Detox)

Эта директория содержит End-to-End (E2E) тесты для приложения Sudoku Game, написанные с использованием Detox.

## Обзор

E2E тесты тестируют полные пользовательские сценарии приложения на реальных устройствах/эмуляторах. Они составляют 10% от общего объема тестов согласно Test Pyramid Strategy (см. `2.3.4-testing-strategy.md`).

## Структура тестов

### 1. completeGameFlow.test.ts
Тестирует полный игровой процесс:
- Создание новой игры разной сложности
- Взаимодействие с игровым полем
- Выбор ячеек и ввод цифр
- Обнаружение конфликтов
- Использование подсказок
- Управление игрой (пауза/возобновление)
- Завершение игры

### 2. saveAndResumeGame.test.ts
Тестирует сохранение и возобновление игры:
- Автосохранение во время игры
- Возобновление игры с главного экрана
- Сохранение состояния после перезапуска приложения
- Работа с несколькими сохраненными играми
- Удаление сохраненных игр

### 3. settingsPersistence.test.ts
Тестирует настройки приложения:
- Изменение темы (светлая/темная)
- Настройки звука и музыки
- Настройки подсказок
- Игровые предпочтения
- Сложность по умолчанию
- Смена языка
- Сброс настроек

### 4. statisticsTracking.test.ts
Тестирует систему статистики:
- Отслеживание завершенных игр
- Статистика по сложностям
- Отслеживание времени
- Подсказки и ошибки
- Достижения
- Графики прогресса
- Серии побед
- Экспорт статистики

## Запуск тестов

### Предварительные требования

#### iOS
```bash
# Установите необходимые зависимости
cd ios && pod install && cd ..

# Убедитесь, что симулятор iOS установлен
```

#### Android
```bash
# Создайте эмулятор Android
# Имя AVD должно быть: Pixel_4a_API_31
# Или измените имя в .detoxrc.js
```

### Сборка приложения

```bash
# iOS
npm run build:e2e:ios

# Android
npm run build:e2e:android
```

### Запуск тестов

```bash
# iOS
npm run test:e2e:ios

# Android
npm run test:e2e:android
```

### Запуск конкретного теста

```bash
# iOS
detox test e2e/completeGameFlow.test.ts --configuration ios.sim.debug

# Android
detox test e2e/saveAndResumeGame.test.ts --configuration android.emu.debug
```

## Конфигурация

Конфигурация Detox находится в `.detoxrc.js` в корне проекта.

### Доступные конфигурации

- `ios.sim.debug` - iOS симулятор, debug сборка
- `ios.sim.release` - iOS симулятор, release сборка
- `android.emu.debug` - Android эмулятор, debug сборка
- `android.emu.release` - Android эмулятор, release сборка
- `android.att.debug` - Android физическое устройство, debug
- `android.att.release` - Android физическое устройство, release

## Лучшие практики

### TestID Convention

Все интерактивные элементы должны иметь testID для Detox:

```typescript
// Примеры testID
<View testID="home-screen">
<Button testID="start-game-button" />
<View testID="sudoku-cell-0-0" /> // row-col pattern
<TouchableOpacity testID="number-pad-button-5" />
```

### Ожидание элементов

Всегда используйте `waitFor` для асинхронных операций:

```typescript
await waitFor(element(by.id('game-screen')))
  .toBeVisible()
  .withTimeout(5000);
```

### Изоляция тестов

Каждый тест должен быть независимым:

```typescript
beforeEach(async () => {
  await device.reloadReactNative();
});
```

## Отладка

### Режим отладки

```bash
# Запуск с детальным логированием
detox test --loglevel trace --configuration ios.sim.debug
```

### Скриншоты

Detox автоматически делает скриншоты при падении тестов. Они сохраняются в `artifacts/`.

### Видеозапись

```bash
# Включить видеозапись тестов
detox test --record-videos all --configuration ios.sim.debug
```

## CI/CD Integration

Эти тесты предназначены для запуска в CI/CD pipeline (GitHub Actions):

```yaml
e2e-tests-ios:
  runs-on: macos-latest
  steps:
    - uses: actions/checkout@v3
    - run: npm ci
    - run: cd ios && pod install
    - run: npm run build:e2e:ios
    - run: npm run test:e2e:ios
```

## Известные ограничения

1. **Полное решение судоку**: Тесты не решают полностью головоломку из-за длительности. Вместо этого тестируется структура и основные взаимодействия.

2. **Визуальные проверки**: Detox ограничен в визуальных проверках (цвета, точные размеры). Фокус на функциональном тестировании.

3. **Производительность**: E2E тесты медленнее unit/integration тестов. Запускайте их реже.

## Troubleshooting

### iOS: Simulator не найден
```bash
xcrun simctl list devices
# Убедитесь, что iPhone 14 Pro доступен
```

### Android: Emulator не запускается
```bash
emulator -list-avds
# Проверьте, что Pixel_4a_API_31 существует
```

### Тесты падают с timeout
- Увеличьте `timeout` в `e2e/jest.config.js`
- Убедитесь, что Metro bundler запущен
- Проверьте производительность эмулятора

## Дополнительная информация

- [Detox Documentation](https://wix.github.io/Detox/)
- [Testing Strategy](../2.3.4-testing-strategy.md)
- [Project Plan](../PROJECT_PLAN.md)

---

**Версия**: 1.0
**Дата**: 1 октября 2025
