import { DifficultyLevel } from './GameTypes';

// Базовые перечисления для настроек
export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  AUTO = 'auto'
}

export enum ColorScheme {
  CLASSIC = 'classic',     // Синий/серый
  MODERN = 'modern',       // Материальные цвета
  COLORFUL = 'colorful',   // Яркие цвета
  ACCESSIBLE = 'accessible' // Высокий контраст
}

export enum CellSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

export enum FontSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large'
}

export enum NumberStyle {
  CLASSIC = 'classic',
  MODERN = 'modern',
  HANDWRITTEN = 'handwritten'
}

export enum AnimationSpeed {
  SLOW = 'slow',
  NORMAL = 'normal',
  FAST = 'fast'
}

export enum Quality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Интерфейсы настроек согласно бизнес-анализу
export interface GameplaySettings {
  // Сложность и подсказки
  defaultDifficulty: DifficultyLevel;
  hintsEnabled: boolean;
  hintsLimit: number;           // Максимум подсказок за игру
  showRemainingNumbers: boolean; // Показывать оставшиеся цифры

  // Обработка ошибок
  errorHighlighting: boolean;   // Подсвечивать ошибки
  preventInvalidMoves: boolean; // Блокировать неверные ходы
  showConflictingCells: boolean; // Показывать конфликты

  // Автозаполнение и помощь
  autoMarkNotes: boolean;       // Автоматические заметки
  showPossibleValues: boolean;  // Показывать возможные значения
  highlightSameNumbers: boolean; // Подсвечивать одинаковые цифры
}

export interface UISettings {
  // Тема оформления
  theme: ThemeType;
  colorScheme: ColorScheme;

  // Отображение
  showTimer: boolean;
  showMoveCounter: boolean;
  showErrorCounter: boolean;
  showHintCounter: boolean;

  // Размеры и шрифты
  cellSize: CellSize;
  fontSize: FontSize;
  numbersStyle: NumberStyle;

  // Анимации
  animationsEnabled: boolean;
  animationSpeed: AnimationSpeed;
  vibrationEnabled: boolean;  // Только для мобильных
}

export interface AudioSettings {
  // Звуковые эффекты
  soundEnabled: boolean;
  soundVolume: number;        // 0-100

  // Типы звуков
  cellPlacementSound: boolean;
  errorSound: boolean;
  successSound: boolean;
  hintSound: boolean;
  completionSound: boolean;

  // Уведомления
  notificationsEnabled: boolean;
  dailyReminder: boolean;
  reminderTime: string;      // "20:00"
  achievementNotifications: boolean;
}

export interface AdvancedSettings {
  // Производительность
  animationQuality: Quality;
  autoSaveInterval: number;    // секунды

  // Данные и приватность
  analyticsEnabled: boolean;
  crashReportsEnabled: boolean;
  cloudSyncEnabled: boolean;

  // Разработка (только для debug билдов)
  debugMode: boolean;
  showPerformanceMetrics: boolean;
}

// Объединенный интерфейс всех настроек
export interface AppSettings {
  gameplay: GameplaySettings;
  ui: UISettings;
  audio: AudioSettings;
  advanced: AdvancedSettings;
}

// Типы профилей настроек
export enum SettingsProfile {
  CLASSIC = 'classic',         // Стандартные настройки
  MODERN = 'modern',          // С подсказками и автозаполнением
  MINIMALIST = 'minimalist',  // Без подсказок
  BEGINNER = 'beginner',      // Максимальная помощь
  EXPERT = 'expert'           // Строгий режим без помощи
}

export interface ProfileInfo {
  id: SettingsProfile;
  name: string;
  description: string;
  settings: AppSettings;
}

// Настройки по умолчанию
export const DEFAULT_GAMEPLAY_SETTINGS: GameplaySettings = {
  defaultDifficulty: 'medium',
  hintsEnabled: true,
  hintsLimit: 3,
  showRemainingNumbers: true,
  errorHighlighting: true,
  preventInvalidMoves: false,
  showConflictingCells: true,
  autoMarkNotes: false,
  showPossibleValues: false,
  highlightSameNumbers: true,
};

export const DEFAULT_UI_SETTINGS: UISettings = {
  theme: ThemeType.AUTO,
  colorScheme: ColorScheme.MODERN,
  showTimer: true,
  showMoveCounter: true,
  showErrorCounter: true,
  showHintCounter: true,
  cellSize: CellSize.MEDIUM,
  fontSize: FontSize.MEDIUM,
  numbersStyle: NumberStyle.MODERN,
  animationsEnabled: true,
  animationSpeed: AnimationSpeed.NORMAL,
  vibrationEnabled: true,
};

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  soundEnabled: true,
  soundVolume: 70,
  cellPlacementSound: true,
  errorSound: true,
  successSound: true,
  hintSound: true,
  completionSound: true,
  notificationsEnabled: true,
  dailyReminder: false,
  reminderTime: '20:00',
  achievementNotifications: true,
};

export const DEFAULT_ADVANCED_SETTINGS: AdvancedSettings = {
  animationQuality: Quality.MEDIUM,
  autoSaveInterval: 30,
  analyticsEnabled: true,
  crashReportsEnabled: true,
  cloudSyncEnabled: false,
  debugMode: false,
  showPerformanceMetrics: false,
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
  gameplay: DEFAULT_GAMEPLAY_SETTINGS,
  ui: DEFAULT_UI_SETTINGS,
  audio: DEFAULT_AUDIO_SETTINGS,
  advanced: DEFAULT_ADVANCED_SETTINGS,
};