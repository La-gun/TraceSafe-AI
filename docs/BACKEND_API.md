# TraceGuard backend API — REST contract & Supabase mapping

The web app no longer ships `@base44/sdk`. It talks to your infrastructure through:

| `VITE_API_PROVIDER` | Client implementation | You implement |
|---------------------|----------------------|---------------|
| `rest` (default) | `fetch()` to your API | Routes below + JWT auth |
| `supabase` | `@supabase/supabase-js` | Postgres tables, RLS, Storage bucket, Edge Functions |

---

## Environment variables

### REST (`VITE_API_PROVIDER=rest` or unset)

| Variable | Purpose |
|----------|---------|
| `VITE_API_BASE_URL` or `VITE_APP_API_BASE_URL` | API origin (empty = same origin; use Vite proxy in dev) |
| `VITE_APP_BOOTSTRAP_URL` | Optional full URL for bootstrap (default: `{base}/api/app/bootstrap`) |
| `VITE_LEGACY_PUBLIC_SETTINGS_URL` | Optional legacy bootstrap URL (e.g. previous BaaS) |
| `VITE_AUTH_LOGIN_URL` | Where `redirectToLogin` sends users (path or absolute URL) |
| `VITE_API_RELAX_BOOTSTRAP` | Dev only: if `true`, failed bootstrap returns empty public settings |

Access tokens are read from `localStorage` keys: `tracesafe_access_token` (preferred), `base44_access_token`, or `token`. The `access_token` query param still hydrates `tracesafe_*` via `lib/app-params.js`.

### Supabase (`VITE_API_PROVIDER=supabase`)

| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | Anon (public) key |
| `VITE_SUPABASE_STORAGE_BUCKET` | Bucket for `UploadFile` (default `uploads`) |
| `VITE_SUPABASE_SIGNED_UPLOAD_TTL_SEC` | Signed URL lifetime for uploads (default 604800) |
| `VITE_AUTH_LOGIN_URL` | App login route if not using Supabase hosted UI |

---

## REST endpoints (contract)

All JSON unless noted. Authenticated routes use `Authorization: Bearer <jwt>` unless stated otherwise.

### Bootstrap (AuthProvider)

`GET /api/app/bootstrap`  

Optional headers: `X-App-Id`

**200** body example:

```json
{ "id": "my-app", "public_settings": {} }
```

**403** for gated apps (optional):

```json
{ "message": "Forbidden", "extra_data": { "reason": "auth_required" } }
```

`reason` may be `auth_required` or `user_not_registered` (handled in `AuthContext`).

---

### Auth

`GET /api/auth/me`  

**200:** user object (shape flexible; UI expects at least `email`, optional `role`):

```json
{ "id": "uuid", "email": "user@example.com", "role": "admin" }
```

Or wrap: `{ "user": { ... } }` (both supported).

**401:** not authenticated.

---

### Entities (CRUD)

Table names are **snake_case** and match `lib/api/entityTableMap.js`:

| Entity | Table |
|--------|--------|
| InspectionReport | `inspection_reports` |
| BatchStatus | `batch_status` |
| ConsumerReport | `consumer_reports` |
| ContactLead | `contact_leads` |

- `POST /api/entities/{table}` — body = row JSON; **201/200** returns created row (object).
- `PATCH /api/entities/{table}/{id}` — partial update; returns updated row.
- `GET /api/entities/{table}?sort=-updated_date&limit=50` — `sort` is optional column with optional `-` prefix for descending; returns **JSON array** or `{ "items": [...] }` / `{ "data": [...] }` / `{ "rows": [...] }`.

Column names should align with existing UI (e.g. `batch_number`, `updated_date` or `updated_at` — keep consistent with your schema).

---

### Functions (formerly “cloud functions”)

`POST /api/functions/{name}`  

Body: arbitrary JSON. **200:** JSON body is exposed to the UI as `invoke`’s `data` (same as `{ data: json }`).

Names used by the app today:

| Name | Used by |
|------|---------|
| `getDashboardStats` | Dashboard |
| `getRiskMapData` | Risk dashboard |
| `listConsumerReports` | Incident manager |
| `scanTag` | Inspector portal |
| `commissionTag` | Commission NFC panel |
| `inspectorAI` | Inspector AI chat |
| `consumerAssist` | Consumer assist |
| `deleteAccount` | Account deletion |

Implement these as route handlers, workers, or proxies to Supabase Edge Functions.

---

### File upload

`POST /api/storage/upload`  

`multipart/form-data`, field name `file`.

**200:**

```json
{ "file_url": "https://..." }
```

Also accepts `url` or `publicUrl` as alternate keys in the response (normalised client-side).

---

## Supabase mapping

1. **Tables** — Create tables matching `entityTableMap.js` (columns snake_case, enable RLS).
2. **Auth** — Use Supabase Auth; optional `app_metadata.role` for admin gating.
3. **Edge Functions** — Deploy one function per name above (or a single router). `supabase.functions.invoke(name, { body })` passes JSON body through.
4. **Storage** — Create bucket (e.g. `uploads`); policies for `authenticated` upload/read as needed. Client uses signed URLs by default.
5. **Bootstrap** — Provider `supabase` skips HTTP bootstrap (`AuthContext` gets an empty `public_settings` object).

---

## Migrating `server/functions/*` (Deno)

Some files under `server/functions/` may still use Deno `npm:@base44/sdk@…` imports for **legacy deployment** of that runtime. They are **not** used by the Vite app and are **not** in this repo’s `package.json`. Replace them when you port handlers to Edge Functions or your REST service.

For Supabase or custom REST you should:

- **Option A:** Re-implement each handler as a **Supabase Edge Function** using the service role key only on the server and `fetch`/`supabase-js` against Postgres.
- **Option B:** Run a **Node/Bun/Fastify** service that implements the REST table above and embeds the same business logic (scan rules, AI tool calls, NFT sync).

Keep sensitive keys out of the Vite bundle; only anon keys and public URLs belong in `VITE_*`.

---

## Operational checklist

- [ ] Choose `rest` vs `supabase` and set `VITE_API_PROVIDER`
- [ ] Implement bootstrap + auth + entities + functions + upload (or wire Supabase)
- [ ] Align table columns with forms and dashboards
- [ ] Configure CORS if API is on another origin
- [ ] Point Vite dev proxy at your API if using same-origin `/api` paths
