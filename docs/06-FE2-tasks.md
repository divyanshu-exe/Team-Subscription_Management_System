# FE-2: Frontend Developer 2
**Mission:** the subscription workflow screens. Templates, subscriptions, invoices, payments, billing run, finance dashboard and the customer portal.

Folder: `frontend/` (files marked `OWNER: FE-2`). You use FE-1's `DataTable`, `FiltersBar`, `Modal`, `Button`, `Input`, `Badge`, `api.ts`. Until FE-1 pushes them (first 2h), build static versions of your pages with mock data typed from `types/index.ts`, then swap in services.

---
## Task 1: Services and types
Files: `services/{quotation-templates,subscriptions,invoices,payments,billing,dashboard,portal}.service.ts`
- One function per endpoint in `01-api-contract.md`, e.g. `listSubscriptions(params)`, `transitionSubscription(id,to)`, `runBilling()`, `getDashboardSummary(filters)`. Typed return values. Add your types to `types/index.ts` (coordinate with FE-1).

## Task 2: Quotation templates
Files: `app/(admin)/quotation-templates/**`, `components/forms/QuotationTemplateForm.tsx`
- List (name, plan, validity days). Form: name, plan select, validity days, and a lines editor (product select, variant select filtered by product, quantity). Show line price preview.

## Task 3: Subscriptions
Files: `app/(admin)/subscriptions/**`, `components/subscriptions/*`
- **List**: columns number, customer, plan, start, expiry, status badge, next invoice date. Filters: status, customer, search. Server pagination.
- **Create / edit form**: customer select, plan select, optional "Start from template" select (loads template lines into the editor), start date, expiry date, payment terms. 
- `LineItemsEditor`: rows with product, variant, quantity, unit price (read-only, from product + variant), tax select, amount (auto = qty x unit price, plus tax shown). Footer shows subtotal, tax, total. Block save when quantity < plan minimum.
- **Detail page**: header with number + `StatusStepper` (Draft > Quotation > Confirmed > Active > Closed, current step highlighted). Action buttons shown only for valid next states (Send quotation, Confirm, Activate, Close). Extra buttons: Pause/Resume (only if plan.pausable), Renew (only if plan.renewable), Close early (only if plan.closableEarly). Below: lines table, linked invoices list, and status history timeline.
- Confirm modal for state changes; refetch after each action; show server error toasts.

## Task 4: Invoices
Files: `app/(admin)/invoices/**`, `components/invoices/*`
- **List**: columns number, customer, period, issue date, due date, total, paid, balance, status badge. Tabs: All / Draft / Confirmed (outstanding) / Paid / Overdue. Filters: customer, date range. Overdue rows highlighted red with "X days overdue".
- **Detail**: `InvoiceView` shows customer details, subscription number, period, lines (product, qty, unit price, discount, tax, amount), totals. `InvoiceActions` buttons by status: DRAFT -> Confirm, Cancel; CONFIRMED -> Send, Print, Record payment, Cancel (hidden if payments exist); PAID -> Print. Payments table below.
- Print opens `GET /invoices/:id/print` PDF in a new tab (fetch as blob with auth header, then `URL.createObjectURL`). Send shows toast "Invoice emailed".
- No "create invoice" button anywhere (invoices only come from billing).

## Task 5: Payments
Files: `app/(admin)/payments/page.tsx`, `components/invoices/PaymentModal.tsx`
- `PaymentModal`: method select (Cash, Card, Bank transfer, UPI, Cheque), amount (default = balance, max = balance), date (default today), note. Validate with Zod.
- Payments list page: filters by method/date, columns date, invoice number, customer, method, amount, note.

## Task 6: Billing run page (admin only)
Files: `app/(admin)/billing/page.tsx`
- Single page with a "Run billing now" button, optional "as of date" picker, confirm modal, loading state. After run shows result cards: Total due, Created, Skipped (already billed), Errors (expandable list). A link "View draft invoices" goes to invoices filtered by Draft. Also show a short note "Scheduled automatically every day".

## Task 7: Finance dashboard
Files: `app/(admin)/dashboard/page.tsx`, `components/dashboard/*`
- `DashboardFilters`: date range (presets: this month, last month, this year), customer, plan. Changing filters refetches.
- `StatCard` row: Active subscriptions, Revenue received, Amount outstanding, Overdue invoices (count + amount).
- `RevenueSummary`: Recharts bar/pie of paid vs outstanding vs overdue, and payments by method.
- Subscriptions by status mini chart.
- `OverdueTable`: server-paginated, columns invoice, customer, due date, days overdue, balance; row click opens the invoice.
- Show skeletons while loading. Target page interactive < 2s.

## Task 8: Customer portal
Files: `app/(portal)/**`
- Layout with Topbar (customer name, logout) and two nav links.
- `my-subscriptions`: cards or table of own subscriptions (number, plan, status, next billing date, expiry) with detail drawer showing lines and status.
- `my-invoices`: list with status, due date, total, balance; detail view and Print/Download PDF button.
- Customers must never see admin menus; handle 404 from API gracefully.

## Task 9: Polish and demo support
- Empty states, error states, consistent badges (status colors defined once in `lib/format.ts`).
- Help record the demo: pre-prepare the click path in `07-integration-demo-checklist.md`.

## Definition of done
- [ ] State buttons appear only for legal transitions
- [ ] Pause/Renew/Close-early buttons respect plan flags
- [ ] No way to create an invoice manually in the UI
- [ ] Dashboard filters change all numbers consistently
- [ ] Portal shows only the logged-in customer's data
