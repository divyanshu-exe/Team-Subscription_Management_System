# Data Model (owner: BE-1). Prisma models and key fields

Money: `Decimal(12,2)`. IDs: `Int @id @default(autoincrement())`. All models have `createdAt`, `updatedAt`.

| Model | Fields (besides id/timestamps) |
|---|---|
| User | name, email (unique), passwordHash, role (ADMIN/STAFF/CUSTOMER), isActive, customerId? (unique, for role CUSTOMER) |
| Customer | name, email, phone?, company?, address? |
| PasswordReset | userId, tokenHash, expiresAt, usedAt? |
| Product | name, type, salesPrice, costPrice, notes?, isActive |
| Variant | productId, attribute, value, extraPrice |
| Tax | name, type (PERCENT/FIXED), value, isActive |
| Plan | name, price, period (DAILY/WEEKLY/MONTHLY/YEARLY), minQuantity, availableFrom, availableTo, autoCloseAtEnd, closableEarly, pausable, renewable, isActive |
| QuotationTemplate | name, planId, validityDays |
| QuotationTemplateLine | templateId, productId, variantId?, quantity |
| Subscription | number (unique), customerId, planId, templateId?, startDate, expiryDate, paymentTerms (e.g. "Net 15" -> store `paymentTermsDays Int` + label), status (DRAFT/QUOTATION/CONFIRMED/ACTIVE/CLOSED), isPaused, nextInvoiceDate?, createdById |
| SubscriptionLine | subscriptionId, productId, variantId?, quantity, unitPrice, taxId?, amount |
| Discount | name, type (FIXED/PERCENT), value, minPurchase?, minQuantity?, startDate, endDate, usageLimit, usedCount (default 0), appliesTo (PRODUCTS/SUBSCRIPTION), isActive |
| DiscountProduct | discountId, productId |
| Invoice | number (unique), subscriptionId, customerId, periodStart, periodEnd, issueDate, dueDate, status (DRAFT/CONFIRMED/PAID/CANCELLED), subtotal, discountTotal, taxTotal, total, amountPaid, discountId? |
| InvoiceLine | invoiceId, productId?, description, quantity, unitPrice, taxAmount, discountAmount, amount |
| Payment | invoiceId, method, amount, paymentDate, note?, recordedById |
| StatusHistory | entityType (SUBSCRIPTION/INVOICE), entityId, fromStatus, toStatus, changedById, changedAt |
| AuditLog | userId, action, entity, entityId, meta Json? |

## Constraints and indexes (non-negotiable)
```prisma
model Invoice {
  // ...
  @@unique([subscriptionId, periodStart, periodEnd])   // NO DOUBLE BILLING
  @@index([status])
  @@index([customerId])
  @@index([dueDate])
}
model Subscription {
  @@index([status])
  @@index([nextInvoiceDate])
  @@index([customerId])
}
model Payment { @@index([invoiceId]) }
```
Numbering: use a `Counter` table (key, value) incremented inside a transaction for SUB-00001 / INV-00001.
