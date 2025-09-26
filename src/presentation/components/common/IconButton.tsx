import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Spacing, BorderRadius } from '../../styles/spacing';

interface IconButtonProps {
  onPress: () => void;
  children: React.ReactNode; // Icon component
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'ghost' | 'outlined';
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  onPress,
  children,
  size = 'medium',
  variant = 'default',
  disabled = false,
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

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
    >
      {children}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Base styles
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.sm,
  },

  // Variants
  default: {
    backgroundColor: Colors.gray100,
  },

  ghost: {
    backgroundColor: 'transparent',
  },

  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },

  // Sizes
  small: {
    width: 32,
    height: 32,
  },

  medium: {
    width: Spacing.touchTarget,
    height: Spacing.touchTarget,
  },

  large: {
    width: 56,
    height: 56,
  },

  // States
  disabled: {
    opacity: 0.5,
  },
});