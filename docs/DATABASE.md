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
const { base44 } = await import('/src/lib/base44Client.js'); // path as in your app
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

---

## NFT tag registry (separate database)

Operational NFC data stays in Base44 (`TagRegistry`, `AggregationLink`, `ScanEvent`). **NFT catalog, hierarchy, mint state, and bulk tag uploads** live in a **separate SQL database** so you can:

- Version and govern NFT metadata independently of scan throughput
- Attach **parent → child** enterprise structure (org → brand → SKU → collection → token class → physical tag)
- Record **on-chain** contract / token id / mint tx without overloading the tag table
- Prove **what metadata a consumer saw at time T** (`nft_metadata_revision`)
- Keep an **append-style audit** of registry changes (`nft_audit_event`)

### Layout in this repo

| Path | Engine | Purpose |
|------|--------|---------|
| `database/nft-registry/postgres/001_schema.sql` | PostgreSQL 14+ | Schema `nft_registry`, enums, core tables, subtree view |
| `database/nft-registry/postgres/002_triggers.sql` | PostgreSQL | Maintains `path` / `depth` on `nft_hierarchy_node` |
| `database/nft-registry/sqlite/001_schema.sql` | SQLite 3 | Same logical model for local dev / tooling |

Apply order (Postgres): `001_schema.sql` then `002_triggers.sql`.

**Bridge fields to Base44:** `physical_tag_assignment.tag_uid` ↔ `TagRegistry.tag_uid`; `platform_product_id` / `platform_product_catalog_link` ↔ `TagRegistry.product_id` (or your SKU id).

### How this can enhance TraceSafe (beyond “another table”)

1. **Dual verification** — Inspector flow can require agreement between Base44 scan state and NFT DB mint/binding state (catches “real NFC, wrong collection” or stale metadata).
2. **Regulatory narrative** — Time-stamped metadata revisions give a defensible story for NAFDAC-style inquiries (“this batch pointed at revision 3 as of date X”).
3. **Supply-chain NFT** — Parent/child mirrors pallets → cases → items; token records can anchor the **case** while physical rows anchor **each tap**.
4. **Partner onboarding** — Tenants load tag CSVs into `physical_tag_assignment` (`status = inventory`) before commissioning hits Base44; ETL validates codes against hierarchy.
5. **Analytics without touching ops DB** — Heavy joins on taxonomy + token lifecycle run on a read replica of the NFT DB, leaving Base44 entity APIs fast.
6. **Future: consumer wallet claims** — `nft_token_record` is the natural place to track transfer/burn when you add consumer ownership.

Integration pattern: event-driven sync (commission in Base44 → queue message → upsert NFT DB) or nightly reconciliation jobs; keep Base44 authoritative for **scans**, NFT DB authoritative for **taxonomy, mint, and marketing/legal metadata**.

### Wired in this repo

- **`commissionTag`** — after a successful Base44 write, calls `syncCommissionedTagToNftRegistry` (`base44/functions/_shared/nftRegistrySync.ts`). Response includes `nft_registry_sync` (`skipped` | `ok` | `ok: false` + error).
- **`scanTag`** — when Postgres is configured, attaches `nft_registry` on successful lookups (hierarchy + optional on-chain fields).
- **`seedDemoData`** — after each demo tag is created, runs the same sync; summary includes `nft_registry_synced` / `nft_registry_skipped` / `nft_registry_failed`.
- **UI** — **Dashboard** (signed-in **admin**): `CommissionTagPanel` → `commissionTag`. **Inspector Portal** scan results: `NftRegistryScanPanel` when `nft_registry` is present.

### Local Postgres (Docker)

1. Start **Docker Desktop**.
2. From the repo, run either:
   - **PowerShell:** `powershell -ExecutionPolicy Bypass -File database/nft-registry/apply-schema.ps1`
   - **Bash:** `bash database/nft-registry/apply-schema.sh`
3. Or only compose (first boot applies SQL via init):  
   `cd database/nft-registry && docker compose up -d`  
   Connection string: `postgres://tracesafe:tracesafe_dev@localhost:5433/nft_registry`

Deployed Base44 functions **cannot** use `localhost`; point secrets at a **hosted** Postgres (Neon, Supabase, RDS, etc.) or a tunnel.

### Base44 secrets (deploy)

Set via [Base44 secrets](https://docs.base44.com/developers/references/cli/commands/secrets-set) (available to functions as `Deno.env`). From the project root, after `npx base44 login` (or device flow):

```bash
npx base44 secrets set NFT_REGISTRY_DATABASE_URL="postgres://USER:PASSWORD@HOST:5432/nft_registry"
npx base44 secrets set NFT_REGISTRY_TENANT_EXTERNAL_KEY=default NFT_REGISTRY_TENANT_DISPLAY_NAME="TraceSafe" NFT_REGISTRY_SYNC_STRICT=false
```

Or load several at once:

```bash
npx base44 secrets set --env-file database/nft-registry/secrets.local.env
```

(`secrets.example.env` is a template; copy it to `secrets.local.env`, set a real URL — `secrets.local.env` is gitignored.)

| Secret | Purpose |
|--------|---------|
| `NFT_REGISTRY_DATABASE_URL` or `DATABASE_URL` | PostgreSQL connection string (schema `nft_registry` must exist — run `database/nft-registry/postgres/*.sql` or `apply-schema.ps1`). |
| `NFT_REGISTRY_TENANT_EXTERNAL_KEY` | Optional; defaults to `default`. Stable tenant key in `nft_tenant.external_key`. |
| `NFT_REGISTRY_TENANT_DISPLAY_NAME` | Optional display name for that tenant row. |
| `NFT_REGISTRY_SYNC_STRICT` | If `true`, failed NFT sync causes **502** on `commissionTag` (Base44 tag row is already created). Default: non-strict (commission succeeds; check `nft_registry_sync`). |
