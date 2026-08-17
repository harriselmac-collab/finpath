# Pocket Ahead Feature & Polish Update Roadmap

This document outlines the planned feature additions, UX enhancements, and premium polish for upcoming versions of **Pocket Ahead**.

---

## 🧭 Product Vision
Pocket Ahead aims to be the most private, intuitive, and reassuring personal-finance planning tool—answering with absolute clarity: **“What can I safely spend before my next income?”**

---

## 🚀 Phase 1: Daily Flow, Biometrics & Tactical Delight (Version 1.1)

### 1. Biometric Security Lock (FaceID / Fingerprint)
* **Goal**: Deliver a banking-grade, privacy-first user experience.
* **Details**:
  * Seamless unlock via FaceID / TouchID / Biometrics (`expo-local-authentication`).
  * Optional app auto-lock timer (Immediate, 1 min, 5 min).
  * Safe PIN or passcode fallback without exposing app state in app switcher.

### 2. Tactile Haptic Micro-Interactions
* **Goal**: Make every action inside the app feel responsive and premium.
* **Details**:
  * Subtle haptic feedback (`expo-haptics`) when:
    * Adding a transaction or income.
    * Completing or reaching a savings goal milestone.
    * Toggling dates in the date picker.
    * Switching tabs or adjusting budget sliders.

### 3. "Can I Afford This?" Instant Purchase Simulator
* **Goal**: Help users make confident, instant spending decisions without anxiety.
* **Details**:
  * Enter a hypothetical purchase amount (e.g. *MAD 450* / *$50*).
  * Instantly preview:
    * Projected remaining safe-to-spend total.
    * Adjusted safe daily spending allowance.
    * Status indicator: `Safe ✅`, `Caution ⚠️`, or `Shortfall ❌`.
  * One-tap action to convert the simulated purchase into a recorded transaction.

### 4. 1-Tap Quick Add Templates
* **Goal**: Reduce transaction logging time to under 2 seconds.
* **Details**:
  * Display the 3 most frequent recent expense categories (e.g. *Coffee, Groceries, Commute*) at the top of the Add modal.
  * Tapping a template prefills category, currency, and date—requiring only amount confirmation.

---

## 📊 Phase 2: Cash Flow Timeline, Interactive Charts & Debt Master (Version 1.2)

### 1. "Until-Payday" Cash Flow & Bill Timeline
* **Goal**: Give complete visibility into upcoming financial obligations before next income.
* **Details**:
  * Visual timeline between today and the next income date.
  * Highlights upcoming bills, recurring debt payments, and protected savings buffer.
  * Clear warning if an upcoming commitment exceeds available safe funds.

### 2. Interactive Chart Scrubbing
* **Goal**: Transform static graphs into an engaging, explorative visual tool.
* **Details**:
  * Drag finger horizontally across the safe-to-spend curve to see projected balance on any future day.
  * Smooth tooltip animation displaying exact date and estimated cash balance.

### 3. Debt Payoff Strategy Engine (Snowball vs. Avalanche)
* **Goal**: Provide actionable wealth-building guidance.
* **Details**:
  * Compare **Debt Snowball** (lowest balance first) vs. **Debt Avalanche** (highest interest first).
  * Interactive "Extra Monthly Payment" slider showing how extra contributions shorten debt-free timelines and save interest.

### 4. Emergency Buffer Health Ring
* **Goal**: Visually reinforce financial resilience.
* **Details**:
  * Circular progress ring showing the health of the user's safety cushion / emergency reserve.

---

## 📈 Phase 3: Analytics, Statement Importer & Wallet Passes (Version 1.3)

### 1. "Month in Review" Story Card
* **Goal**: Celebrate financial discipline and boost engagement at the end of each month.
* **Details**:
  * Shareable, elegant summary card showing:
    * Total income vs. total spent.
    * Top spending category.
    * Savings goals progressed.
    * Percentage of days spent within the daily safe budget.

### 2. Private Offline CSV Statement Importer
* **Goal**: Enable effortless bulk-entry without requiring third-party bank connections.
* **Details**:
  * Import CSV / bank export files directly on-device.
  * Automatic category detection and preview before saving.
  * 100% private and processed locally.

### 3. Google Wallet & Apple Wallet Savings Passes
* **Goal**: Bring savings milestones into native mobile wallets.
* **Details**:
  * Export dynamic savings goal passes to Google Wallet (via Stitch) and Apple Wallet.
  * Live updates as goal progress increases.

---

## 🛡️ Core Engineering Constraints (Preserve Across All Updates)

1. **Privacy & Security**: All local records remain encrypted via `SecureStore` / app-private storage; no financial data sold or sent to ad brokers.
2. **Offline-First Resilience**: Full app functionality in guest and offline mode with conflict-free Supabase sync when connected.
3. **Multilingual Parity**: Every new UI surface must support all 9 languages (*en, fr, ar [RTL], es, de, pt, it, nl, tr*).
4. **Deterministic Math**: Calculations must be transparent, explainable, and deterministic.
