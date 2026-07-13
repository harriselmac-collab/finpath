/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, TouchableOpacity, GestureResponderEvent } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Text as SvgText, Circle, G, ClipPath, Rect } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, FadeInUp, withDelay } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';


import { formatCurrency } from '../../utils/currency';
import { DebtInfo } from '../../store/onboardingStore';
import { calculateAmortizationSchedule } from '../../features/financial-engine/goalCalculations';

// Width configurations
const CHART_HEIGHT = 160;
const CHART_PADDING_LEFT = 45;
const CHART_PADDING_RIGHT = 15;
const CHART_PADDING_BOTTOM = 25;
const CHART_PADDING_TOP = 15;

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface SavingsChartProps {
  initialSaved: number;
  monthlySave: number;
  currencySymbol: string;
}

export const SavingsProjectionChart: React.FC<SavingsChartProps> = ({
  initialSaved,
  monthlySave,
  currencySymbol,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = windowWidth - SPACING.lg * 2 - 32; // Screen width minus card padding
  const chartWidth = containerWidth > 450 ? 450 : containerWidth;

  const steps = 12; // 12-month projection
  const data: number[] = [];
  for (let i = 0; i <= steps; i++) {
    data.push(initialSaved + monthlySave * i);
  }

  const maxVal = Math.max(...data, 1000);
  const minVal = Math.min(...data, 0);
  const valRange = maxVal - minVal;

  // Reanimated drawing progress
  const drawProgress = useSharedValue(0);
  const circleOpacity = useSharedValue(0);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleTouch = (event: GestureResponderEvent) => {
    const touchX = event.nativeEvent.locationX;
    const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    const relativeX = touchX - CHART_PADDING_LEFT;
    const progress = relativeX / usableWidth;
    const index = Math.min(Math.max(Math.round(progress * steps), 0), steps);
    setHoveredIndex(index);
  };

  const handleTouchRelease = () => {
    setHoveredIndex(null);
  };

  useEffect(() => {
    drawProgress.value = 0;
    circleOpacity.value = 0;
    drawProgress.value = withTiming(1, { duration: 800 });
    circleOpacity.value = withDelay(600, withTiming(1, { duration: 300 }));
  }, [initialSaved, monthlySave]);

  const animatedClipProps = useAnimatedProps(() => {
    const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    return {
      width: drawProgress.value * (usableWidth + 10), // slight overflow to fully cover end points
    };
  });

  const animatedCircleProps = useAnimatedProps(() => {
    return {
      opacity: circleOpacity.value,
    };
  });


  // Mapping function
  const getCoordinates = (index: number, val: number) => {
    const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    const usableHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

    const x = CHART_PADDING_LEFT + (index / steps) * usableWidth;
    const y = CHART_PADDING_TOP + usableHeight - ((val - minVal) / valRange) * usableHeight;
    return { x, y };
  };

  // Generate Bezier path line and filled area path
  let pathD = '';
  let areaD = '';

  const points = data.map((val, idx) => getCoordinates(idx, val));

  points.forEach((p, idx) => {
    if (idx === 0) {
      pathD += `M ${p.x} ${p.y}`;
      areaD += `M ${p.x} ${CHART_HEIGHT - CHART_PADDING_BOTTOM} L ${p.x} ${p.y}`;
    } else {
      // Smooth spline using midpoints
      const prev = points[idx - 1];
      const cpX1 = prev.x + (p.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (p.x - prev.x) / 2;
      const cpY2 = p.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
      areaD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }

    if (idx === points.length - 1) {
      areaD += ` L ${p.x} ${CHART_HEIGHT - CHART_PADDING_BOTTOM} Z`;
    }
  });

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.chartContainer}>
      <Text style={styles.chartTitle}>12-Month Savings Trajectory</Text>
      <Text style={styles.chartSubtitle}>Based on currently planned allocations</Text>

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
          <Defs>
            <LinearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={COLORS.emerald} stopOpacity="0.25" />
              <Stop offset="100%" stopColor={COLORS.emerald} stopOpacity="0.00" />
            </LinearGradient>
            <ClipPath id="savingsClipPath">
              <AnimatedRect
                x={CHART_PADDING_LEFT}
                y={0}
                height={CHART_HEIGHT}
                animatedProps={animatedClipProps}
              />
            </ClipPath>
          </Defs>

          {/* Y Grid lines & Labels */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const val = minVal + ratio * valRange;
            const usableHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
            const y = CHART_PADDING_TOP + usableHeight - ratio * usableHeight;
            return (
              <G key={idx}>
                <Line
                  x1={CHART_PADDING_LEFT}
                  y1={y}
                  x2={chartWidth - CHART_PADDING_RIGHT}
                  y2={y}
                  stroke={COLORS.border}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <SvgText
                  x={CHART_PADDING_LEFT - 8}
                  y={y + 4}
                  fontSize={9}
                  fill={COLORS.textSecondary}
                  textAnchor="end"
                >
                  {formatCurrency(val, currencySymbol).split('.')[0]}
                </SvgText>
              </G>
            );
          })}

          {/* X Timeline Labels (Months) */}
          {[0, 3, 6, 9, 12].map((monthIdx) => {
            const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
            const x = CHART_PADDING_LEFT + (monthIdx / steps) * usableWidth;
            return (
              <SvgText
                key={monthIdx}
                x={x}
                y={CHART_HEIGHT - 6}
                fontSize={9}
                fill={COLORS.textSecondary}
                textAnchor="middle"
              >
                M{monthIdx}
              </SvgText>
            );
          })}

          {/* Animated Cliped Area */}
          <G clipPath="url(#savingsClipPath)">
            {/* Filled Path Area */}
            {areaD && <Path d={areaD} fill="url(#savingsGrad)" />}

            {/* Bezier Area Path Line */}
            {pathD && <Path d={pathD} fill="none" stroke={COLORS.emerald} strokeWidth={2.5} />}
          </G>

          {/* Draw start and endpoint circles */}
          {points.length > 0 && (
            <G>
              <Circle cx={points[0].x} cy={points[0].y} r={4} fill={COLORS.white} stroke={COLORS.emerald} strokeWidth={2} />
              <AnimatedCircle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r={4.5}
                fill={COLORS.emerald}
                animatedProps={animatedCircleProps}
              />
            </G>
          )}

          {/* Touch interactive overlay items */}
          {hoveredIndex !== null && points[hoveredIndex] && (
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
              <Circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].y}
                r={6}
                fill={COLORS.emerald}
                stroke={COLORS.white}
                strokeWidth={2}
              />
            </G>
          )}
        </Svg>
        {hoveredIndex !== null && points[hoveredIndex] && (
          <View
            style={[
              styles.tooltip,
              {
                left: Math.max(
                  CHART_PADDING_LEFT,
                  Math.min(
                    points[hoveredIndex].x - 60,
                    chartWidth - CHART_PADDING_RIGHT - 120
                  )
                ),
                top: Math.max(CHART_PADDING_TOP - 10, points[hoveredIndex].y - 45),
              },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.tooltipTitle}>Month {hoveredIndex}</Text>
            <Text style={styles.tooltipValue}>
              {formatCurrency(data[hoveredIndex], currencySymbol).split('.')[0]}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};


interface DebtAmortizationProps {
  debts: DebtInfo[];
  availableSurplus: number;
  currencySymbol: string;
}

export const DebtPaydownChart: React.FC<DebtAmortizationProps> = ({
  debts,
  availableSurplus,
  currencySymbol,
}) => {
  const { width: windowWidth } = useWindowDimensions();
  const containerWidth = windowWidth - SPACING.lg * 2 - 32;
  const chartWidth = containerWidth > 450 ? 450 : containerWidth;

  const [activeMethod, setActiveMethod] = useState<'snowball' | 'avalanche'>('avalanche');

  // Reanimated drawing progress
  const drawProgress = useSharedValue(0);
  const circleOpacity = useSharedValue(0);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleTouch = (event: GestureResponderEvent) => {
    const touchX = event.nativeEvent.locationX;
    const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    const relativeX = touchX - CHART_PADDING_LEFT;
    const progress = relativeX / usableWidth;
    const index = Math.min(Math.max(Math.round(progress * steps), 0), steps);
    setHoveredIndex(index);
  };

  const handleTouchRelease = () => {
    setHoveredIndex(null);
  };

  useEffect(() => {
    drawProgress.value = 0;
    circleOpacity.value = 0;
    drawProgress.value = withTiming(1, { duration: 800 });
    circleOpacity.value = withDelay(600, withTiming(1, { duration: 300 }));
  }, [activeMethod, debts, availableSurplus]);

  const animatedClipProps = useAnimatedProps(() => {
    const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    return {
      width: drawProgress.value * (usableWidth + 10),
    };
  });

  const animatedCircleProps = useAnimatedProps(() => {
    return {
      opacity: circleOpacity.value,
    };
  });

  if (debts.length === 0) return null;

  const snowball = calculateAmortizationSchedule(debts, availableSurplus, 'snowball');
  const avalanche = calculateAmortizationSchedule(debts, availableSurplus, 'avalanche');

  const selectedData = activeMethod === 'snowball' ? snowball.timeline : avalanche.timeline;
  const steps = selectedData.length - 1;

  const maxVal = Math.max(...snowball.timeline, ...avalanche.timeline, 1000);
  const minVal = 0;
  const valRange = maxVal - minVal;

  const getCoordinates = (index: number, val: number) => {
    const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    const usableHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

    const x = CHART_PADDING_LEFT + (index / steps) * usableWidth;
    const y = CHART_PADDING_TOP + usableHeight - ((val - minVal) / valRange) * usableHeight;
    return { x, y };
  };

  const points = selectedData.map((val, idx) => getCoordinates(idx, val));

  let pathD = '';
  points.forEach((p, idx) => {
    if (idx === 0) {
      pathD += `M ${p.x} ${p.y}`;
    } else {
      const prev = points[idx - 1];
      const cpX1 = prev.x + (p.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (p.x - prev.x) / 2;
      const cpY2 = p.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }
  });

  const lineStrokeColor = activeMethod === 'avalanche' ? COLORS.primary : COLORS.warning;

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.chartContainer}>
      <Text style={styles.chartTitle}>Debt Amortization Projection</Text>
      
      {/* Toggles */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, activeMethod === 'avalanche' && styles.toggleBtnActive]}
          onPress={() => setActiveMethod('avalanche')}
        >
          <Text style={[styles.toggleBtnText, activeMethod === 'avalanche' && styles.toggleBtnTextActive]}>
            Avalanche (High Rate First)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleBtn, activeMethod === 'snowball' && styles.toggleBtnActive]}
          onPress={() => setActiveMethod('snowball')}
        >
          <Text style={[styles.toggleBtnText, activeMethod === 'snowball' && styles.toggleBtnTextActive]}>
            Snowball (Smallest Bal First)
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.chartSubtitle}>
        {activeMethod === 'avalanche'
          ? `Avalanche: Clears all outstanding debts in ${avalanche.clearedIn}`
          : `Snowball: Clears all outstanding debts in ${snowball.clearedIn}`}
      </Text>

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
          <Defs>
            <ClipPath id="debtClipPath">
              <AnimatedRect
                x={CHART_PADDING_LEFT}
                y={0}
                height={CHART_HEIGHT}
                animatedProps={animatedClipProps}
              />
            </ClipPath>
          </Defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((ratio, idx) => {
            const val = minVal + ratio * valRange;
            const usableHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;
            const y = CHART_PADDING_TOP + usableHeight - ratio * usableHeight;
            return (
              <G key={idx}>
                <Line
                  x1={CHART_PADDING_LEFT}
                  y1={y}
                  x2={chartWidth - CHART_PADDING_RIGHT}
                  y2={y}
                  stroke={COLORS.border}
                  strokeWidth={1}
                  strokeDasharray="4 4"
                />
                <SvgText
                  x={CHART_PADDING_LEFT - 8}
                  y={y + 4}
                  fontSize={9}
                  fill={COLORS.textSecondary}
                  textAnchor="end"
                >
                  {formatCurrency(val, currencySymbol).split('.')[0]}
                </SvgText>
              </G>
            );
          })}

          {/* Timeline labels */}
          {[0, Math.floor(steps / 2), steps].map((stepIdx) => {
            const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
            const x = CHART_PADDING_LEFT + (stepIdx / steps) * usableWidth;
            return (
              <SvgText
                key={stepIdx}
                x={x}
                y={CHART_HEIGHT - 6}
                fontSize={9}
                fill={COLORS.textSecondary}
                textAnchor="middle"
              >
                M{stepIdx}
              </SvgText>
            );
          })}

          {/* Animated paydown curve line */}
          <G clipPath="url(#debtClipPath)">
            {pathD && (
              <Path
                d={pathD}
                fill="none"
                stroke={lineStrokeColor}
                strokeWidth={2.5}
              />
            )}
          </G>

          {/* Endpoint marker */}
          {points.length > 0 && (
            <AnimatedCircle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={4}
              fill={lineStrokeColor}
              animatedProps={animatedCircleProps}
            />
          )}

          {/* Touch interactive overlay items */}
          {hoveredIndex !== null && points[hoveredIndex] && (
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
              <Circle
                cx={points[hoveredIndex].x}
                cy={points[hoveredIndex].y}
                r={6}
                fill={lineStrokeColor}
                stroke={COLORS.white}
                strokeWidth={2}
              />
            </G>
          )}
        </Svg>
        {hoveredIndex !== null && points[hoveredIndex] && (
          <View
            style={[
              styles.tooltip,
              {
                left: Math.max(
                  CHART_PADDING_LEFT,
                  Math.min(
                    points[hoveredIndex].x - 60,
                    chartWidth - CHART_PADDING_RIGHT - 120
                  )
                ),
                top: Math.max(CHART_PADDING_TOP - 10, points[hoveredIndex].y - 45),
              },
            ]}
            pointerEvents="none"
          >
            <Text style={styles.tooltipTitle}>Month {hoveredIndex}</Text>
            <Text style={styles.tooltipValue}>
              {formatCurrency(selectedData[hoveredIndex], currencySymbol).split('.')[0]}
            </Text>
          </View>
        )}
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
    marginVertical: SPACING.sm,
    alignItems: 'center',
  },
  chartTitle: {
    ...TYPOGRAPHY.bodySemiBold,
    color: COLORS.primary,
    fontSize: 14,
    alignSelf: 'flex-start',
  },
  chartSubtitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontSize: 11,
    alignSelf: 'flex-start',
    marginBottom: SPACING.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: SPACING.sm,
    marginVertical: SPACING.xs,
    width: '100%',
  },
  toggleBtn: {
    flex: 1,
    height: 32,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleBtnText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  toggleBtnTextActive: {
    color: COLORS.white,
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xs,
    paddingVertical: 4,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
    width: 120,
    zIndex: 999,
  },
  tooltipTitle: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    textTransform: 'uppercase',
  },
  tooltipValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
});


