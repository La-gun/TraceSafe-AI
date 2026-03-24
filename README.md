# TraceSafe AI

**Authenticate → trace → enforce** for regulated physical goods: serialisation, scan and diversion intelligence, inspector workflows, and optional **PostgreSQL NFT registry** under your credentials.

This repo is the **application and server functions**; the default hosted backend is [Base44](https://base44.com) (auth, entities, function execution). Treat that like any **managed BaaS** in procurement: combine **in-repo logic** with **vendor terms, regions, and subprocessors**. See **[`docs/ENTERPRISE_AND_PORTABILITY.md`](docs/ENTERPRISE_AND_PORTABILITY.md)** for portability, dual-store behaviour, and **positioning** (outcomes vs feature lists, geographic depth vs global TAM). For **AI** (Inspector assistant, optional vision assist, advisory signals), see **[`docs/AI_COMPLIANCE_AND_TRUST.md`](docs/AI_COMPLIANCE_AND_TRUST.md)**.

**Marketing metrics (placeholders):** Illustrative design targets for the home hero and the **`/Proof`** one-pager ([`pages/Proof.jsx`](pages/Proof.jsx)) come from **[`data/outcomeMetrics.js`](data/outcomeMetrics.js)** — edit that file (and `HERO_METRIC_IDS` if you change which tiles appear) when you publish real customer-approved numbers.

---

## Local development

1. Clone the repository  
2. `npm install`  
3. Create `.env.local`:

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

# Example:
VITE_BASE44_APP_BASE_URL=https://verify-track-guard.base44.app
```

4. **NFT registry (optional):** set Postgres URLs as **Base44 function secrets**, not in Vite — [`docs/DATABASE.md`](docs/DATABASE.md).  
5. Run: `npm run dev`

Pushes to the connected Git remote sync with the Base44 builder; publish from [Base44.com](https://base44.com) when ready. Builder docs: [Using GitHub](https://docs.base44.com/Integrations/Using-GitHub).

---

## Database and demo data

Entities live in **Base44** (configured in the builder). Schema and seeding: [`docs/DATABASE.md`](docs/DATABASE.md). After deploy, run **`seedDemoData`** once as an **admin** user to load demo batches, tags, and incidents.

---

## Support

- Base44: [app.base44.com/support](https://app.base44.com/support)
