/**
 * Theme Configurations
 * Конфигурации светлой и темной тем согласно бизнес-анализу (1.3.6)
 */

import { ThemeConfig, ThemeColors } from '../../domain/types/ThemeTypes';
import { ThemeType } from '../../domain/types/SettingsTypes';

/**
 * Светлая тема - "Pure Light"
 * Оптимизирована для использования днем, максимальная четкость и контраст
 * Соответствует бизнес-анализу раздел 1.3.6
 */
const lightColors: ThemeColors = {
  // Основные поверхности
  surfacePrimary: '#FFFFFF',      // Чистый белый для максимальной четкости
  surfaceSecondary: '#F8F9FA',    // Нейтральный фон для панелей
  surfaceTertiary: '#E9ECEF',     // Разделители и границы
  surfaceElevated: '#FFFFFF',     // Поднятые элементы
  surfaceOverlay: 'rgba(0, 0, 0, 0.02)', // Тонкие наложения

  // Игровое поле Судоку
  cellBackground: '#FFFFFF',
  cellBorder: '#DEE2E6',
  cellBorderThick: '#6C757D',     // Границы блоков 3x3
  cellPrefilled: '#F8F9FA',       // Предзаполненные ячейки
  cellUserInput: '#FFFFFF',       // Пользовательский ввод
  cellSelected: '#E3F2FD',        // Выбранная ячейка
  cellHighlighted: '#FFF8E1',     // Подсвеченные связанные
  cellSameNumber: '#E8F5E8',      // Ячейки с тем же числом
  cellError: '#FFEBEE',           // Ошибочные ячейки
  cellHint: '#E1F5FE',            // Ячейки с подсказками

  // Текст и числа
  textPrimary: '#212529',         // Основной текст - максимальный контраст
  textSecondary: '#6C757D',       // Вторичный текст
  textDisabled: '#ADB5BD',        // Неактивный текст
  numberPrefilled: '#495057',     // Предзаполненные числа
  numberUser: '#212529',          // Пользовательские числа
  numberError: '#DC3545',         // Ошибочные числа
  numberHint: '#0056B3',          // Числа подсказок
  numberNotes: '#6C757D',         // Заметки в ячейках

  // Интерактивные элементы
  primaryColor: '#6610F2',        // Основной акцентный
  primaryHover: '#5A0FC8',        // При наведении
  primaryActive: '#4E0AA0',       // При нажатии
  successColor: '#28A745',        // Успешные действия
  warningColor: '#FFC107',        // Предупреждения
  errorColor: '#DC3545',          // Ошибки
  infoColor: '#17A2B8',           // Информационные элементы

  // Кнопки и управление
  buttonBackground: '#F8F9FA',
  buttonBorder: '#DEE2E6',
  buttonHover: '#E9ECEF',
  buttonActive: '#DEE2E6',
  buttonDisabled: '#F8F9FA',
  buttonPrimary: '#6610F2',
  buttonPrimaryHover: '#5A0FC8',

  // Тени и эффекты
  shadowLight: '0 2px 4px rgba(0, 0, 0, 0.1)',
  shadowMedium: '0 4px 8px rgba(0, 0, 0, 0.12)',
  shadowHeavy: '0 8px 16px rgba(0, 0, 0, 0.15)',
  focusRing: '0 0 0 3px rgba(102, 16, 242, 0.25)',
};

/**
 * Темная тема - "Deep Dark"
 * Оптимизирована для использования вечером/ночью, снижает нагрузку на глаза
 * Поддерживает OLED экраны с истинно черным цветом
 * Соответствует бизнес-анализу раздел 1.3.6
 */
const darkColors: ThemeColors = {
  // Основные поверхности - Material Design 3 подход
  surfacePrimary: '#121212',      // Истинно черный для OLED
  surfaceSecondary: '#1E1E1E',    // Приподнятые поверхности
  surfaceTertiary: '#2D2D2D',     // Еще более приподнятые
  surfaceElevated: '#252525',     // Максимальная высота
  surfaceOverlay: 'rgba(255, 255, 255, 0.05)', // Светлые наложения

  // Игровое поле Судоку - оптимизировано для контраста
  cellBackground: '#1A1A1A',
  cellBorder: '#404040',
  cellBorderThick: '#606060',     // Границы блоков 3x3
  cellPrefilled: '#252525',       // Предзаполненные ячейки
  cellUserInput: '#1A1A1A',       // Пользовательский ввод
  cellSelected: '#0D47A1',        // Выбранная ячейка - глубокий синий
  cellHighlighted: '#3E2723',     // Подсвеченные связанные - коричневый
  cellSameNumber: '#1B5E20',      // Ячейки с тем же числом - зеленый
  cellError: '#B71C1C',           // Ошибочные ячейки - красный
  cellHint: '#01579B',            // Ячейки с подсказками - циан

  // Текст и числа - высокий контраст для комфорта
  textPrimary: '#E8EAED',         // Основной текст - теплый белый
  textSecondary: '#9AA0A6',       // Вторичный текст
  textDisabled: '#5F6368',        // Неактивный текст
  numberPrefilled: '#BDC1C6',     // Предзаполненные числа
  numberUser: '#E8EAED',          // Пользовательские числа
  numberError: '#F28B82',         // Ошибочные числа - мягкий красный
  numberHint: '#8AB4F8',          // Числа подсказок - мягкий голубой
  numberNotes: '#9AA0A6',         // Заметки в ячейках

  // Интерактивные элементы - адаптированные для темной темы
  primaryColor: '#8AB4F8',        // Основной акцентный - светлее для контраста
  primaryHover: '#A8C7FA',        // При наведении
  primaryActive: '#669DF6',       // При нажатии
  successColor: '#81C995',        // Успешные действия
  warningColor: '#FDD663',        // Предупреждения
  errorColor: '#F28B82',          // Ошибки
  infoColor: '#78D9EC',           // Информационные элементы

  // Кнопки и управление
  buttonBackground: '#2D2D2D',
  buttonBorder: '#404040',
  buttonHover: '#3C3C3C',
  buttonActive: '#464646',
  buttonDisabled: '#1E1E1E',
  buttonPrimary: '#8AB4F8',
  buttonPrimaryHover: '#A8C7FA',

  // Тени и эффекты - адаптированы для темной темы
  shadowLight: '0 2px 4px rgba(0, 0, 0, 0.3)',
  shadowMedium: '0 4px 8px rgba(0, 0, 0, 0.4)',
  shadowHeavy: '0 8px 16px rgba(0, 0, 0, 0.5)',
  focusRing: '0 0 0 3px rgba(138, 180, 248, 0.4)',
};

/**
 * Конфигурация светлой темы
 */
export const lightTheme: ThemeConfig = {
  id: ThemeType.LIGHT,
  name: 'Светлая',
  description: 'Классическая светлая тема для дневного использования',
  colors: lightColors,
};

/**
 * Конфигурация темной темы
 */
export const darkTheme: ThemeConfig = {
  id: ThemeType.DARK,
  name: 'Темная',
  description: 'Темная тема для комфортной игры вечером и ночью',
  colors: darkColors,
};

/**
 * Мапа всех доступных тем
 */
export const themes = {
  light: lightTheme,
  dark: darkTheme,
} as const;

/**
 * Получить конфигурацию темы по ID
 */
export function getThemeConfig(themeId: 'light' | 'dark'): ThemeConfig {
  return themes[themeId];
}
