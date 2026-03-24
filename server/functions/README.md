# Server-side function logic (reference)

This folder holds **TypeScript handlers** that previously targeted a hosted BaaS runtime (Deno + vendor SDK). The **web app** no longer ships that vendor’s browser SDK; it calls your stack via **`lib/api/`** (REST or Supabase).

**Next step for you:** port each folder (e.g. `scanTag`, `inspectorAI`) to:

- **Supabase Edge Functions** (recommended if you use Supabase for DB/auth), or  
- **Your REST service** implementing the routes in [`docs/BACKEND_API.md`](../../docs/BACKEND_API.md).

Until ported, keep these files as **authoritative business logic** to copy from.
