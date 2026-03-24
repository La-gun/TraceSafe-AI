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

**Reducing review friction (fair or not, it affects cycle time):** Lead with **what runs in your repo** (functions, rules, UI), **what Base44 provides** (auth, entity API, execution), and **what can live under your cloud** (NFT registry Postgres). Supply **entity/schema exports**, **diagrams**, and **alignment to patterns buyers already approve** (e.g. hosted Postgres in your account, secrets not in client bundles). For **AI**, use the procurement-aligned brief in [`AI_COMPLIANCE_AND_TRUST.md`](./AI_COMPLIANCE_AND_TRUST.md).

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

## Security & trust posture (NFC and location)

**Procurement and communications should align claims with what the deployed stack proves.**

### Known limitations

| Topic | Limitation |
|--------|------------|
| **NFC / tags** | Plain NFC payloads can be copied. Secure tags (e.g. NTAG 424 DNA with SDM) **raise the cost** of forgery but are **not** an absolute “unclonable” guarantee against a determined attacker with lab time and budget. |
| **Client-reported geography** | Latitude, longitude, or administrative region supplied by a browser or app **can be spoofed**. Such fields are useful for **analytics and triage**, not standalone **legal proof** of where a tap occurred unless corroborated. |

### What this codebase already uses for decisions

- **Server-authoritative registry:** Core verification (`scanTag` and related flows) resolves **tag and batch state** on the server; outcomes depend on **registered data and policy** (e.g. unknown tag, recall, expiry), not on the client’s opinion alone.
- **Authenticated operators:** Inspector and partner workflows assume **signed-in users** so events can be tied to accounts for audit trails.
- **Signals, not proof:** Zone rules and heat maps **consume supplied geography** as one input; **repeat-scan patterns** and **batch policy** add independent behavioural and registry signals.

### Planned / roadmap mitigations (deployment-tunable)

These are **intentional hardening levers** for enterprise rollouts; priority order should follow **threat model** and regulator expectations.

1. **Cryptographic tap verification** — Server-side validation of **SDM or challenge–response** outputs so a tap must present a **fresh, key-backed** answer rather than replaying static NDEF.
2. **Corroborated location trust** — Combine **coarse network-derived hints**, **trusted time**, and where appropriate **device integrity** (e.g. Play Integrity / App Attest) or **supervised field hardware** to increase confidence in geo signals.
3. **Multi-source agreement** — Use **commissioning data**, optional **NFT-registry binding** (see [`DATABASE.md`](./DATABASE.md)), and **independent scanner corroboration** to flag **inconsistent or cloned** tag behaviour.

**Marketing copy:** The public **Security & trust** section on the product home page summarises this for non-technical stakeholders; this section is the **procurement-accurate** counterpart.

---

## Differentiation: proof over feature depth

Enterprise buyers already have long checklists for **serialization**, **L4/L5 traceability**, and **brand protection**. Competing on **UI depth alone** is a weak wedge. **Commercial narrative** should foreground **evidence**:

- **Adoption** — sites, SKUs, scans, partners onboarded (even anonymised roll-up metrics).
- **Enforcement linkage** — how alerts and scans connect to **seizures, holds, recalls, or case IDs** (where disclosure allows).
- **Time-to-recall** — detect → contain → notify (targets and post-incident review).

Product and sales collateral should lead with **one or two quantified outcomes per segment** before deep feature tours.

---

## Geographic depth vs global TAM

**Deep fit** with a jurisdiction (e.g. **NAFDAC-aligned** workflows, local supply-chain language) wins **authority and national-program** conversations. For **global** buyers, frame that depth as **reference deployment and regulatory template**, not a hard ceiling: the same **authenticate → trace → enforce** stack and **documented portability** apply to **multi-region** rollouts; local copy can say **“proven regulatory depth, extensible to your markets.”**

---

## Summary

1. **Vendor relationship:** Strong **dependency** on Base44 for hosted services; **not** “all logic and data trapped in one vendor” — app and function code are in-repo, NFT data can be in **your** Postgres, entities are documented for export/migration planning.
2. **Dual store:** **Optional** second database with a **documented authority split**, **idempotent upserts**, **explicit strict/non-strict failure behaviour**, and an implementation that matches the documented boundaries; extra reconciliation/queues are **enhancements**, not prerequisites for coherence.
3. **AI trust:** See [`AI_COMPLIANCE_AND_TRUST.md`](./AI_COMPLIANCE_AND_TRUST.md) for model use, grounding, human-in-the-loop, and subprocessor framing.
