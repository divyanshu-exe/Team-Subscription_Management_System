# BE-2: Backend Developer 2
**Mission:** the subscription business logic. Templates, subscriptions, the billing engine, invoices, payments, dashboard and the customer portal API. This is the heart of the project and where judges will look hardest.

Folder: `backend/` (files marked `OWNER: BE-2`).
While BE-1 builds the schema (first 1.5h), write the PURE functions below (no DB needed) and unit-test them.

---
## Task 1: Pure utilities (start immediately)
Files: `utils/dates.js`, `utils/numbering.js`, `modules/billing/billing.calculator.js`, `modules/subscriptions/subscription.statemachine.js`
- `dates.js`
  - `addPeriod(date, period)`: DAILY +1 day, WEEKLY +7, MONTHLY +1 month (clamp end-of-month: Jan 31 -> Feb 28), YEARLY +1 year.
  - `periodEnd(start, period)`: `addPeriod(start) - 1 day`.
  - `isOverdue(invoice, today)`: status CONFIRMED and `dueDate < today` and balance > 0.
  - Use UTC date-only values to avoid timezone double-billing bugs.
- `numbering.js`: `nextNumber(tx, key, prefix)` increments a `Counter` row inside the transaction, returns `SUB-00001`/`INV-00001` (pad 5).
- `billing.calculator.js` (pure, easy to test):
  - `calcLine({quantity, unitPrice, tax})` -> `{base, taxAmount}` (PERCENT: base*value/100, FIXED: value per line).
  - `applyDiscount({lines, discount})` -> per-line discount amounts. PERCENT: % of eligible base. FIXED: amount split proportionally across eligible lines, never more than the base. Eligible = all lines if `appliesTo=SUBSCRIPTION`, only matching `productId`s if `PRODUCTS`.
  - `calcInvoiceTotals(lines)` -> `{subtotal, discountTotal, taxTotal, total}`. Tax is calculated AFTER discount. Round to 2 decimals at line level.
- `subscription.statemachine.js`: map `{DRAFT:['QUOTATION','CLOSED'], QUOTATION:['CONFIRMED','DRAFT','CLOSED'], CONFIRMED:['ACTIVE','CLOSED'], ACTIVE:['CLOSED'], CLOSED:[]}`. Export `canTransition(from,to)` and `assertTransition`.

## Task 2: Quotation templates
Files: `modules/quotation-templates/*`
- CRUD with nested lines in a transaction. Validate plan exists, products exist, quantity >= plan.minQuantity.
- Template response includes plan summary and `validityDays`.

## Task 3: Subscriptions
Files: `modules/subscriptions/*`
- **create**: customer, plan, dates, payment terms, lines. If `templateId` and no lines, copy template lines. For each line snapshot `unitPrice = calcLinePrice(product, variant)` (from BE-1) and `amount = qty * unitPrice`. Validate `plan.minQuantity`, plan availability window (`isPlanAvailable`), `expiryDate > startDate`. Number via `nextNumber`. Status DRAFT. Write `StatusHistory`.
- **list**: filters (status, customerId, search by number/customer name), server pagination, select only needed columns. Must stay < 2s on 5k rows.
- **transition**: use `assertTransition`; write `StatusHistory(from,to,changedById)`. On `-> ACTIVE` set `nextInvoiceDate = startDate`. On `-> CLOSED` clear `nextInvoiceDate`.
- **update** only in DRAFT/QUOTATION; recompute line amounts.
- **pause / resume**: only if `plan.pausable`; paused subscriptions are skipped by billing. **renew**: only if `plan.renewable`; extends `expiryDate` by one plan term. **close** early only if `plan.closableEarly`.
- **auto-close**: `closeExpiredSubscriptions()` closes ACTIVE subscriptions with `expiryDate < today` where `plan.autoCloseAtEnd = true`. Called by the cron job after billing.
- Subscription detail includes `history` (status timeline), so "anyone can see where it stands".

## Task 4: Billing engine (most important)
Files: `modules/billing/billing.service.js`, `billing.controller.js`, `billing.routes.js`, `jobs/billing.cron.js`

`runBilling(asOfDate = today, userId)`:
1. Query due subscriptions: `status = ACTIVE`, `isPaused = false`, `nextInvoiceDate <= asOfDate`, and `nextInvoiceDate <= expiryDate`. Select ids only, process in batches of 100.
2. For EACH subscription, inside its own `prisma.$transaction`:
   a. Re-read the subscription with `FOR UPDATE` lock (`SELECT ... FOR UPDATE` via `$queryRaw`) so two runs cannot process it at once.
   b. Compute `periodStart = nextInvoiceDate`, `periodEnd = periodEnd(periodStart, plan.period)`.
   c. Build invoice lines from subscription lines (customer, product, qty, unit price, tax all auto-filled).
   d. Call `findApplicableDiscounts(sub, asOfDate, tx)` (from BE-1), apply with the calculator, set `invoice.discountId`, and `usedCount += 1` (guard with `updateMany where usedCount < usageLimit`; if 0 rows updated, bill without the discount).
   e. Insert `Invoice` (status DRAFT, `dueDate = issueDate + paymentTermsDays`) and lines.
   f. Set `nextInvoiceDate = addPeriod(periodStart)`; if that is past `expiryDate`, set `null`.
3. **Idempotency**: the DB unique `(subscriptionId, periodStart, periodEnd)` is the final guard. On `P2002` catch, count as `skippedExisting`, never as failure.
4. **Catch-up**: if the scheduler missed days, loop `while nextInvoiceDate <= asOfDate` so no period is skipped.
5. One failing subscription must not stop the run: collect `{subscriptionId, error}`.
6. Return `{total, created, skippedExisting, errors}`; write an `AuditLog` row.
- `POST /billing/run` (admin only) calls it. `jobs/billing.cron.js` uses `node-cron` with `BILLING_CRON` env, calls `runBilling` then `closeExpiredSubscriptions`.
- Tests (`tests/billing.test.js`): run twice -> second run creates 0; missed 3 months -> creates 3 invoices; discount usage limit stops at N; paused skipped; expired discount ignored.

## Task 5: Invoices
Files: `modules/invoices/*`, `emails/invoice.js`
- list with filters (status, customer, date range, `overdue=true`), pagination, computed `balance = total - amountPaid`.
- `confirm`: DRAFT -> CONFIRMED (+ StatusHistory). `cancel`: only if no payments. `send`: requires CONFIRMED, builds PDF and emails it via `sendMail`. `print`: stream PDF from `invoice.pdf.js` (pdfkit: company header, customer, lines, tax, discount, total).
- Invoices can never be edited by hand beyond status actions. Creation route does NOT exist (billing creates them).

## Task 6: Payments
Files: `modules/payments/*`
- `POST /payments`: in a transaction: validate invoice is CONFIRMED, `amount > 0`, `amount <= balance`. Insert payment (method, amount, date, note, recordedById). Update `amountPaid`; if `amountPaid >= total` set invoice `PAID` + StatusHistory.
- List payments with filters.

## Task 7: Dashboard (use SQL aggregates, not JS loops)
Files: `modules/dashboard/*`
- `/dashboard/summary`: one `$queryRaw` (or Prisma `aggregate`/`groupBy`) each for: active subscription count; revenue received = `SUM(payments.amount)` in range; outstanding = `SUM(total - amountPaid)` for CONFIRMED; overdue count/amount; invoice counts by status; payments by method. Support filters `from,to,customerId,planId`.
- `/dashboard/overdue`: paginated, `daysOverdue = today - dueDate`, sorted by oldest first.
- Run `EXPLAIN ANALYZE` against 5k seed; add indexes via BE-1 if needed.

## Task 8: Customer portal API
Files: `modules/portal/*`
- All routes use `requireRole('CUSTOMER')` and ALWAYS add `where: { customerId: req.user.customerId }`. Another customer's id returns 404 (not 403) so existence isn't leaked.
- Subscriptions list/detail, invoices list/detail/print.

## Task 9: Bulk seed and performance
Files: `prisma/seed.bulk.js`
- Insert ~5,000 subscriptions (varied plans/statuses), ~15,000 invoices, ~8,000 payments using `createMany` in batches. Include overdue ones.
- Measure each list/dashboard endpoint; target < 500 ms server time. Report numbers for the demo slide.

## Definition of done
- [ ] Running billing twice never creates duplicates (verified by test + DB constraint)
- [ ] Subscription cannot skip states; history recorded
- [ ] Discounts apply automatically, stop at end date or usage limit
- [ ] Customer A cannot read customer B's data
- [ ] All list endpoints paginated server-side
