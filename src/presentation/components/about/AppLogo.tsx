import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

interface AppLogoProps {
  version?: string;
  size?: 'small' | 'medium' | 'large';
  showVersion?: boolean;
  testID?: string;
}

/**
 * AppLogo компонент согласно требованиям системного анализа
 * Отображает логотип приложения с версией
 */
export const AppLogo: React.FC<AppLogoProps> = ({
  version = '0.0.1',
  size = 'large',
  showVersion = true,
  testID = 'app-logo',
}) => {
  const logoSize = {
    small: Typography.fontSize['2xl'],
    medium: Typography.fontSize['3xl'],
    large: Typography.fontSize['4xl'],
  }[size];

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.logoContainer}>
        <Text style={[styles.logoIcon, { fontSize: logoSize }]}>
          🧩
        </Text>
      </View>
      {showVersion && (
        <Text style={styles.version} accessibilityLabel={`Версия ${version}`}>
          v{version}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },

  logoIcon: {
    // Иконка уже задается в компоненте
  },

  version: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontWeight: '600',
  },
});