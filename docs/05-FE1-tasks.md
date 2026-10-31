# FE-1: Frontend Developer 1
**Mission:** frontend foundation + admin catalog. You set up the Next.js project, the API client, auth, layouts, role guards and the reusable UI kit that FE-2 also uses. Ship Tasks 1 to 4 fast so FE-2 is never blocked.

Folder: `frontend/` (files marked `OWNER: FE-1`).

---
## Task 1: Project setup (first 1h, blocks FE-2)
- `npm install`, add Tailwind (`npx tailwindcss init -p`), configure `tailwind.config.js` content paths for `src/**/*.{ts,tsx}`, add base styles in `src/app/globals.css`.
- `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:5000/api`.
- `lib/api.ts`: Axios instance with `baseURL`, request interceptor adds `Authorization: Bearer <token>`, response interceptor: on 401 clear token and redirect to `/login`. Unwrap `response.data.data`. Normalize errors to `{message, errors}`.
- `lib/auth.ts`: `getToken/setToken/clearToken` (cookie + localStorage so `middleware.ts` can read the cookie).
- `types/index.ts`: TS types for every entity in `02-data-model.md` and every request/response in `01-api-contract.md` (User, Customer, Product, Variant, Tax, Plan, Discount, Template, Subscription, Invoice, Payment, `Paginated<T>`, enums as union types). Push early; FE-2 adds to it.
- `lib/format.ts`: `formatMoney(n)` (e.g. INR/USD via `Intl.NumberFormat`), `formatDate(iso)`, `statusColor(status)`.

## Task 2: Shared UI kit (FE-2 depends on these)
Files: `components/ui/*`, `components/tables/*`, `hooks/usePaginatedQuery.ts`
- `Button` (variants primary/secondary/danger, loading state), `Input` (label, error text, works with react-hook-form), `Select`, `Modal`, `Badge` (colored by status), `Toast` (success/error provider), `Spinner`.
- `DataTable<T>`: props `columns`, `fetcher(params)`, `filters`, `pageSize`. Server-side pagination (page, limit, total), loading skeleton, empty state, row click callback. **FE-2 uses this on most screens, so keep the API simple and document it at the top of the file.**
- `FiltersBar`: search box (debounced 400 ms), status select, date range, "clear" button; emits a params object.
- `usePaginatedQuery(fetcher, params)`: returns `{items,total,page,setPage,loading,error,refetch}`.

## Task 3: Auth pages and state
Files: `app/(auth)/*`, `context/AuthContext.tsx`, `hooks/useAuth.ts`, `lib/validators.ts`, `services/auth.service.ts`
- Zod schema for password: min 9 chars, uppercase, lowercase, special char. Show a live checklist under the field (4 rules turn green).
- Pages: Login, Signup (name, email, password, confirm), Forgot password (always shows "if the email exists, a link was sent"), Reset password (reads `?token=` from URL).
- `AuthContext`: holds `user`, `login()`, `logout()`, loads `/auth/me` on start.
- Post-login redirect: ADMIN/STAFF -> `/dashboard`, CUSTOMER -> `/my-subscriptions`. Root `app/page.tsx` redirects by role.

## Task 4: Layouts and route protection
Files: `components/layout/*`, `app/(admin)/layout.tsx`, `middleware.ts`
- `Sidebar` is role-aware:
  - ADMIN: Dashboard, Customers, Products, Plans, Taxes, Discounts, Quotation Templates, Subscriptions, Invoices, Payments, Billing, Staff
  - STAFF: same minus Taxes, Discounts, Staff (read-only catalogs allowed), minus Billing
  - Customer layout is built by FE-2 using your `Topbar`
- `RoleGuard({roles, children})`: shows 403 page when role is not allowed.
- `middleware.ts`: unauthenticated users hitting `(admin)` or `(portal)` routes go to `/login`; CUSTOMER hitting admin routes goes to `/my-subscriptions`.
- Hide buttons the role cannot use (UI only; the backend enforces it).

## Task 5: Catalog screens (admin/staff)
Files: `app/(admin)/{products,plans,taxes,discounts,staff,customers}/**`, `components/forms/*`, `services/*.service.ts`
Each module: list page (DataTable + search), "New" page, "[id]" edit page, delete with confirm modal.
- **Products**: form with name, type, sales price, cost price, notes, and a dynamic **Variants** editor (rows of attribute, value, extra price; add/remove rows). Example row: Brand / Odoo / 560. Show computed price "Sales price + extra" preview.
- **Plans**: name, price, period (Daily/Weekly/Monthly/Yearly select), min quantity, available from/to date pickers, and four toggles: "Auto-close at end", "Closable early", "Pausable", "Renewable". Validate `to >= from`.
- **Taxes**: name, type (percent/fixed), value.
- **Discounts** (admin only): name, type (fixed/percent), value, min purchase, min quantity, start/end date, usage limit, applies to (products/whole subscription); product multi-select appears only when "products" chosen. Show `usedCount / usageLimit` in the list.
- **Staff** (admin only): list + create form (name, email, password with the same rules) + activate/deactivate toggle.
- **Customers**: list + create/edit form (name, email, phone, company, address).
- All forms: react-hook-form + Zod, inline field errors, loading state on submit, success toast, show server 409/400 messages.

## Task 6: Polish and integration
- Global error boundary page, 404 page, loading states, consistent spacing and responsive layout (works at 1024px+ and tablet).
- Help FE-2 integrate against real endpoints once BE-2 deploys.
- Test full flow: signup -> login -> create product/plan -> logout -> reset password.

## Definition of done
- [ ] Wrong role never sees forbidden pages or menu items
- [ ] Password rules identical on frontend and backend
- [ ] Every list is server-paginated through `DataTable`
- [ ] No hard-coded API URLs (all via `lib/api.ts`)
