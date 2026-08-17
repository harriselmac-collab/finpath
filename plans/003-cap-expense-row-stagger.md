# 003 — Cap expense-row stagger

- **Status**: DONE
- **Commit**: a4bf22b
- **Severity**: MEDIUM
- **Category**: Purpose & frequency
- **Estimated scope**: 1 file, small

## Problem

Every expense row waits `index × 50ms` and then animates for 400ms. The initial list can contain many generated expenses, so later rows settle hundreds of milliseconds late. A newly appended tenth row starts after 450ms and finishes around 850ms after the user acts.

```tsx
// src/app/onboarding/essential-expenses.tsx:394-400 — current
{expenses.map((item, index) => (
  <Animated.View
    key={item.id}
    entering={reduceMotion ? undefined : FadeInUp.delay(index * 50).duration(400)}
    exiting={reduceMotion ? undefined : FadeOut.duration(250)}
    layout={reduceMotion ? undefined : LinearTransition}
  >
```

## Target

Use a 40ms stagger capped after the third position, a 220ms entrance, 8px travel, and the exact strong ease-out. No row may wait more than 80ms before beginning.

```tsx
entering={reduceMotion
  ? undefined
  : FadeInUp.duration(220)
      .delay(Math.min(index, 2) * 40)
      .easing(Easing.bezier(0.23, 1, 0.32, 1))
      .withInitialValues({
        opacity: 0,
        transform: [{ translateY: 8 }],
      })}
```

Keep the current exit and layout behavior in this plan. They are separate concerns and should not be changed opportunistically.

## Repo conventions to follow

- `src/components/ui/Button.tsx:112-126` supplies the exact strong ease-out curve.
- `DESIGN.md:43-49` allows 40–60ms first-view stagger, 8px travel, and under-250ms transitions.
- Preserve the existing `useReducedMotion()` branch in this screen.

## Steps

1. Add `Easing` to the Reanimated import in `src/app/onboarding/essential-expenses.tsx`.
2. Replace only the row `entering` expression with the exact target above.
3. Keep the `FadeOut.duration(250)` and `LinearTransition` props unchanged.

## Boundaries

- Do NOT change expense creation, editing, deletion, reclassification, persistence, or plan generation.
- Do NOT animate amounts or badges separately.
- Do NOT alter the add-expense form entrance.
- Do NOT add dependencies or new shared helpers for this single expression.
- If the mapped-row excerpt has drifted, STOP and report instead of improvising.

## Verification

- **Mechanical**: run `npx tsc --noEmit`, `npm run lint`, and `npm test -- --runInBand`.
- **Feel check**: populate at least ten expenses, open the review, then add and delete a custom expense:
  - Rows 4 onward all begin after the same 80ms maximum delay.
  - A new row never waits hundreds of milliseconds for its index-based delay.
  - At 10% speed, travel is 8px and no row animation exceeds 220ms.
  - With reduced motion enabled, row entrances remain disabled.
- **Done when**: `index * 50` and `duration(400)` no longer exist on expense-row entrances.
