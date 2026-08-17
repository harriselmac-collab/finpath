# 006 — Reveal the first plan result

- **Status**: DONE
- **Commit**: a4bf22b
- **Severity**: LOW
- **Category**: Missed opportunities
- **Estimated scope**: 1 file, small

## Problem

The first computed financial plan is a rare, high-emotion onboarding milestone, but the heading, result card, and explanation appear statically. The transition into the result does not visually distinguish this moment from an ordinary form screen.

```tsx
// src/app/onboarding/review.tsx:36-61 — current
<View style={styles.heading}>
  {/* title and explanation */}
</View>

<Card style={styles.resultCard} shadow="none">
  {metrics.map(/* static metric rows */)}
</Card>

<View style={styles.localNotice}>
  <AppText variant="supporting" style={styles.noticeText}>
    {t('onboarding.minimum.localNotice')}
  </AppText>
</View>
```

## Target

Add a one-shot, restrained three-part entrance: heading at 0ms, result card at 50ms, and local notice at 100ms. Standard motion uses 220ms, 8px upward travel, and strong ease-out. Reduced motion keeps a 200ms opacity-only fade with no stagger or position change. Buttons remain static and immediately available.

```tsx
import Animated, {
  Easing,
  FadeIn,
  FadeInUp,
  useReducedMotion,
} from 'react-native-reanimated';

const reduceMotion = useReducedMotion();
const enter = (delay = 0) => reduceMotion
  ? FadeIn.duration(200).easing(Easing.ease)
  : FadeInUp.duration(220)
      .delay(delay)
      .easing(Easing.bezier(0.23, 1, 0.32, 1))
      .withInitialValues({
        opacity: 0,
        transform: [{ translateY: 8 }],
      });

<Animated.View entering={enter()} style={styles.heading}>
<Animated.View entering={enter(50)}>
  <Card style={styles.resultCard} shadow="none">...</Card>
</Animated.View>
<Animated.View entering={enter(100)} style={styles.localNotice}>
```

Do not animate or count up monetary values; financial figures must render at their correct final values immediately.

## Repo conventions to follow

- `src/app/(tabs)/dashboard/index.tsx:152-154` uses a local `enter(delay)` builder for first-view sections.
- `src/components/ui/Button.tsx:112-126` supplies `Easing.bezier(0.23, 1, 0.32, 1)`.
- `DESIGN.md:43-49` permits restrained first-view entrances and rare delight while requiring 8px travel, 40–60ms stagger, and transform/opacity-only motion.

## Steps

1. In `src/app/onboarding/review.tsx`, import `Animated`, `Easing`, `FadeIn`, `FadeInUp`, and `useReducedMotion` from Reanimated.
2. Declare `reduceMotion` beside the existing hooks and add the exact local `enter(delay)` builder above.
3. Replace the heading's `View` with `Animated.View` and add `entering={enter()}`.
4. Wrap the result `Card` in `Animated.View entering={enter(50)}` without changing the card or metric markup.
5. Replace the local-notice `View` with `Animated.View entering={enter(100)}`.
6. Leave both action buttons outside animated wrappers.

## Boundaries

- Do NOT animate numbers, recalculate values, or delay rendering financial results.
- Do NOT change plan calculation, onboarding completion, routing, copy, or visual styling.
- Do NOT add celebration assets, haptics, or dependencies.
- Do NOT animate the action buttons.
- `review.tsx` contained uncommitted user changes when this plan was authored. If the excerpt has drifted, STOP and report instead of replacing newer work.

## Verification

- **Mechanical**: run `npx tsc --noEmit`, `npm run lint`, and `npm test -- --runInBand`.
- **Feel check**: complete onboarding and open the review on a real device:
  - Heading, card, and notice settle in that order with 50ms spacing.
  - At 10% speed, each moving element travels exactly 8px and the monetary values never count or flicker.
  - Buttons are present and tappable without waiting for the sequence.
  - Reduced motion produces a 200ms opacity fade only, with no stagger or translation.
- **Done when**: the milestone has a restrained one-shot entrance and all financial/routing behavior is unchanged.
