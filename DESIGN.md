# Design system: Pocket Ahead serene guidance

## 1. Visual theme and atmosphere

Pocket Ahead is a calm financial workspace: clear, optimistic, and quietly precise. Density is balanced (5/10), variance is editorial but controlled (5/10), and motion is restrained (3/10). Generous spacing and clear monetary hierarchy should reduce anxiety rather than resemble a trading terminal.

## 2. Color palette and roles

- **Cool cloud** (`#F7F8FC`) — app canvas and primary background.
- **Paper white** (`#FFFFFF`) — elevated financial summaries and interactive surfaces.
- **Deep navy ink** (`#101B3A`) — primary text and projection surfaces.
- **Pocket cobalt** (`#1858EB`) — primary actions, progress, focus, and active navigation.
- **Pocket lime** (`#C4E02D`) — selected states and high-value highlights with dark text.
- **Quiet cobalt** (`#EEF2FF`) — low-emphasis icon and input backgrounds.
- **Cool border** (`#DDE2EF`) — dividers and accessible outlines.
- **Muted slate** (`#596176`) — secondary text and metadata.

No neon, purple, pure-black backgrounds, or multicolor gradients.

Dark mode follows the supplied **Midnight Kinetic** reference: a charcoal canvas (`#0E141B`) with graphite surfaces stepping from `#080F16` through `#2F353D`. Electric blue (`#1958EB`) owns primary actions, soft periwinkle (`#B6C4FF`) marks active navigation and focus, and kinetic lime (`#C0DB2F`) is reserved for positive financial data and progress. Primary text is cool white (`#DDE3ED`) and supporting text is muted lavender-gray (`#C3C5D8`).

## 3. Typography rules

- **Display and data:** Space Grotesk Bold, tight tracking, tabular-feeling financial figures.
- **Body and labels:** Space Grotesk Regular, Medium, and SemiBold with relaxed line height.
- **Arabic:** Cairo exclusively, at matching weights with line heights tuned for Arabic legibility.
- Headings use sentence case. Body copy stays concise and readable at a maximum comfortable line length.
- Financial amounts own the hierarchy; labels should not compete with them.

## 4. Component styling

- **Buttons:** 52–56px tall, 12px radius, cobalt primary fill, lime secondary fill, and visible focus/pressed feedback.
- **Cards:** 16px radius with a cool navy-tinted ambient shadow only when elevation communicates hierarchy.
- **Choice rows:** white surface, cool outline, minimum 72px height, and lime selected state.
- **Inputs:** label above, cool outline, cobalt focus state, error below.
- **Progress:** cobalt fill on a cool gray track. Animate the fill once with transform, never layout.
- **Navigation:** fixed white bottom rail; cobalt active state; central Add action is visually strongest.

## 5. Layout principles

- Use a mobile-first 8pt spacing system with 20–24px page gutters.
- Prefer open sections and dividers over nested cards.
- Keep one dominant financial surface per viewport.
- Mobile content is single-column. Wide web views use a centered content column rather than stretching edge to edge.
- All touch targets are at least 44px.

## 6. Motion and interaction

- Motion must explain state, preserve spatial continuity, or provide press feedback.
- First-view sections may enter with opacity plus an 8px translate using 40–60ms stagger.
- UI transitions stay under 250ms and use strong ease-out timing.
- Pressables scale to `0.97–0.98` for 120–160ms.
- Frequent tab and keyboard navigation stays effectively instant.
- Animate only transforms and opacity; honor the system reduced-motion preference.

## 7. Banned patterns

- No emojis, generic AI gradients, outer glows, excessive pills, or decorative status clutter.
- No card-inside-card stacks or three equal feature cards.
- No perpetual decorative motion, slow ease-in transitions, or animations over 300ms for routine UI.
- No fake finance metrics, generic placeholder names, or anxious trading language.
- No inaccessible contrast, hidden focus states, or touch targets below 44px.
