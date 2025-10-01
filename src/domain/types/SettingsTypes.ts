import { DifficultyLevel } from './GameTypes';
import { VibrationIntensity } from './AudioTypes';

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

export enum Language {
  RU = 'ru',  // Русский
  EN = 'en'   // English
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
  autoCheckComplete: boolean;   // Автоматическая проверка завершения

  // Специальные режимы
  zenMode: boolean;             // Дзен-режим для расслабления
}

export interface UISettings {
  // Язык интерфейса
  language: Language;

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
  // Основные настройки
  soundEnabled: boolean;
  soundVolume: number;        // 0-100

  // Типы звуков (индивидуальное включение/выключение)
  cellPlacementSound: boolean;
  errorSound: boolean;
  successSound: boolean;
  hintSound: boolean;
  completionSound: boolean;
  achievementSound: boolean;  // Звук достижения
  uiSound: boolean;           // Звуки UI (кнопки, меню)

  // Дополнительные настройки
  vibrationEnabled: boolean;  // Тактильная обратная связь
  vibrationIntensity: VibrationIntensity; // Интенсивность вибрации

  // Уведомления (расширенная функциональность - @future)
  notificationsEnabled?: boolean;
  dailyReminder?: boolean;
  reminderTime?: string;      // "20:00"
  achievementNotifications?: boolean;

  // Дзен-режим и релаксация (@future)
  zenAmbientSounds?: boolean;  // Фоновые звуки для дзен-режима
  zenMusicEnabled?: boolean;   // Медитативная музыка
}

export interface AdvancedSettings {
  // Производительность
  animationQuality: Quality;
  autoSaveInterval: number;    // секунды
  pauseOnMinimize: boolean;    // Пауза при сворачивании

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
  autoCheckComplete: false,
  zenMode: false,
};

export const DEFAULT_UI_SETTINGS: UISettings = {
  language: Language.RU,
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
  // Основные настройки
  soundEnabled: true,
  soundVolume: 70,

  // Типы звуков
  cellPlacementSound: true,
  errorSound: true,
  successSound: true,
  hintSound: true,
  completionSound: true,
  achievementSound: true,
  uiSound: true,

  // Дополнительные настройки
  vibrationEnabled: false, // Выключена по умолчанию
  vibrationIntensity: VibrationIntensity.MEDIUM, // Средняя интенсивность по умолчанию

  // Уведомления (опциональные)
  notificationsEnabled: true,
  dailyReminder: false,
  reminderTime: '20:00',
  achievementNotifications: true,

  // Дзен-режим (опциональные)
  zenAmbientSounds: false,
  zenMusicEnabled: false,
};

export const DEFAULT_ADVANCED_SETTINGS: AdvancedSettings = {
  animationQuality: Quality.MEDIUM,
  autoSaveInterval: 30,
  pauseOnMinimize: true,
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