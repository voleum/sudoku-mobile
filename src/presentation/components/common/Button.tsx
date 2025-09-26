import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  testID,
}) => {
  const buttonStyle = [
    styles.base,
    styles[variant],
    styles[size],
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={getLoadingColor(variant)} size="small" />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const getLoadingColor = (variant: ButtonVariant): string => {
  switch (variant) {
    case 'primary':
    case 'danger':
      return Colors.white;
    default:
      return Colors.primary;
  }
};

const styles = StyleSheet.create({
  // Base styles
  base: {
    borderRadius: BorderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Spacing.touchTarget,
  },

  // Variants
  primary: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  secondary: {
    backgroundColor: Colors.gray100,
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },

  ghost: {
    backgroundColor: 'transparent',
  },

  danger: {
    backgroundColor: Colors.error,
  },

  // Sizes
  small: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  medium: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },

  large: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },

  // States
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },

  // Text styles
  text: {
    textAlign: 'center',
  },

  primaryText: {
    ...Typography.button,
    color: Colors.white,
  },

  secondaryText: {
    ...Typography.button,
    color: Colors.text.primary,
  },

  outlineText: {
    ...Typography.button,
    color: Colors.primary,
  },

  ghostText: {
    ...Typography.button,
    color: Colors.primary,
  },

  dangerText: {
    ...Typography.button,
    color: Colors.white,
  },

  smallText: {
    ...Typography.buttonSmall,
  },

  mediumText: {
    ...Typography.button,
  },

  largeText: {
    ...Typography.button,
    fontSize: Typography.fontSize.lg,
  },

  disabledText: {
    opacity: 0.7,
  },
});