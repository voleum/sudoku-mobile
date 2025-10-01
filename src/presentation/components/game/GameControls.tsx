import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

interface GameControlsProps {
  onClear?: () => void;
  onHint?: () => void;
  onUndo?: () => void;
  onToggleNotesMode?: () => void;
  notesMode?: boolean;
  canUndo?: boolean;
  hintsRemaining?: number;
  disabled?: boolean;
  testID?: string;
}

export const GameControls: React.FC<GameControlsProps> = memo(({
  onClear,
  onHint,
  onUndo,
  onToggleNotesMode,
  notesMode = false,
  canUndo = false,
  hintsRemaining,
  disabled = false,
  testID,
}) => {
  const renderControlButton = (
    key: string,
    onPress: (() => void) | undefined,
    label: string,
    icon: string,
    isActive = false,
    isDisabled = false,
    badge?: number,
    buttonTestID?: string
  ) => {
    const buttonDisabled = disabled || isDisabled || !onPress;

    return (
      <TouchableOpacity
        key={key}
        style={[
          styles.controlButton,
          isActive && styles.controlButtonActive,
          buttonDisabled && styles.controlButtonDisabled,
        ]}
        onPress={onPress}
        activeOpacity={buttonDisabled ? 1 : 0.7}
        accessibilityRole="button"
        accessibilityLabel={`${label}${badge !== undefined ? `, осталось ${badge}` : ''}`}
        accessibilityState={{
          disabled: buttonDisabled,
          selected: isActive,
        }}
        testID={buttonTestID || `${key}-button`}
      >
        <View style={styles.buttonContent}>
          <Text
            style={[
              styles.controlIcon,
              isActive && styles.controlIconActive,
              buttonDisabled && styles.controlIconDisabled,
            ]}
            allowFontScaling={true}
          >
            {icon}
          </Text>
          <Text
            style={[
              styles.controlLabel,
              isActive && styles.controlLabelActive,
              buttonDisabled && styles.controlLabelDisabled,
            ]}
            allowFontScaling={true}
          >
            {label}
          </Text>
          {badge !== undefined && (
            <View style={styles.badge}>
              <Text
                style={styles.badgeText}
                allowFontScaling={true}
              >
                {badge}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Первый ряд: Заметки и Подсказка */}
      <View style={styles.row}>
        {renderControlButton(
          'notes',
          onToggleNotesMode,
          'Заметки',
          '✎',
          notesMode,
          false,
          undefined,
          'notes-button'
        )}
        {renderControlButton(
          'hint',
          onHint,
          'Подсказка',
          '💡',
          false,
          hintsRemaining === 0,
          hintsRemaining,
          'hint-button'
        )}
      </View>

      {/* Второй ряд: Отменить и Очистить */}
      <View style={styles.row}>
        {renderControlButton(
          'undo',
          onUndo,
          'Отменить',
          '↶',
          false,
          !canUndo,
          undefined,
          'undo-button'
        )}
        {renderControlButton(
          'clear',
          onClear,
          'Очистить',
          '🗑',
          false,
          false,
          undefined,
          'clear-button'
        )}
      </View>
    </View>
  );
});

GameControls.displayName = 'GameControls';

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginHorizontal: Spacing.md,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },

  controlButton: {
    flex: 1,
    aspectRatio: 1.2,
    backgroundColor: Colors.gray100,
    borderRadius: 12,
    marginHorizontal: Spacing.xs,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    // Минимальный размер области нажатия для доступности
    minHeight: Spacing.touchTarget,
  },

  controlButtonActive: {
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.primaryDark,
  },

  controlButtonDisabled: {
    backgroundColor: Colors.gray200,
    opacity: 0.4,
  },

  buttonContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  controlIcon: {
    fontSize: 24,
    lineHeight: 28,
    textAlign: 'center',
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },

  controlIconActive: {
    color: Colors.surface,
  },

  controlIconDisabled: {
    color: Colors.text.tertiary,
  },

  controlLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontWeight: Typography.fontWeight.medium,
  },

  controlLabelActive: {
    color: Colors.surface,
    fontWeight: Typography.fontWeight.bold,
  },

  controlLabelDisabled: {
    color: Colors.text.tertiary,
  },

  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },

  badgeText: {
    ...Typography.caption,
    color: Colors.surface,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
  },
});