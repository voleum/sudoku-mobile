import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

interface SettingSliderProps {
  title: string;
  description?: string;
  value: number;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  onValueChange: (value: number) => void;
  formatValue?: (value: number) => string;
  disabled?: boolean;
  testID?: string;
}

export const SettingSlider: React.FC<SettingSliderProps> = ({
  title,
  description,
  value,
  minimumValue,
  maximumValue,
  step = 1,
  onValueChange,
  formatValue = (val) => val.toString(),
  disabled = false,
  testID,
}) => {
  // Простая реализация слайдера через кнопки для демонстрации
  // В реальном проекте можно использовать @react-native-community/slider
  const handleDecrease = () => {
    if (value > minimumValue && !disabled) {
      onValueChange(Math.max(value - step, minimumValue));
    }
  };

  const handleIncrease = () => {
    if (value < maximumValue && !disabled) {
      onValueChange(Math.min(value + step, maximumValue));
    }
  };

  return (
    <View
      style={[styles.container, disabled && styles.disabled]}
      testID={testID}
    >
      <View style={styles.header}>
        <Text
          style={[styles.title, disabled && styles.disabledText]}
          allowFontScaling={true}
        >
          {title}
        </Text>
        <Text
          style={[styles.value, disabled && styles.disabledText]}
          allowFontScaling={true}
        >
          {formatValue(value)}
        </Text>
      </View>

      {description && (
        <Text
          style={[styles.description, disabled && styles.disabledText]}
          allowFontScaling={true}
        >
          {description}
        </Text>
      )}

      <View style={styles.controls}>
        <Text
          style={[styles.minLabel, disabled && styles.disabledText]}
          allowFontScaling={true}
        >
          {formatValue(minimumValue)}
        </Text>

        <View style={styles.sliderTrack}>
          <View
            style={[
              styles.sliderFill,
              {
                width: `${((value - minimumValue) / (maximumValue - minimumValue)) * 100}%`,
              },
              disabled && styles.disabledSlider,
            ]}
          />
        </View>

        <Text
          style={[styles.maxLabel, disabled && styles.disabledText]}
          allowFontScaling={true}
        >
          {formatValue(maximumValue)}
        </Text>
      </View>

      <View style={styles.buttons}>
        <Text
          style={[
            styles.button,
            value <= minimumValue && styles.buttonDisabled,
            disabled && styles.disabledText,
          ]}
          onPress={handleDecrease}
        >
          -
        </Text>
        <Text
          style={[
            styles.button,
            value >= maximumValue && styles.buttonDisabled,
            disabled && styles.disabledText,
          ]}
          onPress={handleIncrease}
        >
          +
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  title: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },

  value: {
    ...Typography.body1,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
    minWidth: 50,
    textAlign: 'right',
  },

  description: {
    ...Typography.body2,
    color: Colors.text.secondary,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },

  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: Colors.gray300,
    borderRadius: 2,
    marginHorizontal: Spacing.sm,
    overflow: 'hidden',
  },

  sliderFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },

  disabledSlider: {
    backgroundColor: Colors.gray400,
  },

  minLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    minWidth: 30,
  },

  maxLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    minWidth: 30,
    textAlign: 'right',
  },

  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.xs,
  },

  button: {
    ...Typography.heading2,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    width: 40,
    height: 40,
    lineHeight: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight + '20',
  },

  buttonDisabled: {
    color: Colors.text.tertiary,
    backgroundColor: Colors.gray200,
  },

  disabled: {
    opacity: 0.5,
  },

  disabledText: {
    color: Colors.text.tertiary,
  },
});