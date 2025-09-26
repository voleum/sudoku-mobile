// Цветовая схема согласно бизнес-анализу 1.3-ui-ux-design.md
export const Colors = {
  // Основные цвета приложения
  primary: '#007AFF',
  primaryDark: '#0056B3',
  primaryLight: '#66B2FF',

  // Цвета уровней сложности
  difficulty: {
    beginner: '#4CAF50',    // Зеленый - новичок
    easy: '#FFC107',        // Желтый - легкий
    medium: '#FF9800',      // Оранжевый - средний
    hard: '#F44336',        // Красный - сложный
    expert: '#424242',      // Черный - экспертный
  },

  // Нейтральные цвета
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Семантические цвета
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Фон и поверхности
  background: '#FFFFFF',
  backgroundSecondary: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',

  // Текст
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  // Границы
  border: '#E5E7EB',
  divider: '#F3F4F6',

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.25)',

  // Прозрачность
  overlay: 'rgba(0, 0, 0, 0.5)',
  backdropLight: 'rgba(255, 255, 255, 0.95)',
} as const;

export type ColorName = keyof typeof Colors;