import { TextStyle } from 'react-native';

// Типографика согласно бизнес-анализу 1.3-ui-ux-design.md
export const Typography = {
  // Размеры шрифтов
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Высота строк
  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 44,
    '4xl': 52,
    '5xl': 64,
  },

  // Веса шрифтов
  fontWeight: {
    normal: '400' as TextStyle['fontWeight'],
    medium: '500' as TextStyle['fontWeight'],
    semibold: '600' as TextStyle['fontWeight'],
    bold: '700' as TextStyle['fontWeight'],
  },

  // Готовые стили текста
  heading1: {
    fontSize: 36,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 52,
  },

  heading2: {
    fontSize: 30,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 44,
  },

  heading3: {
    fontSize: 24,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 36,
  },

  heading4: {
    fontSize: 20,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 32,
  },

  body1: {
    fontSize: 16,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 24,
  },

  body2: {
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 20,
  },

  caption: {
    fontSize: 12,
    fontWeight: '400' as TextStyle['fontWeight'],
    lineHeight: 16,
  },

  button: {
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 24,
  },

  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 20,
  },
} as const;

export type TypographyVariant = keyof typeof Typography;