/**
 * Sudoku Game React Native App
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './src/presentation/screens/Home';
import { useGameStore } from './src/application/stores/gameStore';

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const cleanup = useGameStore(state => state.cleanup);

  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <HomeScreen />
    </SafeAreaProvider>
  );
}

export default App;
