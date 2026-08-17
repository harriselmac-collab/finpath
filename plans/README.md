# Pocket Ahead animation plans

These plans were authored against commit `a4bf22b` and executed against the visible working tree. Existing uncommitted user work in overlapping target files was preserved.

| # | Plan | Severity | Status |
| --- | --- | --- | --- |
| 001 | [Tighten auth entrances](001-tighten-auth-entrances.md) | HIGH | DONE |
| 002 | [Align first-view motion](002-align-first-view-motion.md) | MEDIUM | DONE |
| 003 | [Cap expense-row stagger](003-cap-expense-row-stagger.md) | MEDIUM | DONE |
| 004 | [Preserve reduced-motion press feedback](004-preserve-reduced-motion-press-feedback.md) | MEDIUM | DONE |
| 005 | [Respect reduced motion in modals](005-respect-reduced-motion-in-modals.md) | MEDIUM | DONE |
| 006 | [Reveal the first plan result](006-reveal-first-plan-result.md) | LOW | DONE |
| 007 | [Animate progressive setup expansion](007-animate-progressive-setup-expansion.md) | LOW | DONE |
| 008 | [Animate goal-editor steps](008-animate-goal-editor-steps.md) | LOW | DONE |

## Recommended execution order

1. **001** — remove the most visible delay from the critical authentication path.
2. **004** — restore high-frequency press feedback for reduced-motion users.
3. **005** — remove unconditional slide movement from live modal flows.
4. **002** — align the app's principal first-view motion with its restrained design system.
5. **003** — prevent list-size-dependent delays in expense review.
6. **006** — add restrained emphasis to the first-plan milestone.
7. **007** — explain progressive-setup expansion spatially.
8. **008** — add directional context to the goal wizard.

## Dependencies and collision notes

- The plans have no functional dependencies and add no packages.
- Execute **002 before 007** because both edit `src/app/(tabs)/dashboard/index.tsx`.
- Execute **005 before 008** because both edit `src/app/(tabs)/goals/index.tsx`.
- Do not execute those same-file pairs concurrently.
- Plan **006** may reuse the local entrance-builder shape introduced by **002**, but it must remain local to `review.tsx`; no shared abstraction is required.

## Post-v1 product roadmap

| # | Plan | Status | Activation gate |
| --- | --- | --- | --- |
| 009 | [Post-v1 premium product roadmap](009-post-v1-product-roadmap.md) | DEFERRED | First production release is published and passes real-device smoke testing |

Plan **009** is intentionally outside the animation execution sequence. Do not implement it or widen the current release scope before its activation gate is satisfied.

## Global verification baseline

After each plan, run:

```powershell
npx tsc --noEmit
npm run lint
npm test -- --runInBand
```

Then perform the plan's real-device feel check with normal and reduced motion. Expo SDK 57 targets React Native 0.86, matching this repository's declared stack; do not upgrade Expo, React Native, or Reanimated as part of these plans.
