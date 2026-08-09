# Stitch Design Import & Integration Guide

This guide explains how to import a pass design from Stitch (Google Wallet) into Pocket Ahead and wire it into the React Native application.

---

## 1. Prerequisites

- A **Stitch console** pass class design already created (e.g., `savings_goal_v1`)
- A **Google Cloud** project with the **Wallet API** enabled
- A **service account** JSON key with `https://www.googleapis.com/auth/wallet_object.issuer` scope
- Your **Issuer ID** (format: `33880000000000000000`)

---

## 2. Design Import Workflow

### Step 1: Define Pass Classes in Stitch Console

Log into the Stitch console and create your pass classes. Pocket Ahead currently supports:

| Class ID | Type | Description |
|----------|------|-------------|
| `savings_goal_v1` | `savingsGoal` | Tracks personal savings goal progress |
| `debt_milestone_v1` | `debtMilestone` | Tracks debt payoff milestones |
| `emergency_fund_v1` | `emergencyFund` | Tracks emergency fund buffer |

Export or note the **Issuer ID** and **Class IDs** from the console.

### Step 2: Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required fields:

```env
EXPO_PUBLIC_STITCH_ISSUER_ID=33880000000000000000
STITCH_ORIGIN_JWT=eyJhbGciOiJSUzI1NiIs...
EXPO_PUBLIC_STITCH_SAVINGS_GOAL_CLASS=savings_goal_v1
EXPO_PUBLIC_STITCH_DEBT_MILESTONE_CLASS=debt_milestone_v1
EXPO_PUBLIC_STITCH_EMERGENCY_FUND_CLASS=emergency_fund_v1
```

> **Security note:** `STITCH_ORIGIN_JWT` is a server-side credential. Never bundle it into the client app in production. Route pass creation through your backend.

### Step 3: Initialize the Stitch Client

```tsx
import { createStitchClient } from '../services/stitch';

const stitchClient = createStitchClient({
  issuerId: process.env.EXPO_PUBLIC_STITCH_ISSUER_ID!,
  originJwt: process.env.STITCH_ORIGIN_JWT,
});
```

### Step 4: Create pass objects from Pocket Ahead data

Use the pass factories to generate pass objects from user financial data:

```tsx
import {
  buildSavingsGoalObject,
  objectToStitchFormat,
} from '../services/stitch/passes';

const goalObject = buildSavingsGoalObject(
  issuerId,
  'Emergency Protection Fund',
  15000,
  3000,
  18,
  'MAD'
);

const stitchObject = objectToStitchFormat(goalObject);
await stitchClient.createPassObject(stitchObject);
```

### Step 5: Generate Wallet Save Link

```tsx
import { getPassJwt, savePassToWallet } from '../services/stitch/client';

const jwtResponse = await stitchClient.getPassJwt(stitchObject.id);
const walletUrl = `https://pay.google.com/gp/v/save/${jwtResponse.jwt}`;
```

### Step 6: Render the Pass Card

```tsx
import { PassCard } from '../components/ui/PassCard';

<PassCard
  title={goalObject.title}
  subtitle={goalObject.subtitle}
  details={goalObject.details}
  type="savingsGoal"
  walletUrl={walletUrl}
  onSaveToWallet={() => console.log('Pass saved')}
/>
```

---

## 3. File Format Requirements

### Pass Class JSON (Stitch Console Export)

```json
{
  "id": "33880000000000000000.savings_goal_v1",
  "issuerId": "33880000000000000000",
  "type": "savingsGoal"
}
```

### Pass Object JSON (API Payload)

```json
{
  "id": "33880000000000000000.savings_goal_1710000000000",
  "classId": "33880000000000000000.savings_goal_v1",
  "state": "ACTIVE",
  "barcode": {
    "type": "QR_CODE",
    "value": "FINPATH-SG-EMERGENCY-FUND-1710000000000"
  },
  "textModulesData": [
    { "header": "Target", "body": "MAD 15,000.00" },
    { "header": "Saved", "body": "MAD 3,000.00" }
  ]
}
```

---

## 4. Integration Tools

- **MCP Server (dev):** `https://stitch.googleapis.com/mcp` with `X-Goog-Api-Key` header
- **REST API (prod):** `https://walletobjects.googleapis.com/walletobjects/v1`
- **Service Modules:** `src/services/stitch/` (client, types, pass factories)
- **UI Component:** `src/components/ui/PassCard.tsx`

---

## 5. Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| `401 Unauthorized` | Invalid or expired `originJwt` | Regenerate service account token |
| `404 Not Found` | Class ID not created in Stitch console | Create class in console first |
| `403 Forbidden` | Missing Wallet API scope | Enable Wallet API in Google Cloud |
| Pass not opening | Invalid JWT or save URL | Verify `getPassJwt` response |

---

## 6. Next Steps

- Connect pass creation to the **Goals tab** in Pocket Ahead (`src/app/(tabs)/goals/index.tsx`)
- Add pass management to the **Profile tab**
- Implement server-side proxy for secure pass creation
