# 004 — Preserve reduced-motion press feedback

- **Status**: DONE
- **Commit**: a4bf22b
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 2 files, small

## Problem

The shared button and card pressables deliberately skip their scale animation under reduced motion, but they provide no alternative pressed state. Users who reduce movement lose the app's primary touch acknowledgement on high-frequency controls.

```tsx
// src/components/ui/Button.tsx:112-137 — current
const handlePressIn = () => {
  if (!disabled && !loading && !reduceMotion) {
    scale.value = withTiming(0.97, { /* ... */ });
  }
};

<AnimatedPressable
  /* ... */
  style={[...getButtonStyles(), animatedStyle]}
>
```

```tsx
// src/components/ui/Card.tsx:56-88 and 205-236 — current pattern
const handlePressIn = () => {
  if (reduceMotion) return;
  scale.value = withTiming(0.98, { /* ... */ });
};

<AnimatedPressable
  /* ... */
  style={[styles.selectionCard, selected && styles.selectedSelectionCard, style, animatedStyle]}
>
```

## Target

Keep existing scale feedback for normal motion. When reduced motion is enabled, use the native Pressable `pressed` state to apply opacity `0.72` immediately, with no transform or position change.

```tsx
<AnimatedPressable
  /* existing handlers and props */
  style={({ pressed }) => [
    ...getButtonStyles(),
    reduceMotion && pressed && styles.reducedMotionPressed,
    animatedStyle,
  ]}
>

const styles = StyleSheet.create({
  reducedMotionPressed: {
    opacity: 0.72,
  },
});
```

Apply the same conditional style to `SelectionCard` and `PressableCard`, preserving their existing style order and selected states.

## Repo conventions to follow

- `src/app/(tabs)/dashboard/index.tsx` uses `styles.pressed` with `opacity: 0.72`; reuse that established visual strength.
- `src/components/ui/Button.tsx:112-126` and `src/components/ui/Card.tsx:56-69,205-218` already implement the correct normal-motion scale range and strong ease-out. Do not change those values.
- Reduced motion must remove movement, not all feedback.

## Steps

1. In `src/components/ui/Button.tsx`, change the `AnimatedPressable` style prop to the functional form shown above and add `styles.reducedMotionPressed` with opacity `0.72`.
2. In `src/components/ui/Card.tsx`, change the `SelectionCard` pressable style to a functional style array that inserts `reduceMotion && pressed && styles.reducedMotionPressed` immediately before `animatedStyle`.
3. Apply the same change to `PressableCard`.
4. Add one shared `reducedMotionPressed` style inside the existing `Card.tsx` stylesheet; do not duplicate it per card type.
5. Keep all existing press handlers so normal-motion scale behavior remains unchanged.

## Boundaries

- Do NOT remove or retune the existing scale animations.
- Do NOT change button variants, card selection behavior, accessibility roles, disabled/loading behavior, or component APIs.
- Do NOT introduce React state or additional shared values; native `Pressable` state already solves this.
- Do NOT add snapshot tests solely for opacity styling.
- If the shared components have drifted, STOP and report rather than rewriting them.

## Verification

- **Mechanical**: run `npx tsc --noEmit`, `npm run lint`, and `npm test -- --runInBand`.
- **Feel check**: on a real touch device, press primary/secondary/text buttons, a selection card, and a pressable dashboard card:
  - Normal motion still scales to the existing `0.97–0.98` values.
  - Reduced motion produces opacity feedback at `0.72` without any scale or translation.
  - Disabled and loading buttons do not show an enabled press response.
  - Rapid press/release always restores opacity to 1.
- **Done when**: all three shared pressables retain visible feedback under reduced motion with zero movement.
