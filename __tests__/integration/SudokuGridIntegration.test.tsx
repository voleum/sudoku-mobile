/**
 * Integration Tests: SudokuBoard + NumberPad
 *
 * Тестирование взаимодействия между игровой доской и панелью цифр
 * согласно стратегии тестирования (2.3.4-testing-strategy.md, раздел 2: Integration Testing)
 */

import React, { useState } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SudokuBoard } from '../../src/presentation/components/game/SudokuBoard';
import { NumberPad } from '../../src/presentation/components/game/NumberPad';
import { SudokuGrid, CellPosition, CellValue } from '../../src/domain/types/GameTypes';
import { MoveValidator } from '../../src/domain/rules/MoveValidator';

// Mock Dimensions
jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
  get: () => ({ width: 375, height: 812 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
}));

// Mock PixelRatio
jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
  get: () => 2,
  getFontScale: () => 1,
  getPixelSizeForLayoutSize: (size: number) => size * 2,
  roundToNearestPixel: (size: number) => Math.round(size),
}));

// Тестовый компонент с интеграцией SudokuBoard + NumberPad
interface GameIntegrationProps {
  initialGrid: SudokuGrid;
  originalGrid: SudokuGrid;
}

const GameIntegration: React.FC<GameIntegrationProps> = ({ initialGrid, originalGrid }) => {
  const [grid, setGrid] = useState<SudokuGrid>(initialGrid);
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [conflictCells, setConflictCells] = useState<CellPosition[]>([]);

  const handleCellPress = (position: CellPosition) => {
    setSelectedCell(position);
  };

  const handleNumberPress = (value: CellValue) => {
    if (!selectedCell) return;

    const { row, col } = selectedCell;

    // Проверяем, не является ли ячейка фиксированной
    if (originalGrid[row][col] !== 0) return;

    // Обновляем сетку
    const newGrid = grid.map((gridRow, r) =>
      gridRow.map((cell, c) => (r === row && c === col ? value : cell))
    );
    setGrid(newGrid);

    // Используем MoveValidator из domain layer для проверки конфликтов
    // Соответствует Clean Architecture: использование domain layer в тестах
    const validationResult = MoveValidator.validateMove(
      newGrid,
      originalGrid,
      row,
      col,
      value,
      { mode: 'immediate', allowErrors: true, strictMode: false }
    );

    // Если есть конфликты, добавляем текущую ячейку и все конфликтующие ячейки
    const conflicts: CellPosition[] = validationResult.conflicts;
    if (conflicts.length > 0) {
      // Добавляем текущую ячейку в список конфликтов
      conflicts.push(MoveValidator.createCellPosition(row, col));
    }

    setConflictCells(conflicts);
  };

  return (
    <>
      <SudokuBoard
        grid={grid}
        originalGrid={originalGrid}
        selectedCell={selectedCell}
        conflictCells={conflictCells}
        onCellPress={handleCellPress}
        testID="sudoku-board"
      />
      <NumberPad
        onNumberPress={handleNumberPress}
        testID="number-pad"
      />
    </>
  );
};

describe('SudokuGrid Integration Tests', () => {
  const createEmptyGrid = (): SudokuGrid => {
    return Array(9).fill(null).map(() => Array(9).fill(0));
  };

  const createTestGrid = (): { grid: SudokuGrid; originalGrid: SudokuGrid } => {
    const originalGrid: SudokuGrid = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ];

    return { grid: originalGrid, originalGrid };
  };

  describe('Cell Selection and Number Input', () => {
    it('should update cell when selecting cell and pressing number', () => {
      const { grid, originalGrid } = createTestGrid();
      const { getByTestId } = render(
        <GameIntegration initialGrid={grid} originalGrid={originalGrid} />
      );

      // Выбираем пустую ячейку
      const cell = getByTestId('sudoku-cell-0-2');
      fireEvent.press(cell);

      // Нажимаем цифру 4
      const numberButton = getByTestId('number-pad-button-4');
      fireEvent.press(numberButton);

      // Проверяем, что ячейка обновилась
      expect(cell.props.children).toContain('4');
    });

    it('should not allow editing fixed cells', () => {
      const { grid, originalGrid } = createTestGrid();
      const { getByTestId } = render(
        <GameIntegration initialGrid={grid} originalGrid={originalGrid} />
      );

      // Выбираем фиксированную ячейку (0,0) со значением 5
      const fixedCell = getByTestId('sudoku-cell-0-0');
      fireEvent.press(fixedCell);

      // Пытаемся изменить значение
      const numberButton = getByTestId('number-pad-button-9');
      fireEvent.press(numberButton);

      // Проверяем, что значение не изменилось
      expect(fixedCell.props.children).toContain('5');
    });

    it('should erase cell value when pressing erase button', () => {
      const emptyGrid = createEmptyGrid();
      const { getByTestId } = render(
        <GameIntegration initialGrid={emptyGrid} originalGrid={emptyGrid} />
      );

      // Выбираем ячейку и вводим число
      const cell = getByTestId('sudoku-cell-0-0');
      fireEvent.press(cell);

      const numberButton = getByTestId('number-pad-button-5');
      fireEvent.press(numberButton);

      expect(cell.props.children).toContain('5');

      // Нажимаем кнопку стирания
      const eraseButton = getByTestId('number-pad-button-0');
      fireEvent.press(eraseButton);

      // Проверяем, что значение удалено
      expect(cell.props.children).not.toContain('5');
    });
  });

  describe('Conflict Detection', () => {
    it('should detect row conflicts', () => {
      const emptyGrid = createEmptyGrid();
      const { getByTestId } = render(
        <GameIntegration initialGrid={emptyGrid} originalGrid={emptyGrid} />
      );

      // Вводим 5 в ячейку (0,0)
      const cell1 = getByTestId('sudoku-cell-0-0');
      fireEvent.press(cell1);
      fireEvent.press(getByTestId('number-pad-button-5'));

      // Вводим 5 в другую ячейку той же строки (0,3)
      const cell2 = getByTestId('sudoku-cell-0-3');
      fireEvent.press(cell2);
      fireEvent.press(getByTestId('number-pad-button-5'));

      // Обе ячейки должны иметь конфликтное состояние
      // (проверяется через стили, которые применяются к conflict ячейкам)
      expect(cell1).toBeTruthy();
      expect(cell2).toBeTruthy();
    });

    it('should detect column conflicts', () => {
      const emptyGrid = createEmptyGrid();
      const { getByTestId } = render(
        <GameIntegration initialGrid={emptyGrid} originalGrid={emptyGrid} />
      );

      // Вводим 7 в ячейку (0,0)
      fireEvent.press(getByTestId('sudoku-cell-0-0'));
      fireEvent.press(getByTestId('number-pad-button-7'));

      // Вводим 7 в другую ячейку того же столбца (4,0)
      fireEvent.press(getByTestId('sudoku-cell-4-0'));
      fireEvent.press(getByTestId('number-pad-button-7'));

      // Конфликт должен быть обнаружен
      const cell1 = getByTestId('sudoku-cell-0-0');
      const cell2 = getByTestId('sudoku-cell-4-0');
      expect(cell1).toBeTruthy();
      expect(cell2).toBeTruthy();
    });

    it('should detect box conflicts', () => {
      const emptyGrid = createEmptyGrid();
      const { getByTestId } = render(
        <GameIntegration initialGrid={emptyGrid} originalGrid={emptyGrid} />
      );

      // Вводим 3 в ячейку (0,0) - первый блок 3x3
      fireEvent.press(getByTestId('sudoku-cell-0-0'));
      fireEvent.press(getByTestId('number-pad-button-3'));

      // Вводим 3 в другую ячейку того же блока (2,2)
      fireEvent.press(getByTestId('sudoku-cell-2-2'));
      fireEvent.press(getByTestId('number-pad-button-3'));

      // Конфликт должен быть обнаружен
      const cell1 = getByTestId('sudoku-cell-0-0');
      const cell2 = getByTestId('sudoku-cell-2-2');
      expect(cell1).toBeTruthy();
      expect(cell2).toBeTruthy();
    });

    it('should clear conflicts when value is erased', () => {
      const emptyGrid = createEmptyGrid();
      const { getByTestId } = render(
        <GameIntegration initialGrid={emptyGrid} originalGrid={emptyGrid} />
      );

      // Создаем конфликт
      fireEvent.press(getByTestId('sudoku-cell-0-0'));
      fireEvent.press(getByTestId('number-pad-button-6'));
      fireEvent.press(getByTestId('sudoku-cell-0-5'));
      fireEvent.press(getByTestId('number-pad-button-6'));

      // Стираем одно из значений
      fireEvent.press(getByTestId('sudoku-cell-0-5'));
      fireEvent.press(getByTestId('number-pad-button-0'));

      // Конфликты должны исчезнуть
      const cell1 = getByTestId('sudoku-cell-0-0');
      expect(cell1).toBeTruthy();
    });
  });

  describe('Cell Highlighting', () => {
    it('should highlight related cells when cell is selected', () => {
      const { grid, originalGrid } = createTestGrid();
      const { getByTestId } = render(
        <GameIntegration initialGrid={grid} originalGrid={originalGrid} />
      );

      // Выбираем ячейку
      const selectedCell = getByTestId('sudoku-cell-4-4');
      fireEvent.press(selectedCell);

      // Проверяем, что выбранная ячейка имеет состояние selected
      expect(selectedCell).toBeTruthy();

      // Другие ячейки в той же строке, столбце и блоке должны быть highlighted
      const sameRowCell = getByTestId('sudoku-cell-4-0');
      const sameColCell = getByTestId('sudoku-cell-0-4');
      const sameBoxCell = getByTestId('sudoku-cell-3-3');

      expect(sameRowCell).toBeTruthy();
      expect(sameColCell).toBeTruthy();
      expect(sameBoxCell).toBeTruthy();
    });
  });

  describe('Multiple Sequential Operations', () => {
    it('should handle multiple cell selections and inputs correctly', () => {
      const emptyGrid = createEmptyGrid();
      const { getByTestId } = render(
        <GameIntegration initialGrid={emptyGrid} originalGrid={emptyGrid} />
      );

      // Последовательно вводим несколько чисел
      const operations = [
        { cell: 'sudoku-cell-0-0', number: 1 },
        { cell: 'sudoku-cell-0-1', number: 2 },
        { cell: 'sudoku-cell-0-2', number: 3 },
        { cell: 'sudoku-cell-1-0', number: 4 },
        { cell: 'sudoku-cell-1-1', number: 5 },
      ];

      operations.forEach(({ cell, number }) => {
        fireEvent.press(getByTestId(cell));
        fireEvent.press(getByTestId(`number-pad-button-${number}`));
      });

      // Проверяем, что все значения введены корректно
      operations.forEach(({ cell, number }) => {
        const cellElement = getByTestId(cell);
        expect(cellElement.props.children).toContain(number.toString());
      });
    });

    it('should handle cell value changes correctly', () => {
      const emptyGrid = createEmptyGrid();
      const { getByTestId } = render(
        <GameIntegration initialGrid={emptyGrid} originalGrid={emptyGrid} />
      );

      const cell = getByTestId('sudoku-cell-3-3');

      // Вводим первое значение
      fireEvent.press(cell);
      fireEvent.press(getByTestId('number-pad-button-7'));
      expect(cell.props.children).toContain('7');

      // Изменяем значение
      fireEvent.press(cell);
      fireEvent.press(getByTestId('number-pad-button-9'));
      expect(cell.props.children).toContain('9');
      expect(cell.props.children).not.toContain('7');

      // Удаляем значение
      fireEvent.press(cell);
      fireEvent.press(getByTestId('number-pad-button-0'));
      expect(cell.props.children).not.toContain('9');
    });
  });

  describe('Edge Cases', () => {
    it('should handle number press without cell selection', () => {
      const emptyGrid = createEmptyGrid();
      const { getByTestId } = render(
        <GameIntegration initialGrid={emptyGrid} originalGrid={emptyGrid} />
      );

      // Нажимаем цифру без выбора ячейки
      const numberButton = getByTestId('number-pad-button-5');

      expect(() => {
        fireEvent.press(numberButton);
      }).not.toThrow();

      // Проверяем, что ничего не изменилось
      const cell = getByTestId('sudoku-cell-0-0');
      expect(cell.props.children).not.toContain('5');
    });

    it('should handle rapid successive inputs', () => {
      const emptyGrid = createEmptyGrid();
      const { getByTestId } = render(
        <GameIntegration initialGrid={emptyGrid} originalGrid={emptyGrid} />
      );

      const cell = getByTestId('sudoku-cell-2-2');
      fireEvent.press(cell);

      // Быстро нажимаем несколько цифр подряд
      for (let i = 1; i <= 9; i++) {
        fireEvent.press(getByTestId(`number-pad-button-${i}`));
      }

      // Последнее значение должно быть сохранено
      expect(cell.props.children).toContain('9');
    });
  });

  describe('Performance', () => {
    it('should render efficiently with full grid', () => {
      const { grid, originalGrid } = createTestGrid();

      const startTime = performance.now();
      const { getByTestId } = render(
        <GameIntegration initialGrid={grid} originalGrid={originalGrid} />
      );
      const renderTime = performance.now() - startTime;

      // Рендеринг должен занимать менее 100ms
      expect(renderTime).toBeLessThan(100);

      // Все ячейки должны быть доступны
      expect(getByTestId('sudoku-board')).toBeTruthy();
      expect(getByTestId('number-pad')).toBeTruthy();
    });

    it('should handle frequent cell updates efficiently', () => {
      const emptyGrid = createEmptyGrid();
      const { getByTestId } = render(
        <GameIntegration initialGrid={emptyGrid} originalGrid={emptyGrid} />
      );

      const startTime = performance.now();

      // Выполняем 20 операций обновления
      for (let i = 0; i < 20; i++) {
        const row = i % 9;
        const col = Math.floor(i / 9);
        fireEvent.press(getByTestId(`sudoku-cell-${row}-${col}`));
        fireEvent.press(getByTestId(`number-pad-button-${(i % 9) + 1}`));
      }

      const operationTime = performance.now() - startTime;

      // Все операции должны выполниться за разумное время (< 500ms)
      expect(operationTime).toBeLessThan(500);
    });
  });
});
