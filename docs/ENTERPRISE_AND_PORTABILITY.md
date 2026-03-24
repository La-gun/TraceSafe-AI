# Enterprise, portability, and dual-store operations

This document **corrects** two common misconceptions about TraceSafe’s architecture: total “platform lock-in,” and unmanaged dual-database risk.

---

## Hosted backend (Base44) — dependency vs lock-in

**Accurate framing:** TraceSafe depends on **Base44** for hosted authentication, entity APIs, and execution of the functions in `base44/functions/`. That is a **real vendor dependency**, comparable to Firebase, Supabase, or another BaaS — not a bespoke black box that holds all of your logic.

**What you actually own and can migrate:**

| Asset | Where it lives |
|--------|----------------|
| Client app (routes, UI, state) | This repo |
| Server behaviour (scan, commission, AI, seeds, etc.) | This repo (`base44/functions/*.ts`) |
| Domain entities and fields | Documented in [`DATABASE.md`](./DATABASE.md) for export/ETL or reimplementation |
| NFT registry data (when enabled) | **PostgreSQL you provision** (connection string in your secrets — Neon, RDS, Supabase, etc.) |

Business rules and integrations are **versioned in git**. Moving to another host means **replatforming** the same way any team would when changing backend vendors: rewire auth, replace entity APIs, and redeploy functions — not recovering logic from an opaque console.

**Enterprise due diligence** should still include Base44 (or any vendor) **terms, regions, subprocessors, backup/export, and SLAs** — standard for SaaS/BaaS procurement. The earlier “lock-in” wording overstated the case: the risk is **managed-backend dependency**, mitigated by **source ownership**, **documented schemas**, and **optional Postgres under your account**.

---

## Base44 + NFT registry — split of concerns, not two chaotic sources of truth

**Accurate framing:** The optional **PostgreSQL NFT registry** is a **separate concern** (taxonomy, physical assignment, optional on-chain metadata), not a second copy of scan history fighting Base44.

### Single-store mode

If `NFT_REGISTRY_DATABASE_URL` / `DATABASE_URL` is **not** set, NFT helpers **return `skipped` / `null`** (`base44/functions/_shared/nftRegistrySync.ts`). The product runs **Base44-only**. Dual-store is **opt-in**, not mandatory for every deployment.

### When Postgres is configured

- **Commission:** After a successful Base44 write, `syncCommissionedTagToNftRegistry` runs in a **single transaction** with **`ON CONFLICT` upserts** on stable keys (`tag_uid`, `(tenant_id, code)`, etc.). **Retries are idempotent** at the database layer.
- **Scans:** `scanTag` may **attach** `nft_registry` fields when present; **scan events and enforcement** remain driven by Base44 entities as documented in [`DATABASE.md`](./DATABASE.md).
- **Failure handling:** `NFT_REGISTRY_SYNC_STRICT` (see [`DATABASE.md`](./DATABASE.md)) defines whether a failed NFT sync fails the HTTP response after the Base44 row already exists; the API surfaces `nft_registry_sync` so clients can observe outcomes.

### Reconciliation and queues

[`DATABASE.md`](./DATABASE.md) describes **event-driven or scheduled reconciliation** as a **scaling/pattern** option for complex topologies. **This repo’s implemented path** is **inline sync on commission** plus **read-side enrichment on scan**, not a mandatory separate message bus. Adding nightly reconciliation or a queue is an **operational upgrade**, not proof that today’s design is undefined.

**Monitoring** for production still belongs on both systems (Base44 dashboards + Postgres metrics/alerts) whenever the NFT DB is enabled — that is ordinary dual-system ops, not an unresolved architectural gap.

---

## Summary

1. **Vendor relationship:** Strong **dependency** on Base44 for hosted services; **not** “all logic and data trapped in one vendor” — app and function code are in-repo, NFT data can be in **your** Postgres, entities are documented for export/migration planning.
2. **Dual store:** **Optional** second database with a **documented authority split**, **idempotent upserts**, **explicit strict/non-strict failure behaviour**, and an implementation that matches the documented boundaries; extra reconciliation/queues are **enhancements**, not prerequisites for coherence.
