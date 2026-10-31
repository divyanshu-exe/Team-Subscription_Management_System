# BE-1: Backend Developer 1
**Mission:** foundation. Database, authentication, roles, and the catalog (everything the admin sets up). BE-2 and both frontend devs depend on you early, so ship Tasks 1 to 3 fast.

Folder: `backend/` (files marked `OWNER: BE-1`).

---
## Task 1: Setup and schema (first 1.5h, blocks everyone)
Files: `prisma/schema.prisma`, `.env`, `src/config/*`
1. Install PostgreSQL (or Docker `postgres:16`), create DB `sms`, set `DATABASE_URL`.
2. Write ALL models in `02-data-model.md` in `schema.prisma`, with enums and the unique constraint + indexes.
3. Run `npx prisma migrate dev --name init`. Push to `main` immediately and tell the team.
4. `config/env.js`: load dotenv, export typed constants, throw if `JWT_SECRET` / `DATABASE_URL` missing.
5. `config/db.js`: singleton `PrismaClient`.
6. `config/mailer.js`: nodemailer transport from SMTP env (fallback: log to console when no SMTP configured so dev works offline). Export `sendMail({to,subject,html,attachments})`.

## Task 2: App skeleton and shared utils
Files: `src/app.js`, `src/server.js`, `src/middlewares/*`, `src/utils/{apiResponse,pagination,password,token}.js`
- `app.js`: express, `cors({origin: FRONTEND_URL})`, helmet, morgan, `express.json()`, mount routers at `/api/auth`, `/api/users`, `/api/customers`, `/api/products`, `/api/taxes`, `/api/plans`, `/api/discounts`, plus BE-2 routers (`quotation-templates`, `subscriptions`, `invoices`, `billing`, `payments`, `dashboard`, `portal`). Add `GET /api/health`. Error middleware last.
- `server.js`: listen on PORT; `require('./jobs/billing.cron').start()` (BE-2 provides it; wrap in try so server boots before it exists).
- `auth.middleware.js`: read Bearer token, verify, load user (id, role, customerId), 401 if invalid or inactive.
- `role.middleware.js`: `requireRole(...roles)` returns 403 otherwise.
- `validate.middleware.js`: `validate(schema, 'body'|'query'|'params')`, returns 400 with zod issues.
- `error.middleware.js`: map Prisma `P2002` to 409, `P2025` to 404, zod to 400, default 500 (hide stack in production).
- `apiResponse.js`: `ok(res,data,message,status=200)`, `fail(res,message,status,errors)`.
- `pagination.js`: `parsePagination(query)` -> `{page,limit,skip,take}` (limit max 100), `paginated(items,total,page,limit)`.
- `password.js`: `PASSWORD_RULE` regex: min 9 chars, `[A-Z]`, `[a-z]`, special char. `hashPassword` (bcrypt, 10 rounds), `comparePassword`.
- `token.js`: `signJwt(payload)`, `verifyJwt`, `generateResetToken()` returns `{raw, hash}` (raw = 32 random bytes hex, hash = sha256 of raw).

## Task 3: Auth module (blocks FE-1; target within first 3h)
Files: `modules/auth/*`, `emails/resetPassword.js`
- **signup**: validate zod (email format, password rule). In one transaction create `Customer` + `User(role CUSTOMER, customerId)`. Duplicate email -> 409 "Email already registered". Case-insensitive email (lowercase before saving).
- **login**: find by email, compare hash, check `isActive`, return `{token,user}`. Same generic message for wrong email or password.
- **forgot-password**: always respond 200 with same message. If user exists: delete old unused resets, create `PasswordReset` with `tokenHash` and `expiresAt = now + RESET_TOKEN_EXPIRES_MIN`, email link with the RAW token.
- **reset-password**: hash incoming token, find unused + unexpired record, validate new password rule, update `passwordHash`, set `usedAt`. Invalid -> 400.
- **me**: return current user.
Acceptance: password "Abcdef1!" (8 chars) rejected, "Abcdefg1!" accepted. Raw reset token never stored. Token reusable only once.

## Task 4: Staff and customers
Files: `modules/users/*`, `modules/customers/*`
- Staff CRUD, admin only. Create staff with temp password (validated by the same rule). Staff cannot hit these routes (403).
- Customers: list with search (name/email/company, case-insensitive) + pagination, create, get, update. Admin and staff.

## Task 5: Catalog: products, variants, taxes
Files: `modules/products/*`, `modules/taxes/*`
- Product create/update in a transaction with nested variants (`extraPrice`, e.g. Brand=Odoo +560). Update replaces the variant set.
- Product list: search by name, filter by type, pagination. Soft delete via `isActive=false`.
- Taxes CRUD (PERCENT or FIXED). Only admin can create/update/delete; staff can read.
- Export helper `calcLinePrice(product, variant)` = `salesPrice + (variant?.extraPrice ?? 0)` in `products.service.js` for BE-2 to import.

## Task 6: Plans
Files: `modules/plans/*`
- Fields: price, period, minQuantity, availableFrom/To, the four flags. Validate `availableTo >= availableFrom`, `minQuantity >= 1`, `price >= 0`.
- Admin-only writes; staff can read. `GET /plans?active=true` returns plans whose date window includes today.
- Export `isPlanAvailable(plan, date)` for BE-2.

## Task 7: Discounts (admin only)
Files: `modules/discounts/*`
- Create/update/delete/list. Validate: PERCENT value 0 to 100, FIXED > 0, `endDate >= startDate`, `usageLimit >= 1`, `productIds` required when `appliesTo = PRODUCTS`.
- Store `DiscountProduct` rows.
- Export `findApplicableDiscounts(subscription, asOfDate, tx)` (BE-2 calls it from billing): returns active discounts where `startDate <= date <= endDate`, `usedCount < usageLimit`, and min purchase/quantity satisfied. Write it with a Prisma `tx` parameter so it works inside BE-2's transaction.
- Unit-test it with: expired, exhausted, below minimum, wrong product, valid.

## Task 8: Seed and indexes
Files: `prisma/seed.js`
- Seed: 1 admin (`admin@brightloop.test` / `Admin@1234`), 2 staff, 5 customers, 3 taxes (GST 18%, GST 5%, flat 50), 5 products with variants (include Brand/Odoo +560), 4 plans (monthly, yearly, weekly, daily), 3 discounts, 2 quotation templates (ask BE-2 for model shape).
- Review `schema.prisma` indexes after BE-2 reports slow queries (`EXPLAIN ANALYZE`).

## Task 9: Support BE-2
- Review BE-2's PRs. Pair on the billing transaction and discount logic.
- Write `tests/auth.test.js` (signup rules, duplicate email, role guards, reset flow).

## Definition of done
- [ ] All routes in `01-api-contract.md` for your modules respond with the right role restrictions
- [ ] Postman collection exported to `docs/postman.json`
- [ ] Only admin can: add staff, create/edit taxes, plans, discounts, products
- [ ] No endpoint returns `passwordHash`
