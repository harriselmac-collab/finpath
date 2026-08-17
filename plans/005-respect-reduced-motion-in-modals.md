# 005 — Respect reduced motion in modals

- **Status**: DONE
- **Commit**: a4bf22b
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 2 files, small

## Problem

The quick-action sheet and two goal modals always request React Native's positional `slide` animation, even when the operating system's reduced-motion preference is enabled.

```tsx
// src/app/(tabs)/_layout.tsx:119-124 — current
<Modal
  transparent
  visible={showAddSheet}
  animationType="slide"
  onRequestClose={() => setShowAddSheet(false)}
>
```

```tsx
// src/app/(tabs)/goals/index.tsx:144 and 153 — current
<Modal visible={editorOpen} animationType="slide" onRequestClose={() => setEditorOpen(false)}>
{/* ... */}
<Modal visible={Boolean(historyGoal)} animationType="slide" onRequestClose={() => setHistoryGoal(null)}>
```

The goals screen already reads `useReducedMotion()`, but currently uses it only to disable the celebration overlay.

## Target

Use React Native's opacity-only `fade` animation when reduced motion is enabled. Preserve `slide` for the standard-motion spatial transition.

```tsx
animationType={reduceMotion ? 'fade' : 'slide'}
```

Apply that exact expression to the quick-action sheet, goal editor, and goal history modal. Existing contribution and completion dialogs already use `fade` and must stay unchanged.

## Repo conventions to follow

- `src/app/(tabs)/goals/index.tsx:47` already declares `const reduceMotion = useReducedMotion();`; reuse it.
- Reanimated 4.5.1 is already installed and provides `useReducedMotion()`; do not add a platform-specific listener.
- `DESIGN.md:48` requires honoring the system reduced-motion preference.

## Steps

1. In `src/app/(tabs)/_layout.tsx`, import `useReducedMotion` from `react-native-reanimated` and declare `const reduceMotion = useReducedMotion();` inside `TabLayout`.
2. Change only the quick-action modal's `animationType` to the target conditional expression.
3. In `src/app/(tabs)/goals/index.tsx`, reuse the existing `reduceMotion` value and update only the editor and history modal `animationType` props.
4. Leave all modal visibility, close handlers, focus/accessibility behavior, and content unchanged.

## Boundaries

- Do NOT replace React Native `Modal` or build a custom sheet.
- Do NOT change the contribution or completed-goal fade dialogs.
- Do NOT alter routing, goal state, or quick-action behavior.
- Do NOT add dependencies.
- `_layout.tsx` and `goals/index.tsx` contained user work when this plan was authored; if the modal excerpts drift, STOP and report rather than overwriting newer changes.

## Verification

- **Mechanical**: run `npx tsc --noEmit`, `npm run lint`, and `npm test -- --runInBand`.
- **Feel check**: on Android and iOS if available, toggle the OS reduced-motion setting and open/close the quick-action sheet, goal editor, and goal history:
  - Standard motion slides all three surfaces as before.
  - Reduced motion uses fade only; no surface translates across the screen.
  - Back gestures and `onRequestClose` still close the correct modal.
- **Done when**: no live `slide` modal in these two files is unconditional.
