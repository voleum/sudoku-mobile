import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { Card } from '../common/Card';

interface DataPoint {
  date: Date;
  value: number;
  label?: string;
}

interface ProgressChartProps {
  title: string;
  data: DataPoint[];
  valueFormatter?: (value: number) => string;
  showTrend?: boolean;
  height?: number;
  testID?: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  title,
  data,
  valueFormatter = (value) => value.toString(),
  showTrend = true,
  height = 120,
  testID,
}) => {
  if (data.length === 0) {
    return (
      <Card style={styles.card} testID={testID}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.chartContainer, { height }]}>
          <Text style={styles.noDataText}>Недостаточно данных для графика</Text>
        </View>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const valueRange = maxValue - minValue || 1;

  // Простая реализация линейного графика с использованием View компонентов
  const renderSimpleChart = () => {
    const chartWidth = 300; // Фиксированная ширина для простоты
    const pointWidth = chartWidth / Math.max(data.length - 1, 1);

    return (
      <View style={[styles.chartContainer, { height }]}>
        <View style={styles.yAxisLabels}>
          <Text style={styles.axisLabel}>{valueFormatter(maxValue)}</Text>
          <Text style={styles.axisLabel}>{valueFormatter(minValue)}</Text>
        </View>

        <View style={styles.chartArea}>
          {/* Сетка */}
          <View style={styles.gridContainer}>
            <View style={[styles.gridLine, styles.gridLine0]} />
            <View style={[styles.gridLine, styles.gridLine25]} />
            <View style={[styles.gridLine, styles.gridLine50]} />
            <View style={[styles.gridLine, styles.gridLine75]} />
            <View style={[styles.gridLine, styles.gridLine100]} />
          </View>

          {/* Точки данных */}
          <View style={styles.dataPointsContainer}>
            {data.map((point, index) => {
              const x = index * pointWidth;
              const y = ((maxValue - point.value) / valueRange) * (height - 40); // 40px для отступов

              return (
                <View
                  key={index}
                  style={[
                    styles.dataPoint,
                    {
                      left: x,
                      top: y + 20, // 20px отступ сверху
                    }
                  ]}
                />
              );
            })}
          </View>

          {/* Линии соединения (упрощенная версия) */}
          {data.length > 1 && (
            <View style={styles.lineContainer}>
              {data.slice(0, -1).map((point, index) => {
                const nextPoint = data[index + 1];
                const x1 = index * pointWidth;
                const x2 = (index + 1) * pointWidth;
                const y1 = ((maxValue - point.value) / valueRange) * (height - 40) + 20;
                const y2 = ((maxValue - nextPoint.value) / valueRange) * (height - 40) + 20;

                const lineLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
                const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

                return (
                  <View
                    key={index}
                    style={[
                      styles.connectingLine,
                      {
                        left: x1 + 4, // 4px - половина ширины точки
                        top: y1 + 4,  // 4px - половина высоты точки
                        width: lineLength,
                        transform: [{ rotate: `${angle}deg` }],
                      }
                    ]}
                  />
                );
              })}
            </View>
          )}
        </View>
      </View>
    );
  };

  // Расчет тренда
  const calculateTrend = (): 'up' | 'down' | 'stable' => {
    if (data.length < 2) return 'stable';
    const first = data[0].value;
    const last = data[data.length - 1].value;
    const diff = last - first;
    const threshold = valueRange * 0.1; // 10% от диапазона

    if (diff > threshold) return 'up';
    if (diff < -threshold) return 'down';
    return 'stable';
  };

  const trend = calculateTrend();
  const trendIcon = trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️';
  const trendColor = trend === 'up' ? Colors.success : trend === 'down' ? Colors.error : Colors.text.secondary;

  return (
    <Card style={styles.card} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showTrend && (
          <View style={styles.trendContainer}>
            <Text style={styles.trendIcon}>{trendIcon}</Text>
            <Text style={[styles.trendText, { color: trendColor }]}>
              {trend === 'up' ? 'Растет' : trend === 'down' ? 'Снижается' : 'Стабильно'}
            </Text>
          </View>
        )}
      </View>

      {renderSimpleChart()}

      {/* Статистика по данным */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Последнее</Text>
          <Text style={styles.statValue}>
            {valueFormatter(data[data.length - 1].value)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Лучшее</Text>
          <Text style={[styles.statValue, { color: Colors.success }]}>
            {valueFormatter(maxValue)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Среднее</Text>
          <Text style={styles.statValue}>
            {valueFormatter(data.reduce((sum, d) => sum + d.value, 0) / data.length)}
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.screen,
    marginVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  title: {
    ...Typography.heading4,
    color: Colors.text.primary,
    fontWeight: 'bold',
  },

  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  trendIcon: {
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.xs,
  },

  trendText: {
    ...Typography.caption,
    fontWeight: '600',
  },

  chartContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },

  yAxisLabels: {
    justifyContent: 'space-between',
    paddingRight: Spacing.sm,
    width: 50,
  },

  axisLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.xs,
  },

  chartArea: {
    flex: 1,
    position: 'relative',
  },

  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: Colors.gray200,
  },

  gridLine0: {
    top: '0%',
  },

  gridLine25: {
    top: '25%',
  },

  gridLine50: {
    top: '50%',
  },

  gridLine75: {
    top: '75%',
  },

  gridLine100: {
    top: '100%',
  },

  dataPointsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    borderWidth: 2,
    borderColor: Colors.white,
  },

  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  connectingLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: Colors.primary,
    transformOrigin: '0 50%',
  },

  noDataText: {
    ...Typography.body2,
    color: Colors.text.tertiary,
    textAlign: 'center',
    alignSelf: 'center',
    fontStyle: 'italic',
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },

  statItem: {
    alignItems: 'center',
  },

  statLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },

  statValue: {
    ...Typography.body1,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
});