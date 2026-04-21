# TraceGuard

**Authenticate → trace → enforce** for regulated physical goods: serialisation, scan and diversion intelligence, inspector workflows, and optional **PostgreSQL NFT registry** under your credentials.

This repository is the **source of truth** for the web app and **server functions** under [`server/functions/`](server/functions/). Use **GitHub** (or any Git host) for version control and collaboration. Configure your deployment and API endpoints via environment variables—see the matrix below.

For portability, dual-store behaviour, and procurement positioning, see **[`docs/ENTERPRISE_AND_PORTABILITY.md`](docs/ENTERPRISE_AND_PORTABILITY.md)**. For **AI** (Inspector assistant, optional vision assist, advisory signals), see **[`docs/AI_COMPLIANCE_AND_TRUST.md`](docs/AI_COMPLIANCE_AND_TRUST.md)**.

**Marketing metrics (placeholders):** Illustrative design targets for the home hero and the **`/Proof`** one-pager ([`pages/Proof.jsx`](pages/Proof.jsx)) come from **[`data/outcomeMetrics.js`](data/outcomeMetrics.js)** — edit that file (and `HERO_METRIC_IDS` if you change which tiles appear) when you publish real customer-approved numbers. Additional public pages: **`/Trust`** (trust center), **`/Enterprise`** (portability / procurement summary), **`/Sectors`**, **`/GettingStarted`** (first-scan checklist).

---

## Security: client vs server

React route guards (`RequireRole` in [`lib/routing/RouteGuards.jsx`](lib/routing/RouteGuards.jsx)) are **UX only**. They do not authenticate users and must not be treated as authorization. **Production** must validate the session or bearer token, app registration, and roles on **`/api/auth/me`**, the **bootstrap** route, and **every** sensitive **server function** under `server/functions/`.

---

## Environment variables (Vite)

| Variable | When / purpose |
|----------|----------------|
| `VITE_REQUIRE_AUTH` | Set to `true` to require a saved access token before the app runs against the live API (see Sign-in). **Required at build time for production** (`vite build`): without it, the app shows a configuration screen instead of public-demo mode. |
| `VITE_API_BASE_URL` | Optional REST API origin (same role as `VITE_APP_API_BASE_URL`); used by the dev `/api` proxy when set. |
| `VITE_ALLOW_CLEAR_ACCESS_TOKEN` | Set to `true` to allow `?clear_access_token=true` to clear stored tokens in production (default: dev-only). |
| `VITE_API_PROVIDER` | `rest` (default) or `supabase`. |
| `VITE_APP_ID` | Optional app identifier passed to bootstrap. |
| `VITE_APP_API_BASE_URL` | REST API origin; dev server can proxy `/api` here when set. |
| `VITE_API_RELAX_BOOTSTRAP` | Dev-only relaxes bootstrap if the route is not wired yet. |
| `VITE_SUPABASE_URL` | Supabase project URL (when `VITE_API_PROVIDER=supabase`). |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key. |
| `VITE_SUPABASE_STORAGE_BUCKET` | Optional uploads bucket name. |
| `VITE_AUTH_LOGIN_URL` | External or in-app URL for “Continue to sign-in provider” on the sign-in page. |
| `VITE_DEMO_CONSUMER_EMAIL` / `VITE_DEMO_CONSUMER_PASSWORD` | Override default demo consumer credentials used by the demo sign-in form. |
| `VITE_DEMO_REGULATOR_EMAIL` / `VITE_DEMO_REGULATOR_PASSWORD` | Override default demo regulator credentials. |
| `VITE_SHOW_DEMO_CREDENTIALS_IN_UI` | Set to `true` to print demo email/password on the sign-in screen in **production** builds (default: hidden; dev server always shows inline hints). |

Legacy names (`VITE_BASE44_*`) are still read by `lib/app-params.js` if the new ones are unset.

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

4. **NFT registry (optional):** set Postgres URLs as **server function environment variables** (not in the Vite bundle) — [`docs/DATABASE.md`](docs/DATABASE.md).  
5. Run: `npm run dev`

---

## Database and demo data

The UI uses **`lib/api/`** (`rest` or `supabase` via `VITE_API_PROVIDER`) for auth, entities, uploads, and function calls — see [`docs/BACKEND_API.md`](docs/BACKEND_API.md). SQL reference and NFT registry: [`docs/DATABASE.md`](docs/DATABASE.md). Demo **seed** logic still lives in [`server/functions/seedDemoData/`](server/functions/seedDemoData/) for you to port to Edge Functions or your API.

Schema and seeding details: [`docs/DATABASE.md`](docs/DATABASE.md). After deploy, run **`seedDemoData`** once as an **admin** user to load demo batches, tags, and incidents.

---

## Support

Project issues and changes are tracked in **this GitHub repository**. Operational support depends on where you host the app and API.
