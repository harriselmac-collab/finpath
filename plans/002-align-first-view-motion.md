# 002 — Align first-view motion

- **Status**: DONE
- **Commit**: a4bf22b
- **Severity**: MEDIUM
- **Category**: Cohesion & tokens
- **Estimated scope**: 3 files, medium

## Problem

The dashboard, plan, and welcome screens use stock `FadeInUp` presets. In Reanimated 4.5.1, that preset starts at 25px displacement and defaults to `Easing.inOut(Easing.quad)`. Pocket Ahead's documented personality is restrained motion at 3/10, with only 8px travel and a strong ease-out.

```tsx
// src/app/(tabs)/dashboard/index.tsx:152-154 — current
const enter = (delay = 0) => reduceMotion
  ? undefined
  : FadeInUp.duration(ENTRY_DURATION).delay(delay);

// src/app/(tabs)/plan/index.tsx:76-78 — current
const enter = (delay = 0) => reduceMotion
  ? undefined
  : FadeInUp.duration(220).delay(delay);

// src/app/onboarding/welcome.tsx:72-106 — representative current entries
<Animated.View entering={FadeInUp.duration(220).delay(90)} style={[styles.metricCard, styles.growthCard]}>
<Animated.View entering={FadeInUp.duration(220).delay(160)} style={styles.copy}>
<Animated.View entering={FadeInUp.duration(220).delay(210)} style={styles.actions}>
```

## Target

Every `FadeInUp` first-view section in these three files must enter from 8px below, with opacity from 0 to 1 over 220ms using the exact strong ease-out curve.

```tsx
FadeInUp.duration(220)
  .delay(delay)
  .easing(Easing.bezier(0.23, 1, 0.32, 1))
  .withInitialValues({
    opacity: 0,
    transform: [{ translateY: 8 }],
  });
```

Keep each screen's existing stagger values. Under reduced motion, dashboard and plan must continue returning `undefined`; welcome may rely on Reanimated's default `ReduceMotion.System` behavior rather than introducing a second preference source.

## Repo conventions to follow

- `src/components/ui/Button.tsx:112-126` is the easing exemplar: `Easing.bezier(0.23, 1, 0.32, 1)`.
- `src/app/(tabs)/dashboard/index.tsx:152-154` and `src/app/(tabs)/plan/index.tsx:76-78` already centralize screen entrances in local `enter(delay)` helpers; extend those helpers instead of adding shared infrastructure.
- `DESIGN.md:43-49` defines 8px travel, 40–60ms stagger, under-250ms transitions, and transform/opacity-only animation.

## Steps

1. Add `Easing` to the Reanimated imports in `src/app/(tabs)/dashboard/index.tsx` and `src/app/(tabs)/plan/index.tsx`.
2. Extend both existing `enter(delay)` builders with the exact easing and `withInitialValues` block above; keep their current duration and reduced-motion branch.
3. In `src/app/onboarding/welcome.tsx`, add `Easing` and a local `enterUp(delay)` builder using 220ms, the exact ease-out, and 8px `translateY`.
4. Replace the four `FadeInUp` expressions on the two metric cards, copy block, and actions block with `enterUp(90)`, `enterUp(140)`, `enterUp(160)`, and `enterUp(210)` respectively.
5. Leave the welcome screen's pure-opacity `FadeIn` entries unchanged; they do not create the excessive 25px travel this plan fixes.

## Boundaries

- Do NOT change component order, existing stagger delays, screen layout, or navigation.
- Do NOT add a global motion constants file; the existing local helper pattern is sufficient.
- Do NOT touch auth or essential-expense entrances; those are covered by plans 001 and 003.
- `dashboard/index.tsx` had uncommitted user changes when this plan was written. If the helper or cited blocks have drifted, STOP and report instead of overwriting them.

## Verification

- **Mechanical**: run `npx tsc --noEmit`, `npm run lint`, and `npm test -- --runInBand`.
- **Feel check**: launch welcome, dashboard, and plan on Android and web, then confirm:
  - At normal speed, sections settle crisply without looking like they fall into place.
  - At 10% speed, every affected section travels exactly 8px toward its final position.
  - Existing stagger order is unchanged.
  - With reduced motion enabled, dashboard and plan have no positional entrance; welcome follows the system preference through Reanimated.
- **Done when**: no affected `FadeInUp` uses its stock 25px initial transform or default easing.
