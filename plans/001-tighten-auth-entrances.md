# 001 — Tighten auth entrances

- **Status**: DONE
- **Commit**: a4bf22b
- **Severity**: HIGH
- **Category**: Easing & duration
- **Estimated scope**: 1 file, small

## Problem

The sign-in/sign-up screen delays its primary task behind three 500ms entrances. The form starts after 300ms and does not finish settling until roughly 800ms after mount. That exceeds `DESIGN.md`'s under-250ms UI transition budget and makes a critical path feel slow.

```tsx
// src/app/auth/index.tsx:273-291 — current
<Animated.View entering={FadeInDown.duration(500)} style={styles.brandSection}>
  {/* brand */}
</Animated.View>

<Animated.View entering={FadeInDown.duration(500).delay(150)} style={styles.header}>
  {/* title and subtitle */}
</Animated.View>

<Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.form}>
  {/* authentication form */}
</Animated.View>
```

The stock `FadeInDown` preset also uses the library's default timing curve and begins 25px below its final position. Pocket Ahead calls for an 8px entrance with a strong ease-out.

## Target

Keep the existing brand → heading → form sequence, but use a 200ms entrance, 40ms stagger, 8px displacement, and the exact strong ease-out curve from the motion audit.

```tsx
import Animated, { Easing, FadeInDown, FadeOut } from 'react-native-reanimated';

const authEnter = (delay = 0) =>
  FadeInDown.duration(200)
    .delay(delay)
    .easing(Easing.bezier(0.23, 1, 0.32, 1))
    .withInitialValues({
      opacity: 0,
      transform: [{ translateY: 8 }],
    });

<Animated.View entering={authEnter()} style={styles.brandSection}>
<Animated.View entering={authEnter(40)} style={styles.header}>
<Animated.View entering={authEnter(80)} style={styles.form}>
```

The final form entrance must finish by roughly 280ms after mount. Do not delay input interactivity separately from the entrance.

## Repo conventions to follow

- `src/components/ui/Button.tsx:112-126` already uses `Easing.bezier(0.23, 1, 0.32, 1)` for responsive UI feedback.
- `DESIGN.md:43-49` permits 40–60ms first-view stagger, requires an 8px translate, and keeps UI transitions under 250ms.
- Keep Reanimated; it is already installed at version 4.5.1. Do not add another motion library.

## Steps

1. In `src/app/auth/index.tsx`, add `Easing` to the existing Reanimated import.
2. Add the local `authEnter(delay)` builder shown above near the existing `userFacingAuthError` helper. Do not create a new motion-token file for one screen.
3. Replace only the three 500ms brand/header/form entrance expressions with `authEnter()`, `authEnter(40)`, and `authEnter(80)`.
4. Leave the conditional confirm-password entrance and all authentication behavior unchanged.

## Boundaries

- Do NOT change authentication, validation, Supabase, Google Sign-In, or routing logic.
- Do NOT alter layout, copy, form fields, or styles unrelated to motion.
- Do NOT add dependencies or a global motion abstraction.
- The working tree contained uncommitted auth-adjacent work when this plan was authored. If the cited excerpt no longer matches, STOP and report drift instead of replacing newer work.

## Verification

- **Mechanical**: run `npx tsc --noEmit`, `npm run lint`, and `npm test -- --runInBand`; all must exit successfully or only report documented pre-existing failures.
- **Feel check**: open sign-in and sign-up on a real Android device and confirm:
  - Inputs are visible and usable almost immediately; the sequence completes in about 280ms.
  - Brand, header, and form travel only 8px and never feel as if they drop into place.
  - At 10% animation speed, the sequence starts quickly and decelerates smoothly.
  - With system reduced motion enabled, Reanimated's system preference suppresses positional movement.
- **Done when**: no 500ms auth entrance or 150/300ms stagger remains, and auth behavior is unchanged.
