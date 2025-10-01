/**
 * Theme Context
 * Контекст темы для управления темами в приложении
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeType, ThemeColors, ThemeContextType } from '../../domain/types/ThemeTypes';
import { lightTheme, darkTheme } from './themes';
import { useSettingsStore } from '../../application/stores/settingsStore';
import { ThemeType as ThemeTypeEnum } from '../../domain/types/SettingsTypes';

/**
 * Создание контекста темы
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Props для ThemeProvider
 */
interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider
 * Провайдер темы для всего приложения
 *
 * Функционал:
 * - Управление текущей темой (light/dark/auto)
 * - Автоматическое переключение темы при режиме 'auto'
 * - Синхронизация с системной темой
 * - Синхронизация с настройками в gameStore
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const settings = useSettingsStore((state) => state.settings);
  const updateUISettings = useSettingsStore((state) => state.updateUISettings);

  // Текущая активная тема (resolved для 'auto')
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>(() => {
    if (settings.ui.theme === 'auto') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return settings.ui.theme as 'light' | 'dark';
  });

  // Отслеживание изменений системной темы и настроек
  useEffect(() => {
    if (settings.ui.theme === 'auto') {
      const newTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
      setActiveTheme(newTheme);
    } else {
      setActiveTheme(settings.ui.theme as 'light' | 'dark');
    }
  }, [systemColorScheme, settings.ui.theme]);

  // Получение цветов текущей темы
  const colors: ThemeColors = activeTheme === 'dark' ? darkTheme.colors : lightTheme.colors;

  // Установка новой темы
  const setTheme = (theme: ThemeType) => {
    updateUISettings({
      theme,
    });

    // Если тема не 'auto', сразу применяем
    if (theme !== 'auto') {
      setActiveTheme(theme === 'light' ? 'light' : 'dark');
    } else {
      // Для 'auto' используем системную тему
      const newTheme = systemColorScheme === 'dark' ? 'dark' : 'light';
      setActiveTheme(newTheme);
    }
  };

  // Переключение между светлой и темной темой
  const toggleTheme = () => {
    const newTheme = activeTheme === 'light' ? ThemeTypeEnum.DARK : ThemeTypeEnum.LIGHT;
    setTheme(newTheme);
  };

  const value: ThemeContextType = {
    theme: settings.ui.theme,
    colors,
    isDark: activeTheme === 'dark',
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * useTheme Hook
 * Хук для использования темы в компонентах
 *
 * @returns ThemeContextType
 * @throws Error if used outside ThemeProvider
 *
 * @example
 * const { colors, isDark, setTheme } = useTheme();
 * const styles = StyleSheet.create({
 *   container: {
 *     backgroundColor: colors.surfacePrimary,
 *   },
 * });
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
