import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useGameStore } from '../../../application/stores/gameStore';
import { CellPosition, CellValue } from '../../../domain/types/GameTypes';
import { SudokuBoard, NumberPad, GameHeader } from '../../components/game';
import { Colors } from '../../styles/colors';
import { Spacing } from '../../styles/spacing';

export const GameScreen: React.FC = () => {
  const {
    currentGame,
    selectedCell,
  } = useGameStore();

  // Mock methods for now until GameStore is implemented
  const setSelectedCell = useCallback((position: CellPosition | null) => {
    console.log('setSelectedCell:', position);
  }, []);

  const makeMove = useCallback((position: CellPosition, value: CellValue) => {
    console.log('makeMove:', position, value);
    return true;
  }, []);

  const getConflictingCells = useCallback(() => {
    console.log('getConflictingCells');
    return [];
  }, []);

  const getHintCells = useCallback(() => {
    console.log('getHintCells');
    return [];
  }, []);

  const clearCell = useCallback((position: CellPosition) => {
    console.log('clearCell:', position);
  }, []);

  const getHint = useCallback(() => {
    console.log('getHint');
  }, []);

  const undoMove = useCallback(() => {
    console.log('undoMove');
  }, []);

  const canUndo = false;
  const gameStartTime = new Date();
  const elapsedTime = 0;
  const movesCount = 0;
  const hintsRemaining = 3;

  // Локальное состояние для UI
  const [notesMode, setNotesMode] = useState(false);
  const [cellNotes, setCellNotes] = useState<{ [key: string]: number[] }>({});
  const [isPaused] = useState(false);

  // Создание ключа для заметок ячейки
  const getCellNotesKey = useCallback((position: CellPosition): string => {
    return `${position.row}-${position.col}`;
  }, []);

  // Обработка нажатия на ячейку
  const handleCellPress = useCallback((position: CellPosition) => {
    if (!currentGame) return;

    // Если ячейка уже выбрана, снимаем выделение
    if (selectedCell &&
        selectedCell.row === position.row &&
        selectedCell.col === position.col) {
      setSelectedCell(null);
    } else {
      // Выбираем новую ячейку
      setSelectedCell(position);
    }
  }, [currentGame, selectedCell, setSelectedCell]);

  // Обработка долгого нажатия (переключение режима заметок для ячейки)
  const handleCellLongPress = useCallback((position: CellPosition) => {
    if (!currentGame) return;

    // Переключаем режим заметок для данной ячейки
    setNotesMode(prev => !prev);
    setSelectedCell(position);
  }, [currentGame, setSelectedCell]);

  // Обработчики игровых действий
  const handleClearCell = useCallback(() => {
    if (selectedCell && clearCell) {
      clearCell(selectedCell);
      // Очищаем заметки для этой ячейки
      const notesKey = getCellNotesKey(selectedCell);
      setCellNotes(prev => {
        const updated = { ...prev };
        delete updated[notesKey];
        return updated;
      });
    }
  }, [selectedCell, clearCell, getCellNotesKey]);

  const handleGetHint = useCallback(() => {
    if (getHint) {
      getHint();
    }
  }, [getHint]);

  const handleUndoMove = useCallback(() => {
    if (undoMove) {
      undoMove();
    }
  }, [undoMove]);

  const handleToggleNotesMode = useCallback(() => {
    setNotesMode(prev => !prev);
  }, []);

  // Получение конфликтующих ячеек
  const conflictCells = useMemo(() => {
    if (!currentGame || !currentGame.grid) return [];
    return getConflictingCells();
  }, [currentGame, getConflictingCells]);

  // Получение ячеек с подсказками
  const hintCells = useMemo(() => {
    return getHintCells();
  }, [getHintCells]);

  // Поиск следующей пустой ячейки для автоматического перехода
  const findNextEmptyCell = useCallback((currentPosition: CellPosition): CellPosition | null => {
    if (!currentGame) return null;

    const { grid } = currentGame;
    const startRow = currentPosition.row;
    const startCol = currentPosition.col;

    // Ищем следующую пустую ячейку по порядку
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        // Начинаем поиск с текущей позиции + 1
        const currentIndex = row * 9 + col;
        const startIndex = startRow * 9 + startCol;

        if (currentIndex > startIndex && grid[row][col] === 0) {
          return {
            row,
            col,
            box: Math.floor(row / 3) * 3 + Math.floor(col / 3)
          };
        }
      }
    }

    // Если не найдено после текущей позиции, ищем с начала
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          return {
            row,
            col,
            box: Math.floor(row / 3) * 3 + Math.floor(col / 3)
          };
        }
      }
    }

    return null;
  }, [currentGame]);

  // Обработка ввода числа в выбранную ячейку
  const handleNumberInput = useCallback((value: CellValue) => {
    if (!selectedCell || !currentGame) return;

    const { row, col } = selectedCell;

    // Проверяем, можно ли редактировать эту ячейку
    const isFixedCell = currentGame.originalGrid[row][col] !== 0;
    if (isFixedCell) return;

    if (notesMode && value !== 0) {
      // Режим заметок - добавляем/удаляем заметку
      const notesKey = getCellNotesKey(selectedCell);
      const currentNotes = cellNotes[notesKey] || [];

      if (currentNotes.includes(value)) {
        // Удаляем заметку
        const updatedNotes = currentNotes.filter(note => note !== value);
        setCellNotes(prev => ({
          ...prev,
          [notesKey]: updatedNotes,
        }));
      } else {
        // Добавляем заметку
        setCellNotes(prev => ({
          ...prev,
          [notesKey]: [...currentNotes, value].sort(),
        }));
      }
    } else {
      // Обычный режим - устанавливаем значение ячейки
      const success = makeMove(selectedCell, value);

      if (success && value !== 0) {
        // Очищаем заметки для этой ячейки
        const notesKey = getCellNotesKey(selectedCell);
        setCellNotes(prev => {
          const updated = { ...prev };
          delete updated[notesKey];
          return updated;
        });

        // Переходим к следующей пустой ячейке (UX улучшение)
        const nextEmptyCell = findNextEmptyCell(selectedCell);
        if (nextEmptyCell) {
          setSelectedCell(nextEmptyCell);
        }
      }
    }
  }, [
    selectedCell,
    currentGame,
    notesMode,
    cellNotes,
    getCellNotesKey,
    makeMove,
    setSelectedCell,
    findNextEmptyCell
  ]);

  // Получение количества оставшихся цифр для каждого числа
  const getRemainingCounts = useCallback(() => {
    if (!currentGame) return {};

    const counts: { [key: number]: number } = {};
    for (let num = 1; num <= 9; num++) {
      let count = 0;
      for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
          if (currentGame.grid[row][col] === num) {
            count++;
          }
        }
      }
      counts[num] = Math.max(0, 9 - count);
    }
    return counts;
  }, [currentGame]);

  const remainingCounts = useMemo(() => getRemainingCounts(), [getRemainingCounts]);

  // Если нет текущей игры, показываем заглушку
  if (!currentGame) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          {/* TODO: Добавить компонент загрузки или сообщение о необходимости начать игру */}
        </View>
      </SafeAreaView>
    );
  }

  // Получаем размеры экрана для адаптивной верстки
  const { height: screenHeight } = Dimensions.get('window');
  const isSmallScreen = screenHeight < 700;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={[styles.gameContainer, isSmallScreen && styles.gameContainerCompact]}>
          {/* Game Header согласно системному анализу - Timer, Difficulty, Controls */}
          <GameHeader
            startTime={gameStartTime}
            isPaused={isPaused}
            elapsedTimeInSeconds={elapsedTime}
            movesCount={movesCount}
            difficulty={currentGame?.difficulty}
            onClear={handleClearCell}
            onHint={handleGetHint}
            onUndo={handleUndoMove}
            onToggleNotesMode={handleToggleNotesMode}
            notesMode={notesMode}
            canUndo={canUndo}
            hintsRemaining={hintsRemaining}
            disabled={isPaused}
            testID="game-header"
          />

          {/* Игровое поле - центральный элемент */}
          <View style={[styles.boardContainer, isSmallScreen && styles.boardContainerCompact]}>
            <SudokuBoard
              grid={currentGame.grid}
              originalGrid={currentGame.originalGrid}
              selectedCell={selectedCell}
              conflictCells={conflictCells}
              hintCells={hintCells}
              notesMode={notesMode}
              cellNotes={cellNotes}
              onCellPress={handleCellPress}
              onCellLongPress={handleCellLongPress}
              testID="game-sudoku-board"
            />
          </View>

          {/* Панель с цифрами для ввода - размещаем в конце для удобства */}
          <NumberPad
            onNumberPress={handleNumberInput}
            notesMode={notesMode}
            disabled={isPaused}
            remainingCounts={remainingCounts}
            testID="number-pad"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.lg,
  },

  gameContainer: {
    flex: 1,
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.sm,
    minHeight: Dimensions.get('window').height - 100, // Обеспечиваем минимальную высоту
  },

  gameContainerCompact: {
    paddingTop: Spacing.xs,
    minHeight: Dimensions.get('window').height - 50,
  },

  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
    // Дзен-режим: минимальные отвлекающие элементы
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: Spacing.sm,
  },

  boardContainerCompact: {
    marginVertical: Spacing.md,
    padding: Spacing.sm,
  },
});