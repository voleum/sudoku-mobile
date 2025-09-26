import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing, BorderRadius } from '../../styles/spacing';

interface DailyTipProps {
  tip: string;
}

// Массив советов дня согласно образовательным целям из бизнес-анализа
const dailyTips = [
  'Ищите скрытые одиночки в блоках 3×3',
  'Начинайте с поиска очевидных чисел',
  'Используйте метод исключения для сложных ячеек',
  'Обращайте внимание на пары чисел в строках',
  'Анализируйте пересечения строк, столбцов и блоков',
  'Делайте заметки карандашом для возможных значений',
  'Ищите X-Wing паттерны в продвинутых головоломках',
  'Помните: каждая головоломка имеет единственное решение',
  'Не угадывайте - используйте логику',
  'Практикуйтесь ежедневно для улучшения навыков',
];

export const DailyTip: React.FC<DailyTipProps> = ({ tip }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>💡</Text>
        <Text style={styles.title}>Совет дня:</Text>
      </View>
      <Text style={styles.tipText}>{tip}</Text>
    </View>
  );
};

// Утилитарная функция для получения совета дня
export const getDailyTip = (): string => {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return dailyTips[dayOfYear % dailyTips.length];
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.screen,
    marginTop: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  icon: {
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.sm,
  },

  title: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
  },

  tipText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.lg,
  },
});