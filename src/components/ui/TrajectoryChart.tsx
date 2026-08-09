import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, GestureResponderEvent, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Line, Text as SvgText, Circle, G, ClipPath, Rect } from 'react-native-svg';
import Animated, { useSharedValue, useAnimatedProps, withTiming, FadeInUp, withDelay } from 'react-native-reanimated';
import { COLORS, SPACING, RADIUS, TYPOGRAPHY, SHADOWS } from '../../constants/theme';
import { formatCurrency } from '../../utils/currency';
import { DebtInfo } from '../../store/onboardingStore';
import { calculateAmortizationSchedule } from '../../features/financial-engine/goalCalculations';
import AppText from '../Text/AppText';
import { useTranslation } from 'react-i18next';

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
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language;
  const [windowWidth, setWindowWidth] = useState(() => Dimensions.get('window').width);
  const chartWidth = Math.min(windowWidth - SPACING.lg * 2 - 32, 450);

  const steps = 12;

  const data = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i <= steps; i++) out.push(initialSaved + monthlySave * i);
    return out;
  }, [initialSaved, monthlySave]);

  const { minVal, valRange, points, pathD, areaD } = useMemo(() => {
    const maxValLocal = Math.max(...data, 1000);
    const minValLocal = Math.min(...data, 0);
    const valRangeLocal = maxValLocal - minValLocal;

    const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    const usableHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

    const pts = data.map((val, idx) => ({
      x: CHART_PADDING_LEFT + (idx / steps) * usableWidth,
      y: CHART_PADDING_TOP + usableHeight - ((val - minValLocal) / (valRangeLocal || 1)) * usableHeight,
    }));

    let linePath = '';
    let areaPath = '';
    pts.forEach((p, idx) => {
      if (idx === 0) {
        linePath += `M ${p.x} ${p.y}`;
        areaPath += `M ${p.x} ${CHART_HEIGHT - CHART_PADDING_BOTTOM} L ${p.x} ${p.y}`;
      } else {
        const prev = pts[idx - 1];
        const cpX1 = prev.x + (p.x - prev.x) / 2;
        const cpX2 = prev.x + (p.x - prev.x) / 2;
        linePath += ` C ${cpX1} ${prev.y}, ${cpX2} ${p.y}, ${p.x} ${p.y}`;
        areaPath += ` C ${cpX1} ${prev.y}, ${cpX2} ${p.y}, ${p.x} ${p.y}`;
      }
      if (idx === pts.length - 1) areaPath += ` L ${p.x} ${CHART_HEIGHT - CHART_PADDING_BOTTOM} Z`;
    });

    return { maxVal: maxValLocal, minVal: minValLocal, valRange: valRangeLocal, points: pts, pathD: linePath, areaD: areaPath };
  }, [data, chartWidth]);

  const gridLabels = useMemo(() => {
    if (!points.length) return [];
    return [0, 0.5, 1].map((ratio) => {
      const val = minVal + ratio * (valRange || 1);
      const y = CHART_PADDING_TOP + (1 - ratio) * (CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM);
      return { val, y, formatted: formatCurrency(val, currencySymbol, locale, 0) };
    });
  }, [points.length, minVal, valRange, currencySymbol, locale]);

  const drawProgress = useSharedValue(0);
  const circleOpacity = useSharedValue(0);

  useEffect(() => {
    drawProgress.value = 0;
    circleOpacity.value = 0;
    drawProgress.value = withTiming(1, { duration: 800 });
    circleOpacity.value = withDelay(600, withTiming(1, { duration: 300 }));
  }, [initialSaved, monthlySave, circleOpacity, drawProgress]);

  const animatedClipProps = useAnimatedProps(() => {
    const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    return { width: drawProgress.value * (usableWidth + 10) };
  });

  const animatedCircleProps = useAnimatedProps(() => ({ opacity: circleOpacity.value }));

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleTouch = (event: GestureResponderEvent) => {
    const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    const progress = Math.max(0, Math.min(1, (event.nativeEvent.locationX - CHART_PADDING_LEFT) / usableWidth));
    setHoveredIndex(Math.min(Math.max(Math.round(progress * steps), 0), steps));
  };
  const handleTouchRelease = () => setHoveredIndex(null);

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setWindowWidth(window.width));
    return () => sub?.remove?.();
  }, []);

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.chartContainer}>
      <AppText variant="bodySemiBold" style={styles.chartTitle}>12-Month Savings Trajectory</AppText>
      <AppText variant="caption" style={styles.chartSubtitle}>Based on currently planned allocations</AppText>

      <View onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true} onResponderGrant={handleTouch} onResponderMove={handleTouch} onResponderRelease={handleTouchRelease} onResponderTerminate={handleTouchRelease} style={{ position: 'relative' }}>
        <Svg width={chartWidth} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={COLORS.emerald} stopOpacity="0.25" />
              <Stop offset="100%" stopColor={COLORS.emerald} stopOpacity="0.00" />
            </LinearGradient>
            <ClipPath id="savingsClipPath">
              <AnimatedRect x={CHART_PADDING_LEFT} y={0} height={CHART_HEIGHT} animatedProps={animatedClipProps} />
            </ClipPath>
          </Defs>

          {gridLabels.map(({ val, y, formatted }, idx) => (
            <G key={idx}>
              <Line x1={CHART_PADDING_LEFT} y1={y} x2={chartWidth - CHART_PADDING_RIGHT} y2={y} stroke={COLORS.border} strokeWidth={1} strokeDasharray="4 4" />
              <SvgText x={CHART_PADDING_LEFT - 8} y={y + 4} fontFamily={TYPOGRAPHY.caption.fontFamily} fontSize={9} fill={COLORS.textSecondary} textAnchor="end">{formatted}</SvgText>
            </G>
          ))}

          {[0, 3, 6, 9, steps].map((monthIdx) => {
            const x = CHART_PADDING_LEFT + (monthIdx / steps) * (chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT);
            return <SvgText key={monthIdx} x={x} y={CHART_HEIGHT - 6} fontFamily={TYPOGRAPHY.caption.fontFamily} fontSize={9} fill={COLORS.textSecondary} textAnchor="middle">M{monthIdx}</SvgText>;
          })}

          <G clipPath="url(#savingsClipPath)">
            {areaD && <Path d={areaD} fill="url(#savingsGrad)" />}
            {pathD && <Path d={pathD} fill="none" stroke={COLORS.emerald} strokeWidth={2.5} />}
          </G>

          {points.length > 0 && (
            <G>
              <Circle cx={points[0].x} cy={points[0].y} r={4} fill={COLORS.white} stroke={COLORS.emerald} strokeWidth={2} />
              <AnimatedCircle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={4.5} fill={COLORS.emerald} animatedProps={animatedCircleProps} />
            </G>
          )}

          {hoveredIndex !== null && points[hoveredIndex] && (
            <G>
              <Line x1={points[hoveredIndex].x} y1={CHART_PADDING_TOP} x2={points[hoveredIndex].x} y2={CHART_HEIGHT - CHART_PADDING_BOTTOM} stroke={COLORS.textSecondary} strokeWidth={1} strokeDasharray="3 3" />
              <Circle cx={points[hoveredIndex].x} cy={points[hoveredIndex].y} r={6} fill={COLORS.emerald} stroke={COLORS.white} strokeWidth={2} />
            </G>
          )}
        </Svg>
        {hoveredIndex !== null && points[hoveredIndex] && (
          <View style={[styles.tooltip, { left: Math.max(CHART_PADDING_LEFT, Math.min(points[hoveredIndex].x - 60, chartWidth - CHART_PADDING_RIGHT - 120)), top: Math.max(CHART_PADDING_TOP - 10, points[hoveredIndex].y - 45) }]} pointerEvents="none">
            <AppText variant="labelSm" style={styles.tooltipTitle}>Month {hoveredIndex}</AppText>
            <AppText variant="bodySemiBold" style={styles.tooltipValue}>{formatCurrency(data[hoveredIndex], currencySymbol, locale, 0)}</AppText>
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

export const DebtPaydownChart: React.FC<DebtAmortizationProps> = React.memo(function DebtPaydownChart({
  debts,
  availableSurplus,
  currencySymbol,
}) {
  const { i18n } = useTranslation();
  const locale = i18n.resolvedLanguage || i18n.language;
  const [windowWidth, setWindowWidth] = useState(() => Dimensions.get('window').width);
  const chartWidth = Math.min(windowWidth - SPACING.lg * 2 - 32, 450);

  const [activeMethod, setActiveMethod] = useState<'snowball' | 'avalanche'>('avalanche');

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setWindowWidth(window.width));
    return () => sub?.remove?.();
  }, []);

  const { snowball, avalanche } = useMemo(() => ({
    snowball: calculateAmortizationSchedule(debts, availableSurplus, 'snowball'),
    avalanche: calculateAmortizationSchedule(debts, availableSurplus, 'avalanche'),
  }), [debts, availableSurplus]);

  const selectedData = activeMethod === 'snowball' ? snowball.timeline : avalanche.timeline;
  const steps = selectedData.length - 1;

  const maxVal = useMemo(() => Math.max(...snowball.timeline, ...avalanche.timeline, 1000), [snowball.timeline, avalanche.timeline]);
  const minVal = 0;
  const valRange = maxVal - minVal;

  const drawProgress = useSharedValue(0);
  const circleOpacity = useSharedValue(0);

  useEffect(() => {
    drawProgress.value = 0;
    circleOpacity.value = 0;
    drawProgress.value = withTiming(1, { duration: 800 });
    circleOpacity.value = withDelay(600, withTiming(1, { duration: 300 }));
  }, [activeMethod, debts, availableSurplus, circleOpacity, drawProgress]);

  const animatedClipProps = useAnimatedProps(() => {
    const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    return { width: drawProgress.value * (usableWidth + 10) };
  });

  const animatedCircleProps = useAnimatedProps(() => ({ opacity: circleOpacity.value }));

  const { points, pathD, lineStrokeColor } = useMemo(() => {
    const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    const usableHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

    const pts = selectedData.map((val, idx) => ({
      x: CHART_PADDING_LEFT + (idx / (steps || 1)) * usableWidth,
      y: CHART_PADDING_TOP + usableHeight - (val / (valRange || 1)) * usableHeight,
    }));

    let path = '';
    pts.forEach((p, idx) => {
      if (idx === 0) {
        path += `M ${p.x} ${p.y}`;
      } else {
        const prev = pts[idx - 1];
        const cpX1 = prev.x + (p.x - prev.x) / 2;
        const cpX2 = prev.x + (p.x - prev.x) / 2;
        path += ` C ${cpX1} ${prev.y}, ${cpX2} ${p.y}, ${p.x} ${p.y}`;
      }
    });

    return { points: pts, pathD: path, lineStrokeColor: activeMethod === 'avalanche' ? COLORS.primary : COLORS.warning };
  }, [selectedData, steps, chartWidth, valRange, activeMethod]);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleTouch = (event: GestureResponderEvent) => {
    const usableWidth = chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT;
    const progress = Math.max(0, Math.min(1, (event.nativeEvent.locationX - CHART_PADDING_LEFT) / usableWidth));
    setHoveredIndex(Math.min(Math.max(Math.round(progress * steps), 0), steps));
  };
  const handleTouchRelease = () => setHoveredIndex(null);

  const gridLabels = useMemo(() => {
    return [0, 0.5, 1].map((ratio) => {
      const val = ratio * (maxVal || 1);
      const y = CHART_PADDING_TOP + (1 - ratio) * (CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM);
      return { val, y, formatted: formatCurrency(val, currencySymbol, locale, 0) };
    });
  }, [maxVal, currencySymbol, locale]);

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.chartContainer}>
      <AppText variant="bodySemiBold" style={styles.chartTitle}>Debt Amortization Projection</AppText>

      <View style={styles.toggleRow}>
        <TouchableOpacity style={[styles.toggleBtn, activeMethod === 'avalanche' && styles.toggleBtnActive]} onPress={() => setActiveMethod('avalanche')}>
          <AppText variant="labelSm" style={[styles.toggleBtnText, activeMethod === 'avalanche' && styles.toggleBtnTextActive]}>Avalanche (High Rate First)</AppText>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.toggleBtn, activeMethod === 'snowball' && styles.toggleBtnActive]} onPress={() => setActiveMethod('snowball')}>
          <AppText variant="labelSm" style={[styles.toggleBtnText, activeMethod === 'snowball' && styles.toggleBtnTextActive]}>Snowball (Smallest Bal First)</AppText>
        </TouchableOpacity>
      </View>

      <AppText variant="caption" style={styles.chartSubtitle}>{activeMethod === 'avalanche' ? `Avalanche: Clears all outstanding debts in ${avalanche.clearedIn}` : `Snowball: Clears all outstanding debts in ${snowball.clearedIn}`}</AppText>

      <View onStartShouldSetResponder={() => true} onMoveShouldSetResponder={() => true} onResponderGrant={handleTouch} onResponderMove={handleTouch} onResponderRelease={handleTouchRelease} onResponderTerminate={handleTouchRelease} style={{ position: 'relative' }}>
        <Svg width={chartWidth} height={CHART_HEIGHT}>
          <Defs>
            <ClipPath id="debtClipPath">
              <AnimatedRect x={CHART_PADDING_LEFT} y={0} height={CHART_HEIGHT} animatedProps={animatedClipProps} />
            </ClipPath>
          </Defs>

          {gridLabels.map(({ val, y, formatted }, idx) => (
            <G key={idx}>
              <Line x1={CHART_PADDING_LEFT} y1={y} x2={chartWidth - CHART_PADDING_RIGHT} y2={y} stroke={COLORS.border} strokeWidth={1} strokeDasharray="4 4" />
              <SvgText x={CHART_PADDING_LEFT - 8} y={y + 4} fontFamily={TYPOGRAPHY.caption.fontFamily} fontSize={9} fill={COLORS.textSecondary} textAnchor="end">{formatted}</SvgText>
            </G>
          ))}

          {[0, Math.floor(steps / 2), steps].map((stepIdx) => {
            const x = CHART_PADDING_LEFT + (stepIdx / (steps || 1)) * (chartWidth - CHART_PADDING_LEFT - CHART_PADDING_RIGHT);
            return <SvgText key={stepIdx} x={x} y={CHART_HEIGHT - 6} fontFamily={TYPOGRAPHY.caption.fontFamily} fontSize={9} fill={COLORS.textSecondary} textAnchor="middle">M{stepIdx}</SvgText>;
          })}

          <G clipPath="url(#debtClipPath)">
            {pathD && <Path d={pathD} fill="none" stroke={lineStrokeColor} strokeWidth={2.5} />}
          </G>

          {points.length > 0 && (
            <AnimatedCircle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={4} fill={lineStrokeColor} animatedProps={animatedCircleProps} />
          )}

          {hoveredIndex !== null && points[hoveredIndex] && (
            <G>
              <Line x1={points[hoveredIndex].x} y1={CHART_PADDING_TOP} x2={points[hoveredIndex].x} y2={CHART_HEIGHT - CHART_PADDING_BOTTOM} stroke={COLORS.textSecondary} strokeWidth={1} strokeDasharray="3 3" />
              <Circle cx={points[hoveredIndex].x} cy={points[hoveredIndex].y} r={6} fill={lineStrokeColor} stroke={COLORS.white} strokeWidth={2} />
            </G>
          )}
        </Svg>
        {hoveredIndex !== null && points[hoveredIndex] && (
          <View style={[styles.tooltip, { left: Math.max(CHART_PADDING_LEFT, Math.min(points[hoveredIndex].x - 60, chartWidth - CHART_PADDING_RIGHT - 120)), top: Math.max(CHART_PADDING_TOP - 10, points[hoveredIndex].y - 45) }]} pointerEvents="none">
            <AppText variant="labelSm" style={styles.tooltipTitle}>Month {hoveredIndex}</AppText>
            <AppText variant="bodySemiBold" style={styles.tooltipValue}>{formatCurrency(selectedData[hoveredIndex], currencySymbol, locale, 0)}</AppText>
          </View>
        )}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  chartContainer: { backgroundColor: COLORS.surfaceContainerLowest, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.lg, padding: SPACING.md, marginVertical: SPACING.sm, alignItems: 'center' },
  chartTitle: { ...TYPOGRAPHY.bodySemiBold, color: COLORS.primary, fontSize: 14, alignSelf: 'flex-start' },
  chartSubtitle: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontSize: 11, alignSelf: 'flex-start', marginBottom: SPACING.sm },
  toggleRow: { flexDirection: 'row', alignSelf: 'flex-start', gap: SPACING.sm, marginVertical: SPACING.xs, width: '100%' },
  toggleBtn: { flex: 1, height: 32, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, justifyContent: 'center', alignItems: 'center' },
  toggleBtnActive: { backgroundColor: COLORS.primaryContainer, borderColor: COLORS.primaryContainer },
  toggleBtnText: { fontSize: 9, fontWeight: '700', color: COLORS.textSecondary },
  toggleBtnTextActive: { color: COLORS.white },
  tooltip: { position: 'absolute', backgroundColor: COLORS.primaryContainer, borderRadius: RADIUS.xs, paddingVertical: 4, paddingHorizontal: SPACING.xs, alignItems: 'center', justifyContent: 'center', ...SHADOWS.sm, width: 120, zIndex: 999 },
  tooltipTitle: { fontSize: 9, fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase' },
  tooltipValue: { fontSize: 12, fontWeight: '700', color: COLORS.white },
});
