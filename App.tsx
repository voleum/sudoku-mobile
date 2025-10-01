/**
 * Sudoku Game React Native App
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/presentation/screens/Home';
import { useGameStore } from './src/application/stores/gameStore';
import { ThemeProvider, useTheme } from './src/presentation/theme';

/**
 * AppContent - внутренний компонент для использования темы
 */
function AppContent(): React.JSX.Element {
  const { isDark } = useTheme();
  const cleanup = useGameStore(state => state.cleanup);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <HomeScreen />
    </>
  );
}

/**
 * App - корневой компонент приложения
 */
function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
