# TraceSafe AI

**Authenticate → trace → enforce** for regulated physical goods: serialisation, scan and diversion intelligence, inspector workflows, and optional **PostgreSQL NFT registry** under your credentials.

This repository is the **source of truth** for the web app and **server functions** under [`server/functions/`](server/functions/). Use **GitHub** (or any Git host) for version control and collaboration. Configure your deployment and API endpoints via environment variables—see below.

For portability, dual-store behaviour, and procurement positioning, see **[`docs/ENTERPRISE_AND_PORTABILITY.md`](docs/ENTERPRISE_AND_PORTABILITY.md)**. For **AI** (Inspector assistant, optional vision assist, advisory signals), see **[`docs/AI_COMPLIANCE_AND_TRUST.md`](docs/AI_COMPLIANCE_AND_TRUST.md)**.

**Marketing metrics (placeholders):** Illustrative design targets for the home hero and the **`/Proof`** one-pager ([`pages/Proof.jsx`](pages/Proof.jsx)) come from **[`data/outcomeMetrics.js`](data/outcomeMetrics.js)** — edit that file (and `HERO_METRIC_IDS` if you change which tiles appear) when you publish real customer-approved numbers.

---

## Local development

1. Clone the repository  
2. `npm install`  
3. Create `.env.local`. Pick **REST** (default) or **Supabase** — full contract: **[`docs/BACKEND_API.md`](docs/BACKEND_API.md)**.

**REST** (custom API; Vite proxies `/api` to `VITE_APP_API_BASE_URL` when set):

```env
VITE_API_PROVIDER=rest
VITE_APP_ID=optional_app_id
VITE_APP_API_BASE_URL=https://your-api-host
# Dev-only if you have no bootstrap route yet:
# VITE_API_RELAX_BOOTSTRAP=true
```

**Supabase:**

```env
VITE_API_PROVIDER=supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
# Optional: VITE_SUPABASE_STORAGE_BUCKET=uploads
```

Legacy env names (`VITE_BASE44_*`) are still read by `lib/app-params.js` if the new ones are unset.

4. **NFT registry (optional):** set Postgres URLs as **server function environment variables** (not in the Vite bundle) — [`docs/DATABASE.md`](docs/DATABASE.md).  
5. Run: `npm run dev`

---

## Database and demo data

The UI uses **`lib/api/`** (`rest` or `supabase` via `VITE_API_PROVIDER`) for auth, entities, uploads, and function calls — see [`docs/BACKEND_API.md`](docs/BACKEND_API.md). SQL reference and NFT registry: [`docs/DATABASE.md`](docs/DATABASE.md). Demo **seed** logic still lives in [`server/functions/seedDemoData/`](server/functions/seedDemoData/) for you to port to Edge Functions or your API.

Schema and seeding details: [`docs/DATABASE.md`](docs/DATABASE.md). After deploy, run **`seedDemoData`** once as an **admin** user to load demo batches, tags, and incidents.

---

## Support

Project issues and changes are tracked in **this GitHub repository**. Operational support depends on where you host the app and API.
