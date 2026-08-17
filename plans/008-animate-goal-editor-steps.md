# 008 — Animate goal-editor steps

- **Status**: DONE
- **Commit**: a4bf22b
- **Severity**: LOW
- **Category**: Missed opportunities
- **Estimated scope**: 1 file, medium

## Problem

The four-step goal editor replaces entire conditional fragments instantly when Back or Next changes `step`. The user loses directional context inside an otherwise spatial full-screen workflow.

```tsx
// src/app/(tabs)/goals/index.tsx:145-149 — current, condensed
{step === 1 && <>{/* category */}</>}
{step === 2 && <>{/* style */}</>}
{step === 3 && <>{/* details */}</>}
{step === 4 && <>{/* review */}</>}
<View style={styles.actions}>
  {step > 1 && <Button onPress={() => setStep(step - 1)} /* ... */ />}
  {step < 4
    ? <Button onPress={() => setStep(step + 1)} /* ... */ />
    : <Button onPress={validateAndSave} /* ... */ />}
</View>
```

## Target

Track whether navigation is forward or backward, then give the newly keyed step a 200ms, 8px directional entrance. Forward content enters from `translateX: 8`; backward content enters from `translateX: -8`. Use opacity-only 160ms entry under reduced motion. Do not animate the outgoing step; removing it immediately avoids double layout and keeps the wizard responsive.

```tsx
import Animated, {
  Easing,
  FadeIn,
  FadeInLeft,
  FadeInRight,
  useReducedMotion,
} from 'react-native-reanimated';

const [stepDirection, setStepDirection] = useState<'forward' | 'backward'>('forward');

const changeStep = (nextStep: number) => {
  setStepDirection(nextStep > step ? 'forward' : 'backward');
  setStep(nextStep);
};

const stepEnter = reduceMotion
  ? FadeIn.duration(160).easing(Easing.ease)
  : (stepDirection === 'forward' ? FadeInRight : FadeInLeft)
      .duration(200)
      .easing(Easing.bezier(0.23, 1, 0.32, 1))
      .withInitialValues({
        opacity: 0,
        transform: [{ translateX: stepDirection === 'forward' ? 8 : -8 }],
      });
```

```tsx
<Animated.View key={step} entering={stepEnter} style={styles.stepContent}>
  {step === 1 && <>{/* existing category markup */}</>}
  {step === 2 && <>{/* existing style markup */}</>}
  {step === 3 && <>{/* existing detail markup */}</>}
  {step === 4 && <>{/* existing review markup */}</>}
</Animated.View>
```

Back and Next must call `changeStep(step - 1)` and `changeStep(step + 1)`. Opening or reopening the editor resets both `step` to 1 and `stepDirection` to `'forward'`.

## Repo conventions to follow

- `src/app/onboarding/quiz.tsx:445-449` already selects `FadeInRight` for forward and `FadeInLeft` for backward navigation; follow that direction convention.
- Override the stock preset's 25px travel with exactly 8px.
- `src/components/ui/Button.tsx:112-126` supplies `Easing.bezier(0.23, 1, 0.32, 1)`.
- The goals screen already calls `useReducedMotion()`; reuse the same value.

## Steps

1. In `src/app/(tabs)/goals/index.tsx`, change the Reanimated import to include the default `Animated` export plus `Easing`, `FadeIn`, `FadeInLeft`, and `FadeInRight`; keep `useReducedMotion`.
2. Add `stepDirection` beside the existing `step` state.
3. Add `changeStep(nextStep)` and the exact `stepEnter` builder near the other local handlers.
4. Update `openCreate` and `openEdit` to reset `stepDirection` to `'forward'` whenever they reset the step to 1.
5. Wrap only the four conditional step fragments in `Animated.View key={step} entering={stepEnter}`. Do not include the Back/Next/Save action row in the animated wrapper.
6. Replace Back and Next's direct `setStep` calls with `changeStep`.
7. Add `stepContent: { gap: SPACING.md }` only if needed to preserve the current modal-content spacing after introducing the wrapper; do not reformat unrelated one-line JSX.

## Boundaries

- Do NOT animate the outgoing step or keep two steps mounted simultaneously.
- Do NOT change validation, form state, goal persistence, reminders, modal behavior, or step contents.
- Do NOT add swipe gestures, springs, haptics, or dependencies.
- Do NOT modify modal `animationType`; plan 005 owns reduced-motion modal behavior.
- `goals/index.tsx` contained uncommitted user changes when this plan was authored. If the condensed section has drifted, STOP and report rather than formatting or replacing the file wholesale.

## Verification

- **Mechanical**: run `npx tsc --noEmit`, `npm run lint`, and `npm test -- --runInBand`.
- **Feel check**: open the goal editor and navigate 1→2→3→4→3→2→1:
  - Forward steps enter from 8px right; backward steps enter from 8px left.
  - The outgoing step disappears immediately, so no duplicate vertical space or double-exposed controls appear.
  - Back/Next buttons remain stable and immediately usable.
  - Rapid navigation never shows the wrong step or loses form state.
  - Reduced motion uses a 160ms fade only, with no horizontal movement.
- **Done when**: every step change has correct directional context, no outgoing layout overlap, and unchanged goal-editor behavior.
