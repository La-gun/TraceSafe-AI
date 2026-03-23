# Data layer (Base44)

This app does **not** use a checked-in SQL or SQLite database. **Base44** hosts your entities (tables), auth, and APIs. You define and migrate schemas in the [Base44](https://base44.com) builder; this repo holds **functions** under `base44/functions/` that read/write those entities.

## Entities used in code

| Entity | Purpose |
|--------|---------|
| `Batch` | Product batches, zones, diversion score, enforcement status |
| `TagRegistry` | NFC tag UIDs linked to batches |
| `ScanEvent` | Individual scan / commissioning / transfer events |
| `DiversionAlert` | Regulator alerts |
| `CustodyTransfer` | Partner handoffs |
| `AggregationLink` | Parent/child tag hierarchy |
| `BatchStatus` | Enforcement workflow status |
| `ConsumerReport` | Consumer Assist / incident queue |
| `InspectionReport` | Field inspection submissions |
| `ContactLead` | Contact form |
| `Partner` | Supply chain partners |

Field names must match what you configure in Base44. If a `create()` fails after deploy, adjust the entity schema in the builder to include any missing fields.

## Seeding demo data

Function: **`seedDemoData`** (`base44/functions/seedDemoData/entry.ts`)

- **Who can run:** signed-in user with **`role === "admin"`** (set in Base44 for your admin user).
- **Idempotent:** skips batches/tags that already exist (use `forceTags: true` to replace demo tags only).

### From the browser (after admin login)

```js
const { base44 } = await import('/src/api/base44Client.js'); // path as in your app
await base44.functions.invoke('seedDemoData', { dryRun: true });  // preview
await base44.functions.invoke('seedDemoData', {});                // apply
```

Or use the **Dev tools → Network** tab while triggering a small admin-only UI if you add one.

### Demo NFC UIDs (Inspector portal)

After seeding:

| UID | Scenario |
|-----|----------|
| `NG-TG-00041872` | Hold batch (Amoxicillin) |
| `NG-TG-00091234` | Active (Paracetamol) |
| `NG-TG-00055678` | Recalled (Hand sanitizer) |

## Local env

Point the app at your Base44 backend (see `README.md`):

```env
VITE_BASE44_APP_ID=...
VITE_BASE44_APP_BASE_URL=https://your-app.base44.app
```

## Optimisations

- React Query defaults are tuned in `lib/query-client.js` (caching, fewer refetches).
- Vite code-splitting groups heavy vendors in `vite.config.js`.
- Prefer `list(..., limit)` and parallel `Promise.all` in functions (already used in `getDashboardStats`, `inspectorAI`).
