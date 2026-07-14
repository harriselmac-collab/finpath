import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity, GestureResponderEvent } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Line, Text as SvgText, Circle, G } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, FadeInUp, withDelay } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';
import { useTransactionsStore } from '../../store/transactionsStore';
import { Icon } from './Icon';

const CHART_HEIGHT = 160;
const CHART_PADDING_LEFT = 50;
const CHART_PADDING_RIGHT = 20;
const CHART_PADDING_BOTTOM = 30;
const CHART_PADDING_TOP = 20;

export const SpendingTrendsChart: React.FC<{ currencySymbol: string }> = ({
  currencySymbol,
}) => {
  const router = useRouter();
  const { getMonthlyTotals } = useTransactionsStore();
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = windowWidth - 40; // Approximate padding
  const chartWidth = Math.min(containerWidth, 400);

  // Process monthly data
  const [chartData, setChartData] = useState<{
    months: string[];
    amounts: number[]
  }>({ months: [], amounts: [] });

  useEffect(() => {
    const monthlyData = getMonthlyTotals();
    const months = Object.keys(monthlyData);

    // Sort by date (simple lexical sort works for "Jan 2026" format)
    months.sort((a, b) => {
      const dateA = new Date(`1 ${a}`);
      const dateB = new Date(`1 ${b}`);
      return dateA.getTime() - dateB.getTime();
    });

    const amounts = months.map((month) => {
      // Amounts can be negative (expenses) or positive (income)
      return monthlyData[month];
    });

    setChartData({
      months,
      amounts,
    });
  }, []);

  if (chartData.months.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Monthly Net Flow</Text>
        <Text style={styles.chartSubtitle}>Income (+) vs Expenses (-)</Text>
        <View style={styles.emptyStateContainer}>
          <Icon name="analytics-outline" size={36} color={COLORS.textSecondary} style={{ marginBottom: SPACING.xs }} />
          <Text style={styles.emptyStateTitle}>No spending history yet</Text>
          <Text style={styles.emptyStateText}>
            Add your first transaction to start seeing monthly income and expense trends.
          </Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => router.push('/transactions?openForm=true')}
            accessibilityRole="button"
            accessibilityLabel="Add Transaction"
          >
            <Text style={styles.emptyStateButtonText}>+ Add Transaction</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const maxVal = Math.max(...chartData.amounts, 0);
  const minVal = Math.min(...chartData.amounts, 0);
  const valRange = Math.max(maxVal - minVal, 1); // Avoid division by zero

  // Add padding to min/max for better visualization
  const paddedMin = minVal - Math.abs(minVal) * 0.1;
  const paddedMax = maxVal + Math.abs(maxVal) * 0.1;
  const paddedRange = paddedMax - paddedMin;

  // Reanimated drawing progress
  const drawProgress = useSharedValue(0);
  const pointOpacity = useSharedValue(0);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleTouch = (event: GestureResponderEvent) => {
    const touchX = event.nativeEvent.locationX;
    const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    const relativeX = touchX - CHART_PADDING_LEFT;
    const progress = Math.max(0, Math.min(1, relativeX / usableWidth));
    const index = Math.min(Math.floor(progress * (chartData.months.length - 1)), chartData.months.length - 1);
    setHoveredIndex(index >= 0 ? index : null);
  };

  const handleTouchRelease = () => {
    setHoveredIndex(null);
  };

  useEffect(() => {
    drawProgress.value = 0;
    pointOpacity.value = 0;
    drawProgress.value = withTiming(1, { duration: 800 });
    pointOpacity.value = withDelay(600, withTiming(1, { duration: 300 }));
  }, [chartData]);

  const animatedPointProps = useAnimatedProps(() => {
    return {
      opacity: pointOpacity.value,
    };
  });

  // Generate coordinates for points
  const getCoordinates = (index: number, value: number) => {
    const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    const usableHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

    const x = CHART_PADDING_LEFT + (index / Math.max(chartData.months.length - 1, 1)) * usableWidth;
    const y = CHART_PADDING_TOP + usableHeight - ((value - paddedMin) / paddedRange) * usableHeight;
    return { x, y };
  };

  // Generate SVG path for line
  const generatePath = () => {
    if (chartData.amounts.length < 2) return '';

    const points = chartData.amounts.map((val, idx) => getCoordinates(idx, val));
    let pathD = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      // Simple curve - in future could use proper curves
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }

    return pathD;
  };

  const path = generatePath();

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Monthly Net Flow</Text>
      <Text style={styles.chartSubtitle}>Income (+) vs Expenses (-)</Text>

      <View
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
        onResponderRelease={handleTouchRelease}
        onResponderTerminate={handleTouchRelease}
        style={{ position: 'relative' }}
      >
        <Svg width={chartWidth} height={CHART_HEIGHT}>
          {/* Y Grid lines & Labels */}
          {[-1, -0.5, 0, 0.5, 1].map((ratio) => {
            const val = paddedMin + ratio * paddedRange;
            const y = CHART_PADDING_TOP + ((1 - ratio) * (CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM));
            return (
              <G key={`y-${val}`}>
                <Line
                  x1={CHART_PADDING_LEFT}
                  y1={y}
                  x2={chartWidth - CHART_PADDING_RIGHT}
                  y2={y}
                  stroke={COLORS.border}
                  strokeWidth={1}
                  strokeDasharray={val === 0 ? '2,2' : '4,4'}
                />
                {val !== 0 && (
                  <SvgText
                    x={CHART_PADDING_LEFT - 8}
                    y={y + 4}
                    fontSize={8}
                    fill={val >= 0 ? COLORS.secondary : COLORS.error}
                    textAnchor="end"
                  >
                    {`${val >= 0 ? '+' : ''}${formatCurrency(Math.abs(val), currencySymbol).split('.')[0]}`}
                  </SvgText>
                )}
              </G>
            );
          })}

          {/* X Axis Labels (Months) */}
          {chartData.months.map((month, idx) => {
            const x = CHART_PADDING_LEFT + (idx / Math.max(chartData.months.length - 1, 1)) * (chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT);
            return (
              <SvgText
                key={month}
                x={x}
                y={CHART_HEIGHT - 6}
                fontSize={9}
                fill={COLORS.textSecondary}
                textAnchor="middle"
              >
                {month}
              </SvgText>
            );
          })}

          {/* The line */}
          {path && (
            <Path
              d={path}
              fill="none"
              stroke={COLORS.primary}
              strokeWidth={2}
            />
          )}

          {/* Points */}
          {chartData.amounts.map((amount, idx) => {
            const point = getCoordinates(idx, amount);
            return (
              <G key={idx}>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={4}
                  fill={amount >= 0 ? COLORS.secondary : COLORS.error}
                />
              </G>
            );
          })}

          {/* Hover info */}
          {hoveredIndex !== null && hoveredIndex < chartData.months.length && (
            <G>
              <Line
                x1={getCoordinates(hoveredIndex, 0).x}
                y1={CHART_PADDING_TOP}
                x2={getCoordinates(hoveredIndex, 0).x}
                y2={CHART_HEIGHT - CHART_PADDING_BOTTOM}
                stroke={COLORS.textSecondary}
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <Circle
                cx={getCoordinates(hoveredIndex, chartData.amounts[hoveredIndex]).x}
                cy={getCoordinates(hoveredIndex, chartData.amounts[hoveredIndex]).y}
                r={6}
                fill={chartData.amounts[hoveredIndex] >= 0 ? COLORS.secondary : COLORS.error}
                stroke={COLORS.white}
                strokeWidth={2}
              />
            </G>
          )}

          {hoveredIndex !== null && hoveredIndex < chartData.months.length && (
            <View
              style={[
                styles.tooltip,
                {
                  left: Math.max(
                    CHART_PADDING_LEFT,
                    Math.min(
                      getCoordinates(hoveredIndex, 0).x - 80,
                      chartWidth - CHART_PADDING_RIGHT - 160
                    )
                  ),
                  top: Math.max(CHART_PADDING_TOP - 10, getCoordinates(hoveredIndex, 0).y - 50),
                },
              ]}
              pointerEvents="none"
            >
              <Text style={styles.tooltipMonth}>{chartData.months[hoveredIndex]}</Text>
              <Text style={[
                styles.tooltipAmount,
                chartData.amounts[hoveredIndex] >= 0 ? { color: COLORS.secondary } : { color: COLORS.error }
              ]}>
                {chartData.amounts[hoveredIndex] >= 0 ? '+' : '-'}{formatCurrency(Math.abs(chartData.amounts[hoveredIndex]), currencySymbol)}
              </Text>
            </View>
          )}
        </Svg>
      </View>

      {/* Zero line indicator */}
      <View style={styles.zeroLineLabel}>
        <View style={{ height: 1, backgroundColor: COLORS.border, marginHorizontal: 20 }} />
        <Text style={styles.zeroLineText}>Zero</Text>
        <View style={{ height: 1, backgroundColor: COLORS.border, marginHorizontal: 20 }} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  chartTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.primary,
    fontSize: 14,
    marginBottom: 4,
  },
  chartSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    marginBottom: SPACING.sm,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  emptyStateTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  emptyStateText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
    lineHeight: 16,
  },
  emptyStateButton: {
    backgroundColor: COLORS.secondaryFixed,
    paddingVertical: 8,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateButtonText: {
    ...TYPOGRAPHY.labelSm,
    color: COLORS.onSecondaryFixed,
    fontWeight: '700',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
    ...SHADOWS.sm,
  },
  tooltipMonth: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 2,
  },
  tooltipAmount: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  zeroLineLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  zeroLineText: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginHorizontal: 4,
  },
});