/**
 * Theme Types
 * Типы для системы тем приложения согласно бизнес-анализу (1.3.6)
 */

import { ThemeType } from './SettingsTypes';

// Реэкспорт ThemeType для использования в других модулях
export { ThemeType };

/**
 * Цветовая палитра темы
 * Полная цветовая схема согласно бизнес-анализу (раздел 1.3.6)
 */
export interface ThemeColors {
  // Основные поверхности
  surfacePrimary: string;      // Основной фон
  surfaceSecondary: string;    // Вторичный фон (панели)
  surfaceTertiary: string;     // Третичный фон (разделители)
  surfaceElevated: string;     // Поднятые элементы
  surfaceOverlay: string;      // Наложения

  // Игровое поле Судоку
  cellBackground: string;      // Фон ячейки
  cellBorder: string;          // Тонкая граница ячейки
  cellBorderThick: string;     // Толстая граница блока 3x3
  cellPrefilled: string;       // Предзаполненные ячейки
  cellUserInput: string;       // Пользовательский ввод
  cellSelected: string;        // Выбранная ячейка
  cellHighlighted: string;     // Подсвеченные связанные
  cellSameNumber: string;      // Ячейки с тем же числом
  cellError: string;           // Ошибочные ячейки
  cellHint: string;            // Ячейки с подсказками

  // Текст и числа
  textPrimary: string;         // Основной текст
  textSecondary: string;       // Вторичный текст
  textDisabled: string;        // Неактивный текст
  numberPrefilled: string;     // Предзаполненные числа
  numberUser: string;          // Пользовательские числа
  numberError: string;         // Ошибочные числа
  numberHint: string;          // Числа подсказок
  numberNotes: string;         // Заметки в ячейках

  // Интерактивные элементы
  primaryColor: string;        // Основной акцентный
  primaryHover: string;        // При наведении
  primaryActive: string;       // При нажатии
  successColor: string;        // Успешные действия
  warningColor: string;        // Предупреждения
  errorColor: string;          // Ошибки
  infoColor: string;           // Информационные элементы

  // Кнопки и управление
  buttonBackground: string;
  buttonBorder: string;
  buttonHover: string;
  buttonActive: string;
  buttonDisabled: string;
  buttonPrimary: string;
  buttonPrimaryHover: string;

  // Тени и эффекты
  shadowLight: string;
  shadowMedium: string;
  shadowHeavy: string;
  focusRing: string;
}

/**
 * Конфигурация темы
 */
export interface ThemeConfig {
  id: ThemeType;
  name: string;
  description: string;
  colors: ThemeColors;
}

/**
 * Типы конкретных тем
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Контекст темы для использования в компонентах
 */
export interface ThemeContextType {
  // Текущая тема
  theme: ThemeType;

  // Активная цветовая палитра (resolved для 'auto')
  colors: ThemeColors;

  // Является ли тема темной (для условной логики)
  isDark: boolean;

  // Методы управления темой
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

/**
 * Настройки автоматической темы
 *
 * @future Расширенные настройки для auto-темы согласно бизнес-анализу 1.3.6
 * Планируется к реализации в следующих итерациях
 */
export interface AutoThemeSettings {
  // Следовать системным настройкам
  followSystemSettings: boolean;

  // Следовать времени заката/восхода
  followSunset: boolean;

  // Плавные переходы
  gradualTransition: boolean;

  // Использовать датчик освещения (если доступен)
  useAmbientLightSensor: boolean;

  // Время перехода (мс)
  transitionDuration: number;
}

/**
 * Системные предпочтения
 *
 * @future Поддержка accessibility features согласно бизнес-анализу 1.3.6
 * Планируется интеграция с prefers-color-scheme, prefers-contrast,
 * prefers-reduced-motion, prefers-reduced-transparency
 */
export interface SystemPreferences {
  colorScheme: 'light' | 'dark' | 'no-preference';
  contrast: 'normal' | 'high' | 'low' | 'no-preference';
  motion: 'full' | 'reduced' | 'no-preference';
  transparency: 'full' | 'reduced' | 'no-preference';
}

/**
 * Настройки по умолчанию для автоматической темы
 */
export const DEFAULT_AUTO_THEME_SETTINGS: AutoThemeSettings = {
  followSystemSettings: true,
  followSunset: false,
  gradualTransition: true,
  useAmbientLightSensor: false,
  transitionDuration: 800,
};
