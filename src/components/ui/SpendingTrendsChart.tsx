import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, GestureResponderEvent, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Line, Text as SvgText, Circle, G } from 'react-native-svg';
import Animated, { useSharedValue, withTiming, FadeInUp, withDelay } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';
import { useTransactionsStore } from '../../store/transactionsStore';
import { Icon } from './Icon';
import AppText from '../Text/AppText';
import { useTranslation } from 'react-i18next';

const CHART_HEIGHT = 160;
const CHART_PADDING_LEFT = 50;
const CHART_PADDING_RIGHT = 20;
const CHART_PADDING_BOTTOM = 30;
const CHART_PADDING_TOP = 20;

export const SpendingTrendsChart: React.FC<{ currencySymbol: string }> = ({
  currencySymbol,
}) => {
  const router = useRouter();
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language;
  const { getMonthlyTotals } = useTransactionsStore();
  const [windowWidth, setWindowWidth] = useState(() => Dimensions.get('window').width);
  const containerWidth = windowWidth - 40;
  const chartWidth = Math.min(containerWidth, 400);

  // Process monthly data once
  const chartData = useMemo(() => {
    const monthlyData = getMonthlyTotals();
    const months = Object.keys(monthlyData);
    months.sort((a, b) => {
      const dateA = new Date(`1 ${a}`);
      const dateB = new Date(`1 ${b}`);
      return dateA.getTime() - dateB.getTime();
    });
    const amounts = months.map((month) => monthlyData[month]);
    return { months, amounts };
  }, [getMonthlyTotals]);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => subscription.remove();
  }, []);

  const { paddedMin, paddedMax, points, path } = useMemo(() => {
    const amounts = chartData.amounts;
    if (amounts.length < 2) {
      return {
        maxVal: 0, minVal: 0, valRange: 1, paddedMin: 0, paddedMax: 0,
        points: [], path: '',
      };
    }

    const maxValLocal = Math.max(...amounts, 0);
    const minValLocal = Math.min(...amounts, 0);
    const valRangeLocal = Math.max(maxValLocal - minValLocal, 1);
    const paddedMinLocal = minValLocal - Math.abs(minValLocal) * 0.1;
    const paddedMaxLocal = maxValLocal + Math.abs(maxValLocal) * 0.1;

    const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    const usableHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

    const pts = amounts.map((val, idx) => ({
      x: CHART_PADDING_LEFT + (idx / Math.max(amounts.length - 1, 1)) * usableWidth,
      y: CHART_PADDING_TOP + usableHeight - ((val - paddedMinLocal) / (paddedMaxLocal - paddedMinLocal)) * usableHeight,
    }));

    let pathD = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpX2 = prev.x + (curr.x - prev.x) / 2;
      pathD += ` C ${cpX1} ${prev.y}, ${cpX2} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    return { maxVal: maxValLocal, minVal: minValLocal, valRange: valRangeLocal, paddedMin: paddedMinLocal, paddedMax: paddedMaxLocal, points: pts, path: pathD };
  }, [chartData, chartWidth]);

  const drawProgress = useSharedValue(0);
  const pointOpacity = useSharedValue(0);

  useEffect(() => {
    drawProgress.value = 0;
    pointOpacity.value = 0;
    drawProgress.value = withTiming(1, { duration: 800 });
    pointOpacity.value = withDelay(600, withTiming(1, { duration: 300 }));
  }, [chartData, drawProgress, pointOpacity]);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleTouch = (event: GestureResponderEvent) => {
    const touchX = event.nativeEvent.locationX;
    const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    const relativeX = touchX - CHART_PADDING_LEFT;
    const progress = Math.max(0, Math.min(1, relativeX / usableWidth));
    const index = Math.min(Math.floor(progress * (chartData.months.length - 1)), chartData.months.length - 1);
    setHoveredIndex(index >= 0 ? index : null);
  };

  const handleTouchRelease = () => setHoveredIndex(null);

  // Pre-format grid labels once
  const gridLabels = useMemo(() => {
    if (!points.length) return [];
    return [-1, -0.5, 0, 0.5, 1].map((ratio) => {
      const val = paddedMin + ratio * (paddedMax - paddedMin);
      const y = CHART_PADDING_TOP + ((1 - ratio) * (CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM));
      const formatted = val === 0 ? '0' : `${val >= 0 ? '+' : '-'}${formatCurrency(Math.abs(val), currencySymbol, locale, 0)}`;
      return { val, y, formatted };
    });
  }, [points.length, paddedMin, paddedMax, currencySymbol, locale]);

  if (chartData.months.length === 0) {
    return (
      <View style={styles.chartContainer}>
        <AppText variant="bodySemiBold" style={styles.chartTitle}>Monthly Net Flow</AppText>
        <AppText variant="caption" style={styles.chartSubtitle}>Income (+) vs Expenses (-)</AppText>
        <View style={styles.emptyStateContainer}>
          <Icon name="analytics-outline" size={36} color={COLORS.textSecondary} style={{ marginBottom: SPACING.xs }} />
          <AppText variant="bodySemiBold" style={styles.emptyStateTitle}>No spending history yet</AppText>
          <AppText variant="caption" style={styles.emptyStateText}>
            Add your first transaction to start seeing monthly income and expense trends.
          </AppText>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => router.push('/transactions?openForm=true')}
            accessibilityRole="button"
            accessibilityLabel="Add Transaction"
          >
            <AppText variant="labelSm" style={styles.emptyStateButtonText}>+ Add Transaction</AppText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.chartContainer}>
      <AppText variant="bodySemiBold" style={styles.chartTitle}>Monthly Net Flow</AppText>
      <AppText variant="caption" style={styles.chartSubtitle}>Income (+) vs Expenses (-)</AppText>

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
          {gridLabels.map(({ val, y, formatted }) => (
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
                <SvgText x={CHART_PADDING_LEFT - 8} y={y + 4} fontFamily={TYPOGRAPHY.caption.fontFamily} fontSize={8} fill={val >= 0 ? COLORS.secondary : COLORS.error} textAnchor="end">
                  {formatted}
                </SvgText>
              )}
            </G>
          ))}

          {/* X Axis Labels (Months) */}
          {chartData.months.map((month, idx) => {
            const x = CHART_PADDING_LEFT + (idx / Math.max(chartData.months.length - 1, 1)) * (chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT);
            return (
              <SvgText key={month} x={x} y={CHART_HEIGHT - 6} fontFamily={TYPOGRAPHY.caption.fontFamily} fontSize={9} fill={COLORS.textSecondary} textAnchor="middle">
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
          {points.map((point, idx) => (
            <G key={idx}>
              <Circle cx={point.x} cy={point.y} r={4} fill={chartData.amounts[idx] >= 0 ? COLORS.secondary : COLORS.error} />
            </G>
          ))}

          {/* Hover guide */}
          {hoveredIndex !== null && hoveredIndex < chartData.months.length && (
            <G>
              <Line
                x1={points[hoveredIndex].x}
                y1={CHART_PADDING_TOP}
                x2={points[hoveredIndex].x}
                y2={CHART_HEIGHT - CHART_PADDING_BOTTOM}
                stroke={COLORS.textSecondary}
                strokeWidth={1}
                strokeDasharray="3 3"
              />
              <Circle cx={points[hoveredIndex].x} cy={points[hoveredIndex].y} r={6} fill={chartData.amounts[hoveredIndex] >= 0 ? COLORS.secondary : COLORS.error} stroke={COLORS.white} strokeWidth={2} />
            </G>
          )}
        </Svg>

        {hoveredIndex !== null && hoveredIndex < chartData.months.length && points[hoveredIndex] && (
          <View
            style={[
              styles.tooltip,
              {
                left: Math.max(CHART_PADDING_LEFT, Math.min(points[hoveredIndex].x - 80, chartWidth - CHART_PADDING_RIGHT - 160)),
                top: Math.max(CHART_PADDING_TOP - 10, points[hoveredIndex].y - 50),
              },
            ]}
            pointerEvents="none"
          >
            <AppText variant="caption" style={styles.tooltipMonth}>{chartData.months[hoveredIndex]}</AppText>
            <AppText variant="bodySemiBold" style={[styles.tooltipAmount, chartData.amounts[hoveredIndex] >= 0 ? { color: COLORS.secondary } : { color: COLORS.error }]}>
              {chartData.amounts[hoveredIndex] >= 0 ? '+' : '-'}{formatCurrency(Math.abs(chartData.amounts[hoveredIndex]), currencySymbol, locale)}
            </AppText>
          </View>
        )}
      </View>

      {/* Zero line indicator */}
      <View style={styles.zeroLineLabel}>
        <View style={{ height: 1, backgroundColor: COLORS.border, marginHorizontal: 20 }} />
        <AppText variant="caption" style={styles.zeroLineText}>Zero</AppText>
        <View style={{ height: 1, backgroundColor: COLORS.border, marginHorizontal: 20 }} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    backgroundColor: COLORS.surfaceContainerLowest,
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
    backgroundColor: COLORS.primaryContainer,
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
