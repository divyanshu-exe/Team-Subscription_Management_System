// OWNER: BE-2
// PURPOSE: [Billing run endpoint and engine] Business logic and Prisma queries

const prisma = require('../../config/db');
const { toUtcMidnight, addPeriod, periodEnd } = require('../../utils/dates');
const { nextNumber } = require('../../utils/numbering');
const { applyDiscount, calcInvoiceTotals } = require('./billing.calculator');
const { findApplicableDiscounts } = require('../discounts/discounts.service');

/**
 * Runs recurring billing as of a specific date.
 * Idempotent: duplicate periods caught via @@unique([subscriptionId, periodStart, periodEnd]).
 * Handles catch-up periods for subscriptions that missed runs.
 * @param {Date|string} [asOfDate=new Date()]
 * @param {number|null} [userId=null]
 * @returns {Promise<{ total: number, created: number, skippedExisting: number, errors: Array<{ subscriptionId: number, error: string }> }>}
 */
async function runBilling(asOfDate = new Date(), userId = null) {
  const asOf = toUtcMidnight(asOfDate || new Date());

  // 1. Query candidate active, unpaused subscriptions with nextInvoiceDate <= asOfDate
  const candidates = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      isPaused: false,
      nextInvoiceDate: {
        not: null,
        lte: asOf,
      },
    },
    select: {
      id: true,
      nextInvoiceDate: true,
      expiryDate: true,
    },
    orderBy: { id: 'asc' },
  });

  // Filter those where nextInvoiceDate <= expiryDate
  const dueSubIds = candidates
    .filter((s) => s.nextInvoiceDate && toUtcMidnight(s.nextInvoiceDate) <= toUtcMidnight(s.expiryDate))
    .map((s) => s.id);

  let createdCount = 0;
  let skippedExistingCount = 0;
  const errors = [];

  // Process in batches of 100
  const BATCH_SIZE = 100;
  for (let i = 0; i < dueSubIds.length; i += BATCH_SIZE) {
    const batch = dueSubIds.slice(i, i + BATCH_SIZE);

    for (const subId of batch) {
      try {
        await prisma.$transaction(async (tx) => {
          // 2a. Re-read subscription with row locking if supported
          try {
            await tx.$queryRaw`SELECT id FROM "Subscription" WHERE id = ${subId} FOR UPDATE`;
          } catch (_) {
            // Safe fallback if dialect doesn't support FOR UPDATE
          }

          const sub = await tx.subscription.findUnique({
            where: { id: subId },
            include: {
              plan: true,
              customer: true,
              lines: {
                include: {
                  product: true,
                  variant: true,
                  tax: true,
                },
              },
            },
          });

          if (!sub || sub.status !== 'ACTIVE' || sub.isPaused || !sub.nextInvoiceDate) {
            return;
          }

          let curPeriodStart = toUtcMidnight(sub.nextInvoiceDate);
          const expiryDateUtc = toUtcMidnight(sub.expiryDate);

          // 2b. Catch-up loop: generate invoices while nextInvoiceDate <= asOfDate and <= expiryDate
          while (
            curPeriodStart.getTime() <= asOf.getTime() &&
            curPeriodStart.getTime() <= expiryDateUtc.getTime()
          ) {
            const curPeriodEnd = periodEnd(curPeriodStart, sub.plan.period);

            // Build lines for calculator
            const linesForCalc = sub.lines.map((line) => {
              const variantPart = line.variant ? ` (${line.variant.attribute}: ${line.variant.value})` : '';
              const desc = `${line.product.name}${variantPart}`;
              const qty = Number(line.quantity || 1);
              const uPrice = Number(line.unitPrice || 0);
              const base = Number((qty * uPrice).toFixed(2));
              return {
                productId: line.productId,
                description: desc,
                quantity: qty,
                unitPrice: uPrice,
                tax: line.tax ? { type: line.tax.type, value: Number(line.tax.value) } : null,
                base,
              };
            });

            // Find applicable discounts
            const applicableDiscounts = await findApplicableDiscounts(sub, curPeriodStart, tx);
            let selectedDiscount = null;
            let perLineDiscounts = linesForCalc.map(() => 0);

            if (applicableDiscounts.length > 0) {
              const candidate = applicableDiscounts[0];
              // Guard with updateMany where usedCount < usageLimit
              const updateResult = await tx.discount.updateMany({
                where: {
                  id: candidate.id,
                  usedCount: { lt: candidate.usageLimit },
                },
                data: {
                  usedCount: { increment: 1 },
                },
              });

              if (updateResult.count > 0) {
                selectedDiscount = candidate;
                perLineDiscounts = applyDiscount({
                  lines: linesForCalc,
                  discount: candidate,
                });
              }
            }

            const linesWithDiscount = linesForCalc.map((l, idx) => ({
              ...l,
              discountAmount: perLineDiscounts[idx] || 0,
            }));

            const totals = calcInvoiceTotals(linesWithDiscount);

            // Due date = issueDate + paymentTermsDays
            const issueDate = curPeriodStart;
            const dueDate = new Date(issueDate);
            dueDate.setUTCDate(dueDate.getUTCDate() + (sub.paymentTermsDays || 0));

            // Generate next invoice number
            const invoiceNumber = await nextNumber(tx, 'INV', 'INV');

            try {
              await tx.invoice.create({
                data: {
                  number: invoiceNumber,
                  subscriptionId: sub.id,
                  customerId: sub.customerId,
                  periodStart: curPeriodStart,
                  periodEnd: curPeriodEnd,
                  issueDate,
                  dueDate,
                  status: 'DRAFT',
                  subtotal: totals.subtotal,
                  discountTotal: totals.discountTotal,
                  taxTotal: totals.taxTotal,
                  total: totals.total,
                  amountPaid: 0,
                  discountId: selectedDiscount ? selectedDiscount.id : null,
                  lines: {
                    create: linesWithDiscount.map((l) => {
                      const base = l.base;
                      const disc = l.discountAmount || 0;
                      const taxable = Math.max(0, base - disc);
                      let taxAmt = 0;
                      if (l.tax && l.tax.value !== undefined) {
                        if (l.tax.type === 'PERCENT') {
                          taxAmt = Number(((taxable * Number(l.tax.value)) / 100).toFixed(2));
                        } else if (l.tax.type === 'FIXED') {
                          taxAmt = Number(Number(l.tax.value).toFixed(2));
                        }
                      }
                      const lineTotal = Number((taxable + taxAmt).toFixed(2));
                      return {
                        productId: l.productId,
                        description: l.description,
                        quantity: l.quantity,
                        unitPrice: l.unitPrice,
                        taxAmount: taxAmt,
                        discountAmount: disc,
                        amount: lineTotal,
                      };
                    }),
                  },
                },
              });
              createdCount++;
            } catch (err) {
              if (err.code === 'P2002') {
                // Unique constraint (subscriptionId, periodStart, periodEnd) caught
                skippedExistingCount++;
              } else {
                throw err;
              }
            }

            // Advance current period start
            curPeriodStart = addPeriod(curPeriodStart, sub.plan.period);
          }

          // Advance subscription nextInvoiceDate
          const nextDate = curPeriodStart.getTime() > expiryDateUtc.getTime() ? null : curPeriodStart;
          await tx.subscription.update({
            where: { id: sub.id },
            data: { nextInvoiceDate: nextDate },
          });
        });
      } catch (err) {
        errors.push({
          subscriptionId: subId,
          error: err.message,
        });
      }
    }
  }

  // Audit log of billing run
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ? Number(userId) : null,
        action: 'BILLING_RUN',
        entity: 'BILLING',
        meta: {
          asOfDate: asOf.toISOString(),
          created: createdCount,
          skippedExisting: skippedExistingCount,
          errorsCount: errors.length,
          total: dueSubIds.length,
        },
      },
    });
  } catch (_) {
    // Non-fatal if audit log fails
  }

  return {
    total: dueSubIds.length,
    created: createdCount,
    skippedExisting: skippedExistingCount,
    errors,
  };
}

module.exports = {
  runBilling,
};
