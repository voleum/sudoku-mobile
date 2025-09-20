# 🎯 Sudoku Game - React Native

Кросплатформенная игра Судоку для Android и iOS, построенная на React Native с TypeScript.

## 🏗️ Архитектура

Проект использует **Clean Architecture** с четким разделением слоев:

```
src/
├── domain/           # Бизнес-логика и правила игры
├── application/      # Use cases и состояние приложения
├── infrastructure/   # Внешние сервисы и хранилище
├── presentation/     # UI компоненты и экраны
└── shared/          # Общие утилиты и типы
```

## 🛠️ Технологический стек

- **React Native** 0.81.4 + **TypeScript**
- **Zustand** - управление состоянием
- **React Navigation** 6.x - навигация
- **React Native Elements UI** - UI компоненты
- **MMKV** - быстрое локальное хранилище
- **SQLite** - база данных для статистики
- **React Query** - управление данными

## 🚀 Быстрый старт

### Предварительные требования

- Node.js >= 20.19.4
- React Native development environment
- Android Studio (для Android)
- Xcode (для iOS, только macOS)

### Установка

```bash
# Клонирование репозитория
git clone <repository-url>
cd SudokuGame

# Установка зависимостей
npm install

# iOS дополнительно (только macOS)
cd ios && pod install && cd ..
```

### Запуск

```bash
# Запуск Metro bundler
npm start

# Android
npm run android

# iOS (только macOS)
npm run ios
```

### Команды разработки

```bash
# Проверка типов
npm run typecheck

# Линтинг
npm run lint
npm run lint:fix

# Тестирование
npm test

# Очистка кэша
npm run clean
```

## 📁 Структура проекта

### Domain Layer (`src/domain/`)
- `entities/` - Основные сущности (Game, Player, Statistics)
- `interfaces/` - Контракты для репозиториев
- `rules/` - Правила игры Судоку
- `types/` - Типы домена

### Application Layer (`src/application/`)
- `usecases/` - Сценарии использования
- `stores/` - Zustand стораредакторы состояния
- `services/` - Сервисы приложения

### Infrastructure Layer (`src/infrastructure/`)
- `repositories/` - Реализации репозиториев
- `services/` - Внешние сервисы
- `storage/` - Работа с хранилищем
- `di/` - Dependency Injection

### Presentation Layer (`src/presentation/`)
- `screens/` - Экраны приложения
- `components/` - Переиспользуемые компоненты
- `navigation/` - Конфигурация навигации
- `hooks/` - Пользовательские хуки
- `styles/` - Стили и темы

## 🎮 Функциональность

### Основные фичи
- ✅ Генерация пазлов Судоку (4 уровня сложности)
- ✅ Проверка корректности ходов
- ✅ Система подсказок
- ✅ Таймер и счетчик ходов
- ✅ Сохранение/загрузка игр
- ✅ Статистика игрока
- ✅ Темная и светлая темы
- ✅ Локализация (EN/RU)

### Дополнительные возможности
- 🔄 Отмена ходов
- 📊 Система достижений
- 🎵 Звуковые эффекты
- 📱 Адаптивный дизайн

## 🧪 Тестирование

```bash
# Запуск всех тестов
npm test

# Тесты в watch режиме
npm test -- --watch

# Покрытие кода
npm test -- --coverage
```

### Типы тестов
- **Unit тесты** - логика игры (`src/domain/`)
- **Integration тесты** - use cases (`src/application/`)
- **Component тесты** - React компоненты
- **E2E тесты** - полные пользовательские сценарии

## 📝 Соглашения о коде

### TypeScript
- Строгий режим включен
- Все компоненты типизированы
- Использование алиасов путей (`@/`, `@components/`, `@domain/`)

### Git Flow
- `main` - продакшн ветка
- `develop` - ветка разработки
- `feature/*` - фичи
- `bugfix/*` - исправления
- `hotfix/*` - критические исправления

### Commit Convention
```
type(scope): description

feat(game): add hint system
fix(ui): resolve button alignment issue
docs(readme): update installation guide
```

## 🔧 Настройка IDE

### VS Code
Рекомендуемые расширения:
- React Native Tools
- TypeScript Importer
- ESLint
- Prettier
- Auto Rename Tag

## 🐛 Отладка

### React Native Debugger
```bash
# Установка
npm install -g react-native-debugger

# Запуск
react-native-debugger
```

### Flipper
- Встроенная поддержка сетевых запросов
- Просмотр состояния Redux/Zustand
- Профилирование производительности

## 📦 Сборка

### Отладочная сборка
```bash
# Android
npm run android

# iOS
npm run ios
```

### Продакшн сборка
```bash
# Android APK
cd android && ./gradlew assembleRelease

# Android Bundle
cd android && ./gradlew bundleRelease

# iOS
# Используйте Xcode для создания Archive
```

## 🌐 Локализация

Поддерживаемые языки:
- 🇺🇸 English (по умолчанию)
- 🇷🇺 Русский

Файлы локализации: `src/shared/localization/`

## 📈 Производительность

### Оптимизации
- Мемоизация дорогих вычислений
- Lazy loading экранов
- Оптимизация рендеринга списков
- Кэширование изображений

### Мониторинг
- Bundle analyzer для размера
- Performance мониторинг
- Crash reporting

## 🤝 Внесение изменений

1. Создайте feature ветку
2. Внесите изменения
3. Добавьте тесты
4. Убедитесь что проходят все проверки
5. Создайте Pull Request

## 📞 Поддержка

- **Разработчик**: voleum
- **Документация**: [Project docs](../sudoku/PROJECT_PLAN.md)
- **Issues**: GitHub Issues

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE) файл

---

Разработано с ❤️ с использованием [Claude Code](https://claude.ai/code)