# AI features — compliance and trust (procurement brief)

This document packages how **TraceSafe uses AI** in this codebase so security, legal, and procurement teams can align **vendor questionnaires** and **data protection** narratives with implementation reality. It complements [`ENTERPRISE_AND_PORTABILITY.md`](./ENTERPRISE_AND_PORTABILITY.md).

---

## Where AI is used

| Surface | Function / area | Role of the model |
|--------|-------------------|-------------------|
| Inspector console | `base44/functions/inspectorAI/entry.ts` | Plans **server-side tool calls**, answers from **retrieved rows only**, optional **consistency review** (“judge”) pass/revise. |
| Consumer assist (demo / assist flow) | `base44/functions/consumerAssist/entry.ts` | **Vision**: reads a product label image to suggest a serial format (invokes model with image URL). |
| Field scan advisory | `base44/functions/scanTag/entry.ts` | **Risk scoring text** is explicitly **advisory** and does not replace rule-based scan status (see in-code disclaimer). |

LLM calls are made via **Base44** `integrations.Core.InvokeLLM`. **Subprocessors and retention** for model inference follow **your Base44 agreement** and **Base44’s AI provider terms** — confirm current policies in vendor docs for questionnaires.

---

## Inspector AI — controls that matter for regulated buyers

1. **No invented database rows** — Tools return real entities (`ConsumerReport`, `DiversionAlert`, `Batch`, `ScanEvent`, bundled regulatory excerpts). The answer prompt instructs the model to use **only** that payload; **citations are validated** against retrieved data (invalid citation IDs are dropped).
2. **Prompt-injection hardening** — User and history text is **length-limited** and **delimiter-sanitized** (`base44/functions/inspectorAI/promptGuards.ts`) so chat content cannot easily spoof system boundaries.
3. **Planner schema** — Only **allow-listed tool names** are executed; arbitrary tools from the model are rejected.
4. **Second-pass review** — A **judge** step can **revise** answers that are not faithful to data, with a short **review note** surfaced to the inspector when applicable.
5. **Authenticated use** — The handler requires a **signed-in user** (`auth.me()`); anonymous access to Inspector AI is not the intended model.

**Human-in-the-loop:** Inspector AI **summarises and retrieves**; **holds, recalls, case resolution, and formal enforcement** remain **human and workflow-driven** in the app — the model does not auto-execute enforcement APIs.

---

## Data sent to the model (PII and minimisation)

- **Inspector questions and recent chat history** are sent to the model (bounded size). **Do not paste secrets** into chat; treat like email to a subprocesser.
- **Operational payload** to the model is **slim JSON** derived from entity lists (truncated total size in code). It may include **business fields** present on those records (e.g. locations, product names, operator identifiers as stored). Map this to your **DPA** and **retention** schedule.
- **Consumer label photos** — Image URLs are passed to the vision path; same subprocesser story as above.

Organisations should document: **who may use AI features**, **whether prompts/logs are allowed to contain personal data**, and **Base44 + model provider** as subprocessors where applicable.

---

## Consumer assist and retention

Consumer-facing flows should be described in customer-facing privacy notices. Demo data in `consumerAssist` may use **mock** products; production deployments should align **real lookups** and **image handling** with policy.

---

## Advisory scan risk (non-AI and AI-adjacent)

`scanTag` exposes **advisory** risk language alongside **server-driven** status (registry, batch policy, anomalies). Procurement text should state clearly: **advisory outputs support triage**; **authoritative disposition** follows **your rules and human process**.

---

## Summary for RFP / security review snippets

- AI is used for **assistant Q&A** (inspector), **optional label OCR** (consumer assist), and **advisory copy** on scans — not for silent automated enforcement.
- Answers are **grounded in server-retrieved records** with **citation checks** and **optional consistency review**.
- **Base44** hosts execution and **InvokeLLM**; confirm **regions, subprocessors, and log retention** with Base44 for your deployment.
- **Optional PostgreSQL NFT registry** does not change the AI data path unless you extend it; see [`DATABASE.md`](./DATABASE.md).

For architecture and BaaS portability, see [`ENTERPRISE_AND_PORTABILITY.md`](./ENTERPRISE_AND_PORTABILITY.md).
