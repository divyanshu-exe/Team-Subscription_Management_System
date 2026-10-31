# Integration and Demo Checklist (all 4)

## A. Requirement coverage (tick each against the PDF)
**Auth and roles**
- [ ] Email unique (try duplicate signup -> error)
- [ ] Password rejects 8 chars / missing upper / lower / special; accepts 9+ valid
- [ ] Forgot password email arrives, link works once, then fails; expired link fails
- [ ] Admin controls everything; staff limited; customer sees own data only
- [ ] Only admin can add staff, taxes, plans, discounts

**Products and plans**
- [ ] Product: name, type, sales price, cost price, notes
- [ ] Variant "Brand: Odoo" adds 560 to the price
- [ ] Plan: price, period (daily/weekly/monthly/yearly), min qty, available dates
- [ ] Per-plan flags: auto-close, closable early, pausable, renewable

**Quotation to subscription**
- [ ] Template has plan + product lines + validity days
- [ ] Subscription has auto number, customer, plan, start, expiry, payment terms, lines (product, qty, unit price, tax, amount)
- [ ] Status flow Draft > Quotation > Confirmed > Active > Closed, visible to all staff

**Billing**
- [ ] Invoices only generated from subscriptions (customer, lines, taxes, totals auto-filled)
- [ ] Taxes from admin rules
- [ ] Confirm / cancel / send / print work; Draft > Confirmed > Paid
- [ ] Run billing twice: no duplicates. Skip scenario: stop scheduler 3 periods, run, all 3 created

**Discounts**
- [ ] Fixed and percent, min purchase/quantity, dates, usage limit
- [ ] Applies to products or whole subscription
- [ ] Appears on next invoice automatically; stops after expiry and after limit reached

**Payments and reporting**
- [ ] Payment recorded with method, amount, date, note against invoice
- [ ] Paid vs outstanding visible; overdue list visible
- [ ] Dashboard: active subscriptions, revenue, outstanding, overdue, with filters and summary
- [ ] With 5,000 seeded subscriptions every page < 2 s (write the measured numbers down)

## B. Demo script (7 minutes)
1. (0:30) Problem: spreadsheets, manual invoices. Show architecture slide.
2. (0:45) Admin logs in, creates product with Brand variant (+560), tax, monthly plan with flags, 10% discount.
3. (1:00) Staff creates quotation from template, moves Draft > Quotation > Confirmed > Active; show status timeline.
4. (1:15) Billing page: "Run billing now". Show created invoices, run again -> 0 created (idempotent). Mention DB unique constraint.
5. (0:45) Open invoice: discount and tax auto-applied; Confirm, Send, Print.
6. (0:45) Record a partial and a full payment; invoice becomes Paid.
7. (0:45) Dashboard with filters, overdue table; show timing on 5k records.
8. (0:30) Customer portal login: sees only own subscriptions and invoices; try another customer's URL -> not found.
9. (0:30) Wrap up: coverage checklist.

## C. Demo accounts (seeded)
- Admin: admin@brightloop.test / Admin@1234
- Staff: staff1@brightloop.test / Staff@1234
- Customer: customer1@brightloop.test / Customer@1234

## D. Final tasks
- [ ] Root README with setup in 5 commands
- [ ] `.env.example` complete in both folders
- [ ] Fresh clone test on another machine
- [ ] Postman collection in `docs/`
- [ ] 2-minute backup screen recording of the full flow
