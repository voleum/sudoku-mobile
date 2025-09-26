import React, { memo, useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { CellValue, CellPosition } from '../../../domain/types/GameTypes';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

export type CellState =
  | 'normal'     // Обычное состояние
  | 'selected'   // Выбранная ячейка
  | 'highlighted'// Подсвеченная (в той же строке/столбце/блоке)
  | 'error'      // Ошибка в значении
  | 'fixed'      // Предзаданная ячейка (не редактируется)
  | 'conflict'   // Конфликт с другими ячейками
  | 'hint';      // Ячейка с подсказкой

interface SudokuCellProps {
  position: CellPosition;
  value: CellValue;
  state: CellState;
  notes?: number[];        // Заметки пользователя (1-9)
  showNotes?: boolean;     // Режим отображения заметок
  size?: number;           // Размер ячейки (адаптивный)
  onPress: (position: CellPosition) => void;
  onLongPress?: (position: CellPosition) => void;
  disabled?: boolean;
  testID?: string;
}

export const SudokuCell: React.FC<SudokuCellProps> = memo(({
  position,
  value,
  state,
  notes = [],
  showNotes = false,
  size = 40,
  onPress,
  onLongPress,
  disabled = false,
  testID,
}) => {
  const cellStyle = useMemo(() => [
    styles.cell,
    styles[state],
    {
      width: size,
      height: size,
      // Адаптивный минимальный размер для пожилых пользователей
      minWidth: size < 44 ? 44 : size,
      minHeight: size < 44 ? 44 : size,
    },
    disabled && styles.disabled,
  ], [state, size, disabled]);

  const textStyle = useMemo(() => [
    styles.text,
    styles[`${state}Text`] as TextStyle,
    {
      fontSize: Math.max(size * 0.5, 20), // Минимум 20px для пожилых пользователей (25% аудитории)
    },
  ], [state, size]);

  const notesStyle = useMemo(() => [
    styles.notesContainer,
    {
      fontSize: Math.max(size * 0.2, 10), // Минимум 10px для заметок
    },
  ], [size]);

  const handlePress = () => {
    if (!disabled) {
      onPress(position);
    }
  };

  const handleLongPress = () => {
    if (!disabled && onLongPress) {
      onLongPress(position);
    }
  };

  const renderContent = () => {
    if (value !== 0) {
      // Отображаем значение ячейки
      return (
        <Text style={textStyle} allowFontScaling={true}>
          {value}
        </Text>
      );
    }

    if (showNotes && notes.length > 0) {
      // Отображаем заметки в режиме заметок
      const noteGrid = Array(9).fill(0).map((_, index) => {
        const noteValue = index + 1;
        const hasNote = notes.includes(noteValue);
        return (
          <Text
            key={noteValue}
            style={[
              styles.noteText,
              notesStyle,
              !hasNote && styles.noteTextHidden
            ]}
            allowFontScaling={true}
          >
            {hasNote ? noteValue : ''}
          </Text>
        );
      });

      return (
        <React.Fragment>
          {/* Сетка 3x3 для заметок */}
          <Text style={[styles.noteGrid, notesStyle]} allowFontScaling={true}>
            {noteGrid.slice(0, 3)}
          </Text>
          <Text style={[styles.noteGrid, notesStyle]} allowFontScaling={true}>
            {noteGrid.slice(3, 6)}
          </Text>
          <Text style={[styles.noteGrid, notesStyle]} allowFontScaling={true}>
            {noteGrid.slice(6, 9)}
          </Text>
        </React.Fragment>
      );
    }

    return null; // Пустая ячейка
  };

  return (
    <TouchableOpacity
      style={cellStyle}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={disabled ? 1 : 0.7}
      accessibilityRole="button"
      accessibilityLabel={`Ячейка строка ${position.row + 1} столбец ${position.col + 1}${
        value !== 0 ? `, значение ${value}` : ''
      }`}
      accessibilityState={{
        selected: state === 'selected',
        disabled,
      }}
      testID={testID || `sudoku-cell-${position.row}-${position.col}`}
    >
      {renderContent()}
    </TouchableOpacity>
  );
});

SudokuCell.displayName = 'SudokuCell';

const styles = StyleSheet.create({
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    // Минимальный размер области нажатия для доступности
    minWidth: Spacing.touchTarget,
    minHeight: Spacing.touchTarget,
  },

  // Состояния ячеек
  normal: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },

  selected: {
    backgroundColor: Colors.primary + '20', // 20% opacity
    borderColor: Colors.primary,
    borderWidth: 2,
  },

  highlighted: {
    backgroundColor: Colors.primaryLight + '10', // 10% opacity
    borderColor: Colors.primaryLight,
  },

  error: {
    backgroundColor: Colors.error + '15', // 15% opacity
    borderColor: Colors.error,
    borderWidth: 2,
  },

  fixed: {
    backgroundColor: Colors.gray100,
    borderColor: Colors.border,
  },

  conflict: {
    backgroundColor: Colors.warning + '15', // 15% opacity
    borderColor: Colors.warning,
  },

  hint: {
    backgroundColor: Colors.success + '15', // 15% opacity
    borderColor: Colors.success,
    borderWidth: 2,
  },

  disabled: {
    opacity: 0.6,
  },

  // Стили текста для разных состояний
  text: {
    ...Typography.heading2,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.bold,
  },

  normalText: {
    color: Colors.text.primary,
  },

  selectedText: {
    color: Colors.primary,
  },

  highlightedText: {
    color: Colors.text.primary,
  },

  errorText: {
    color: Colors.error,
  },

  fixedText: {
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.bold,
  },

  conflictText: {
    color: Colors.warning,
  },

  hintText: {
    color: Colors.success,
  },

  // Стили для заметок
  notesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noteGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
  },

  noteText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
    flex: 1,
  },

  noteTextHidden: {
    opacity: 0,
  },
});