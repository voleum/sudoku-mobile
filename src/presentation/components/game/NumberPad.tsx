import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { CellValue } from '../../../domain/types/GameTypes';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

interface NumberPadProps {
  onNumberPress: (value: CellValue) => void;
  notesMode?: boolean;
  disabled?: boolean;
  remainingCounts?: { [key: number]: number };
  testID?: string;
}

export const NumberPad: React.FC<NumberPadProps> = memo(({
  onNumberPress,
  notesMode = false,
  disabled = false,
  remainingCounts,
  testID,
}) => {
  const renderNumberButton = (number: CellValue) => {
    const isComplete = remainingCounts && remainingCounts[number] === 0;
    const count = remainingCounts ? remainingCounts[number] : undefined;

    return (
      <TouchableOpacity
        key={number}
        style={[
          styles.numberButton,
          isComplete && styles.numberButtonComplete,
          notesMode && styles.numberButtonNotesMode,
          disabled && styles.disabled,
        ]}
        onPress={() => !disabled && onNumberPress(number)}
        activeOpacity={disabled ? 1 : 0.7}
        accessibilityRole="button"
        accessibilityLabel={`Цифра ${number}${count !== undefined ? `, осталось разместить ${count}` : ''}${notesMode ? ' в режиме заметок' : ''}`}
        accessibilityState={{
          disabled: disabled || isComplete,
          selected: false,
        }}
        testID={`number-pad-button-${number}`}
      >
        <Text
          style={[
            styles.numberText,
            isComplete && styles.numberTextComplete,
            notesMode && styles.numberTextNotesMode,
            disabled && styles.textDisabled,
          ]}
          allowFontScaling={true}
        >
          {number}
        </Text>
        {count !== undefined && (
          <Text
            style={[
              styles.countText,
              isComplete && styles.countTextComplete,
            ]}
            allowFontScaling={true}
          >
            {count}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderEraseButton = () => (
    <TouchableOpacity
      style={[
        styles.eraseButton,
        disabled && styles.disabled,
      ]}
      onPress={() => !disabled && onNumberPress(0)}
      activeOpacity={disabled ? 1 : 0.7}
      accessibilityRole="button"
      accessibilityLabel="Стереть"
      accessibilityState={{ disabled }}
      testID={`number-pad-button-0`}
    >
      <Text
        style={[
          styles.eraseText,
          disabled && styles.textDisabled,
        ]}
        allowFontScaling={true}
      >
        ✕
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container} testID={testID || 'number-pad'}>
      {/* Первый ряд: 1, 2, 3 */}
      <View style={styles.row}>
        {([1, 2, 3] as CellValue[]).map(renderNumberButton)}
      </View>

      {/* Второй ряд: 4, 5, 6 */}
      <View style={styles.row}>
        {([4, 5, 6] as CellValue[]).map(renderNumberButton)}
      </View>

      {/* Третий ряд: 7, 8, 9 */}
      <View style={styles.row}>
        {([7, 8, 9] as CellValue[]).map(renderNumberButton)}
      </View>

      {/* Четвертый ряд: Стереть */}
      <View style={styles.row}>
        {renderEraseButton()}
      </View>
    </View>
  );
});

NumberPad.displayName = 'NumberPad';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: Spacing.md,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },

  numberButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.sm,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    // Минимальный размер области нажатия для доступности
    minWidth: Spacing.touchTarget,
    minHeight: Spacing.touchTarget,
  },

  numberButtonComplete: {
    backgroundColor: Colors.gray300,
    opacity: 0.6,
  },

  numberButtonNotesMode: {
    backgroundColor: Colors.warning,
    borderWidth: 2,
    borderColor: Colors.gray700,
  },

  eraseButton: {
    width: 136,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    // Минимальный размер области нажатия для доступности
    minHeight: Spacing.touchTarget,
  },

  disabled: {
    opacity: 0.4,
  },

  numberText: {
    ...Typography.heading2,
    color: Colors.surface,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
  },

  numberTextComplete: {
    color: Colors.text.tertiary,
  },

  numberTextNotesMode: {
    color: Colors.gray700,
  },

  countText: {
    ...Typography.caption,
    color: Colors.surface,
    position: 'absolute',
    top: 2,
    right: 4,
    fontSize: 10,
    lineHeight: 12,
  },

  countTextComplete: {
    color: Colors.text.tertiary,
  },

  eraseText: {
    ...Typography.heading2,
    color: Colors.surface,
    fontWeight: Typography.fontWeight.bold,
    fontSize: 20,
  },

  textDisabled: {
    opacity: 0.6,
  },
});