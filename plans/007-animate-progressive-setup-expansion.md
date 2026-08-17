# 007 — Animate progressive setup expansion

- **Status**: DONE
- **Commit**: a4bf22b
- **Severity**: LOW
- **Category**: Missed opportunities
- **Estimated scope**: 1 file, medium

## Problem

The dashboard's progressive-setup panel swaps its chevron and mounts up to three rows instantly. The content is spatially connected to the toggle, but the current state change gives no motion cue explaining that relationship.

```tsx
// src/app/(tabs)/dashboard/index.tsx:340-366 — current
<Pressable onPress={() => setSetupExpanded((expanded) => !expanded)}>
  {/* heading */}
  <Icon
    name={setupExpanded ? 'chevron-up' : 'chevron-down'}
    size={20}
    color={COLORS.surfaceTint}
  />
</Pressable>
{/* progress and explanation */}
{setupExpanded && nextSetup.map((item) => (
  <Pressable key={item.key} /* ... */>
    {/* row */}
  </Pressable>
))}
```

## Target

Rotate one persistent down chevron to 180 degrees over 180ms with the exact on-screen movement curve. Reveal the row group over 200ms from 8px above the final position. On close, fade the rows over 150ms. Under reduced motion, the chevron changes orientation instantly and the row group uses opacity only.

```tsx
const chevronRotation = useSharedValue(0);

useEffect(() => {
  const target = setupExpanded ? 180 : 0;
  chevronRotation.value = reduceMotion
    ? target
    : withTiming(target, {
        duration: 180,
        easing: Easing.bezier(0.77, 0, 0.175, 1),
      });
}, [chevronRotation, reduceMotion, setupExpanded]);

const chevronStyle = useAnimatedStyle(() => ({
  transform: [{ rotate: `${chevronRotation.value}deg` }],
}));

const setupEnter = reduceMotion
  ? FadeIn.duration(160).easing(Easing.ease)
  : FadeInUp.duration(200)
      .easing(Easing.bezier(0.23, 1, 0.32, 1))
      .withInitialValues({
        opacity: 0,
        transform: [{ translateY: -8 }],
      });

const setupExit = FadeOut.duration(reduceMotion ? 120 : 150).easing(Easing.ease);
```

```tsx
<Animated.View style={chevronStyle}>
  <Icon name="chevron-down" size={20} color={COLORS.surfaceTint} />
</Animated.View>

{setupExpanded && (
  <Animated.View
    entering={setupEnter}
    exiting={setupExit}
    style={styles.setupRows}
  >
    {nextSetup.map(/* existing row markup */)}
  </Animated.View>
)}
```

The 8px negative `translateY` makes the rows emerge from the toggle above them. Animate only transform and opacity; do not animate height.

## Repo conventions to follow

- The screen already imports Reanimated and calls `useReducedMotion()`.
- `src/components/ui/Button.tsx:112-126` supplies the exact strong ease-out.
- The audit specifies `Easing.bezier(0.77, 0, 0.175, 1)` for on-screen movement and `Easing.bezier(0.23, 1, 0.32, 1)` for entrances.
- `DESIGN.md:43-49` limits UI transitions to under 250ms and transform/opacity.

## Steps

1. In `src/app/(tabs)/dashboard/index.tsx`, add React's `useEffect` and Reanimated's `Easing`, `FadeIn`, `FadeOut`, `useAnimatedStyle`, `useSharedValue`, and `withTiming` to existing imports.
2. Add the `chevronRotation`, effect, and animated style exactly as shown near `setupExpanded`.
3. Add the `setupEnter` and `setupExit` builders after the existing general `enter(delay)` helper.
4. Replace the conditional up/down icon with one `chevron-down` icon wrapped by `Animated.View style={chevronStyle}`.
5. Wrap the existing mapped setup rows in the conditional `Animated.View` shown above.
6. Add `setupRows: { gap: SPACING.sm }` to preserve the current spacing after introducing the wrapper.
7. Keep the toggle's accessibility state and label unchanged.

## Boundaries

- Do NOT animate height, max-height, margin, padding, or other layout properties.
- Do NOT change which setup items are shown, their order, routing, completion calculation, or copy.
- Do NOT modify the dashboard's first-view entrance helper; plan 002 owns it.
- Do NOT add dependencies or a reusable accordion component.
- `dashboard/index.tsx` contained uncommitted user changes when this plan was written. If the cited section has drifted, STOP and report instead of overwriting it.

## Verification

- **Mechanical**: run `npx tsc --noEmit`, `npm run lint`, and `npm test -- --runInBand`.
- **Feel check**: on a real Android device, repeatedly expand and collapse progressive setup:
  - Chevron orientation and row visibility always agree.
  - Rows originate 8px toward the toggle and never resize through an animated height.
  - Rapid toggles never leave the chevron or rows stranded in an intermediate state.
  - Reduced motion changes the chevron instantly and fades rows without translation.
  - At 10% speed, chevron rotation uses smooth ease-in-out while row entry starts quickly and decelerates.
- **Done when**: the panel has spatially explanatory motion using only transform and opacity, with a movement-free reduced-motion path.
