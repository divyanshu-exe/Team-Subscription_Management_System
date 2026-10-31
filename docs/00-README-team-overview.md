# Team Overview: Subscription Management System

Scope rule: build EXACTLY what the problem statement lists. No extra features.

## Team split
| Dev | Owns | Doc |
|---|---|---|
| BE-1 | DB schema, auth, RBAC, staff, customers, products/variants, taxes, plans, discounts, shared backend utils | 03-BE1-tasks.md |
| BE-2 | Quotation templates, subscriptions + state machine, billing engine, invoices, payments, dashboard, customer portal API, scheduler, bulk seed | 04-BE2-tasks.md |
| FE-1 | Project setup, API client, auth pages, layouts + guards, shared UI kit (DataTable etc.), catalog screens | 05-FE1-tasks.md |
| FE-2 | Templates, subscriptions, invoices, payments, billing page, finance dashboard, customer portal | 06-FE2-tasks.md |

Shared docs: 01-api-contract.md, 02-data-model.md, 07-integration-demo-checklist.md.

## Stack
Backend: Node.js, Express, Prisma, PostgreSQL, Zod, JWT, bcrypt, Nodemailer, node-cron, pdfkit.
Frontend: Next.js 14 (App Router), TypeScript, Tailwind, Axios, react-hook-form + Zod, Recharts.

## Ground rules
1. Every source file starts with an `OWNER:` comment. Edit only your own files. Need a change elsewhere? Ask the owner.
2. Only BE-1 edits `schema.prisma`. Request changes in chat; BE-1 turns them around within 30 minutes.
3. `types/index.ts` (frontend) is shared: FE-1 creates it, both append. Keep names identical to the API contract.
4. Branches: `be1/<feature>`, `be2/<feature>`, `fe1/<feature>`, `fe2/<feature>`. PR into `main`. At least one review from the paired dev (BE-1 reviews BE-2 and vice versa; same for FE).
5. Response format everywhere: `{ "success": true, "data": ..., "message": "" }`. Errors: `{ "success": false, "message": "...", "errors": [...] }`.
6. Lists: `GET ...?page=1&limit=20&search=&status=` returns `data: { items, page, limit, total }`.
7. Dates are ISO strings (UTC). Money is a number with 2 decimals (store as `Decimal(12,2)`).

## Timeline (adjust to your hours)
| Phase | BE-1 | BE-2 | FE-1 | FE-2 |
|---|---|---|---|---|
| P0 (together, 1h) | repo, contract review, env setup | same | same | same |
| P1 | schema + migrate + seed admin, auth endpoints | state machine, numbering, date utils (pure functions, no DB wait) | Next setup, api client, auth pages, layouts | types, DataTable usage, mock data for templates/subscriptions screens |
| P2 | taxes, products/variants, plans | templates + subscriptions API | catalog screens (products, plans, taxes) | templates + subscriptions screens |
| P3 | discounts, staff, customers | billing engine + invoices | discounts, staff, customers screens | invoices screens + billing page |
| P4 | review BE-2 PRs, performance indexes | payments, dashboard, portal API, cron | polish, guards, toasts, error states | payments, dashboard, portal |
| P5 (together) | seed 5k, perf test, README, demo rehearsal | | | |

## Sync points
- After P1: BE-1 announces auth is live (FE-1 switches from mock to real).
- After P3: billing run demoed end-to-end on a laptop.
- Before final: everyone runs `07-integration-demo-checklist.md`.
