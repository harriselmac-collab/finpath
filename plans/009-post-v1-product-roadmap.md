# 009 — Post-v1 Premium Product Roadmap

- **Status**: DEFERRED — DO NOT EXECUTE BEFORE V1 RELEASE
- **Category**: Post-v1 product roadmap
- **First update estimate**: 2–3 weeks
- **Activation gate**: Begin only after the first production release is published to its target store and passes real-device smoke testing.

## Locked product choices

- Prioritize Morocco and MENA while preserving the existing global foundation.
- Improve product quality before introducing monetization or paywalls.
- Reduce transaction-entry friction through smart manual workflows before attempting bank sync.
- Use deterministic, explainable financial calculations; do not add AI to the first update.
- Keep the first post-v1 update focused enough to deliver in 2–3 weeks.

## Product position

Pocket Ahead should answer one question exceptionally well: **“What can I safely spend before my next income?”**

The app already has the right foundation: safe-to-spend calculations, income timing, transactions, bills, debts, goals, reminders, encrypted persistence, account sync, and multilingual support. The roadmap adds a clearer daily decision layer instead of turning the app into a generic account aggregator.

Current competitors make bank connections, automatic categorization, goals, debt tools, recurring calendars, reporting, and household collaboration common expectations:

- [YNAB features](https://www.ynab.com/features)
- [Monarch recurring expenses and bills](https://help.monarch.com/hc/en-us/articles/4890751141908-Tracking-Recurring-Expenses-and-Bills)
- [Rocket Money FAQ](https://www.rocketmoney.com/faq)

Moroccan competitor Flouss already promotes budgeting, savings goals, AI coaching, and receipt scanning. Copying its AI or OCR features first would not give Pocket Ahead a clear advantage:

- [Flouss on Google Play](https://play.google.com/store/apps/details?id=com.iebgroup.flouss)

Safety-cushion visibility remains important because savings habits and perceived emergency preparedness are closely connected with resilience when paying bills:

- [CFPB research on preparedness and saving habits](https://www.consumerfinance.gov/data-research/research-reports/perceived-financial-preparedness-saving-habits-and-financial-security/)

## First post-v1 update

### 1. Until-payday timeline

- Add a compact dashboard summary and an expanded section in the existing Plan screen.
- Show the next income date, recurring bills, dated debt payments, paid status, protected buffer, and projected balance.
- Do not count a bill or debt twice when it is already reserved by the financial engine.
- Keep undated essential spending as a clearly labelled reserved total rather than inventing due dates.
- When the next income date is unknown, show an estimate warning and a direct action to add it.

### 2. “Can I afford this?” simulator

- Accept a discretionary purchase amount and calculate the effect locally.
- Show safe-to-spend and safe-per-day before and after the proposed purchase.
- Return a simple `safe`, `caution`, or `shortfall` result and identify the next affected commitment.
- Keep the calculation hypothetical until the user explicitly records the transaction.
- Never mutate financial data merely by opening or changing the simulator.

### 3. Cash-capture improvements

- Show the three most recent distinct transactions as reusable Quick Add templates.
- Tapping a template prefills the entry but still requires confirmation.
- Reuse the existing financial amount parser for decimal commas, currency symbols, and localized amounts.
- Add English, French, and Arabic categorization keywords; other languages retain amount-and-name parsing.
- Preserve offline behavior and the existing encrypted storage and sync flows.

### 4. Safety-cushion visibility

- Show whether the configured protected buffer remains intact after known commitments.
- If no buffer exists, invite the user to choose one without prescribing or automatically creating an amount.
- Use only deterministic calculations and neutral planning language; do not present regulated financial advice.

## Later update priorities

1. Detect likely recurring payments from transaction history and ask the user to confirm them as existing Bill records.
2. Add synchronized transaction categorization rules and CSV import.
3. Store period snapshots for an accurate monthly review showing plan versus actual results.
4. Expand the existing debt calculator into snowball and avalanche what-if comparisons.
5. Add biometric app locking.
6. Add household collaboration only after the single-user daily planning loop is validated.

## Explicitly deferred

Do not add the following until validated user demand, regional provider coverage, operating cost, security, and compliance requirements justify them:

- Bank synchronization
- Receipt OCR
- Generic AI chat or a Darija AI coach
- Investment tracking
- Net-worth tracking

These items are not part of the first post-v1 update and must not delay the initial store release.

## Interfaces and data constraints

- Add pure financial-engine types for `DatedCashEvent`, `CashProjectionPoint`, and `SpendCheckResult` when this roadmap is activated.
- Derive projections from the existing active period, bills, debts, transactions, next-income date, and protected buffer.
- Do not add a new top-level navigation tab; use the existing Dashboard, Plan, and Transactions surfaces.
- The first post-v1 update should require no Supabase migration, external API, analytics SDK, or new runtime dependency.
- Preserve backward compatibility with guest data, signed-in data, encrypted persistence, and financial synchronization.

## Verification and acceptance

- Unit-test event ordering, paid and overdue bills, recurring dates, debt-reserve deduplication, negative balances, unknown income dates, currencies, and timezone boundaries.
- Verify that hypothetical purchases never mutate stored transactions.
- Verify guest and signed-in operation, offline behavior, encrypted persistence, and sync behavior.
- Test English, French, Arabic RTL, large text, screen readers, reduced motion, and light and dark themes.
- Run the repository’s normal TypeScript, lint, and test checks.
- Complete real-device checks on the supported release platforms.
- Acceptance criterion: from the dashboard, a user can determine within ten seconds what is due before payday, what remains safe to spend, and how a proposed purchase changes that number.

## Release boundary

Saving this roadmap does not authorize implementation. Until the activation gate is satisfied, make no application-code, dependency, database, or current-release scope changes for these features.
