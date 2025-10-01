import React, { memo, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SudokuGrid, CellPosition } from '../../../domain/types/GameTypes';
import { SudokuCell, CellState } from './SudokuCell';
import { Colors } from '../../styles/colors';
import { Spacing } from '../../styles/spacing';

interface SudokuBoardProps {
  grid: SudokuGrid;                    // Текущее состояние сетки
  originalGrid: SudokuGrid;            // Исходная сетка (для определения fixed ячеек)
  selectedCell?: CellPosition | null;  // Выбранная ячейка
  conflictCells?: CellPosition[];      // Ячейки с конфликтами
  hintCells?: CellPosition[];          // Ячейки с подсказками
  notesMode?: boolean;                 // Режим заметок
  cellNotes?: { [key: string]: number[] }; // Заметки пользователя
  onCellPress: (position: CellPosition) => void;
  onCellLongPress?: (position: CellPosition) => void;
  disabled?: boolean;
  testID?: string;
}

export const SudokuBoard: React.FC<SudokuBoardProps> = memo(({
  grid,
  originalGrid,
  selectedCell,
  conflictCells = [],
  hintCells = [],
  notesMode = false,
  cellNotes = {},
  onCellPress,
  onCellLongPress,
  disabled = false,
  testID,
}) => {
  // Адаптивный размер ячейки на основе размера экрана
  const { cellSize, boardSize } = useMemo(() => {
    const { width, height } = Dimensions.get('window');
    const availableWidth = width - (Spacing.screen * 2); // Отступы экрана
    const availableHeight = height * 0.6; // 60% высоты экрана для доски

    // Минимальный размер с учетом требований доступности
    const minCellSize = 38; // Минимум для комфортного нажатия
    const maxCellSize = 56; // Максимум для сбалансированного вида

    const calculatedSize = Math.min(
      Math.floor(availableWidth / 9),
      Math.floor(availableHeight / 9),
      maxCellSize
    );

    const finalCellSize = Math.max(calculatedSize, minCellSize);
    const finalBoardSize = finalCellSize * 9;

    return {
      cellSize: finalCellSize,
      boardSize: finalBoardSize,
    };
  }, []);

  // Определение состояния каждой ячейки
  const getCellState = useCallback((position: CellPosition): CellState => {
    const { row, col } = position;

    // Проверяем конфликты
    if (conflictCells.some(c => c.row === row && c.col === col)) {
      return 'conflict';
    }

    // Проверяем подсказки
    if (hintCells.some(c => c.row === row && c.col === col)) {
      return 'hint';
    }

    // Выбранная ячейка
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      return 'selected';
    }

    // Подсвеченные ячейки (в той же строке, столбце или блоке)
    if (selectedCell) {
      const isSameRow = selectedCell.row === row;
      const isSameCol = selectedCell.col === col;
      const isSameBox = Math.floor(selectedCell.row / 3) === Math.floor(row / 3) &&
                       Math.floor(selectedCell.col / 3) === Math.floor(col / 3);

      if (isSameRow || isSameCol || isSameBox) {
        return 'highlighted';
      }
    }

    // Предзаданные ячейки (из исходной сетки)
    if (originalGrid[row][col] !== 0) {
      return 'fixed';
    }

    // Обычное состояние
    return 'normal';
  }, [selectedCell, conflictCells, hintCells, originalGrid]);

  // Создание ключа для заметок ячейки
  const getCellNotesKey = useCallback((position: CellPosition): string => {
    return `${position.row}-${position.col}`;
  }, []);

  // Рендеринг отдельной ячейки
  const renderCell = useCallback((row: number, col: number) => {
    const position: CellPosition = { row, col, box: Math.floor(row / 3) * 3 + Math.floor(col / 3) };
    const value = grid[row][col];
    const state = getCellState(position);
    const notesKey = getCellNotesKey(position);
    const notes = cellNotes[notesKey] || [];

    return (
      <SudokuCell
        key={`${row}-${col}`}
        position={position}
        value={value}
        state={state}
        notes={notes}
        showNotes={notesMode && value === 0}
        size={cellSize}
        onPress={onCellPress}
        onLongPress={onCellLongPress}
        disabled={disabled}
        testID={`sudoku-cell-${row}-${col}`}
      />
    );
  }, [
    grid,
    getCellState,
    cellNotes,
    getCellNotesKey,
    notesMode,
    cellSize,
    onCellPress,
    onCellLongPress,
    disabled,
    testID
  ]);

  // Рендеринг блока 3x3
  const renderBlock = useCallback((blockRow: number, blockCol: number) => {
    const cells = [];
    for (let row = blockRow * 3; row < (blockRow + 1) * 3; row++) {
      for (let col = blockCol * 3; col < (blockCol + 1) * 3; col++) {
        cells.push(renderCell(row, col));
      }
    }

    return (
      <View
        key={`block-${blockRow}-${blockCol}`}
        style={[
          styles.block,
          {
            width: cellSize * 3,
            height: cellSize * 3,
          }
        ]}
      >
        {cells}
      </View>
    );
  }, [renderCell, cellSize]);

  // Рендеринг всей доски
  const renderBoard = useMemo(() => {
    const blocks = [];
    for (let blockRow = 0; blockRow < 3; blockRow++) {
      for (let blockCol = 0; blockCol < 3; blockCol++) {
        blocks.push(renderBlock(blockRow, blockCol));
      }
    }
    return blocks;
  }, [renderBlock]);

  return (
    <View
      style={[
        styles.board,
        {
          width: boardSize,
          height: boardSize,
        }
      ]}
      testID={testID || 'sudoku-board'}
    >
      {renderBoard}
    </View>
  );
});

SudokuBoard.displayName = 'SudokuBoard';

const styles = StyleSheet.create({
  board: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.text.primary, // Цвет разделительных линий
    alignSelf: 'center',
    // Толстые границы между блоками 3x3
    borderWidth: 2,
    borderColor: Colors.text.primary,
  },

  block: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: Colors.surface,
    // Границы между блоками
    borderWidth: 1,
    borderColor: Colors.text.primary,
  },
});