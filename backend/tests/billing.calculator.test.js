// OWNER: BE-2
// PURPOSE: Unit tests for pure billing calculator, date utilities, and subscription state machine

const { addPeriod, periodEnd, isOverdue } = require('../src/utils/dates');
const {
  calcLine,
  applyDiscount,
  calcInvoiceTotals,
} = require('../src/modules/billing/billing.calculator');
const {
  canTransition,
  assertTransition,
} = require('../src/modules/subscriptions/subscription.statemachine');

describe('Date Utilities (UTC Date Math & Clamping)', () => {
  test('clamps Jan 31 to Feb 28 in non-leap year', () => {
    const start = new Date(Date.UTC(2023, 0, 31)); // 2023-01-31
    const next = addPeriod(start, 'MONTHLY');
    expect(next.toISOString().split('T')[0]).toBe('2023-02-28');
  });

  test('clamps Jan 31 to Feb 29 in leap year', () => {
    const start = new Date(Date.UTC(2024, 0, 31)); // 2024-01-31 (leap year)
    const next = addPeriod(start, 'MONTHLY');
    expect(next.toISOString().split('T')[0]).toBe('2024-02-29');
  });

  test('handles leap year + 1 year correctly (Feb 29 -> Feb 28)', () => {
    const start = new Date(Date.UTC(2024, 1, 29)); // 2024-02-29
    const next = addPeriod(start, 'YEARLY');
    expect(next.toISOString().split('T')[0]).toBe('2025-02-28');
  });

  test('periodEnd computes start + period - 1 day', () => {
    const start = new Date(Date.UTC(2024, 0, 1)); // 2024-01-01
    const end = periodEnd(start, 'MONTHLY');
    expect(end.toISOString().split('T')[0]).toBe('2024-01-31');
  });

  test('isOverdue correctly detects overdue confirmed invoices with balance', () => {
    const overdueInvoice = {
      status: 'CONFIRMED',
      dueDate: '2024-01-10T00:00:00.000Z',
      total: 100,
      amountPaid: 0,
    };
    const today = new Date(Date.UTC(2024, 0, 15));
    expect(isOverdue(overdueInvoice, today)).toBe(true);

    // Paid invoice should not be overdue
    expect(isOverdue({ ...overdueInvoice, status: 'PAID' }, today)).toBe(false);

    // Fully settled balance should not be overdue
    expect(isOverdue({ ...overdueInvoice, amountPaid: 100 }, today)).toBe(false);

    // Draft invoice should not be overdue
    expect(isOverdue({ ...overdueInvoice, status: 'DRAFT' }, today)).toBe(false);
  });
});

describe('Billing Calculator', () => {
  test('calcLine calculates base and tax correctly', () => {
    const percentTax = { type: 'PERCENT', value: 18 };
    const fixedTax = { type: 'FIXED', value: 15 };

    const line1 = calcLine({ quantity: 2, unitPrice: 100, tax: percentTax });
    expect(line1.base).toBe(200);
    expect(line1.taxAmount).toBe(36);

    const line2 = calcLine({ quantity: 1, unitPrice: 50, tax: fixedTax });
    expect(line2.base).toBe(50);
    expect(line2.taxAmount).toBe(15);
  });

  test('applyDiscount with percent discount across subscription lines', () => {
    const lines = [
      { productId: 1, quantity: 1, unitPrice: 100 },
      { productId: 2, quantity: 2, unitPrice: 50 },
    ];
    const discount = { type: 'PERCENT', value: 10, appliesTo: 'SUBSCRIPTION' };
    const discounts = applyDiscount({ lines, discount });

    expect(discounts[0]).toBe(10); // 10% of 100
    expect(discounts[1]).toBe(10); // 10% of 100
  });

  test('applyDiscount with fixed discount split proportionally', () => {
    const lines = [
      { productId: 1, quantity: 1, unitPrice: 100 }, // base 100 (50%)
      { productId: 2, quantity: 1, unitPrice: 100 }, // base 100 (50%)
    ];
    const discount = { type: 'FIXED', value: 50, appliesTo: 'SUBSCRIPTION' };
    const discounts = applyDiscount({ lines, discount });

    expect(discounts[0] + discounts[1]).toBe(50);
    expect(discounts[0]).toBe(25);
    expect(discounts[1]).toBe(25);
  });

  test('applyDiscount does not exceed base when discount is larger than base', () => {
    const lines = [{ productId: 1, quantity: 1, unitPrice: 40 }];
    const discount = { type: 'FIXED', value: 100, appliesTo: 'SUBSCRIPTION' };
    const discounts = applyDiscount({ lines, discount });

    expect(discounts[0]).toBe(40); // capped at 40
  });

  test('applyDiscount filters only eligible products when appliesTo is PRODUCTS', () => {
    const lines = [
      { productId: 10, quantity: 1, unitPrice: 100 },
      { productId: 20, quantity: 1, unitPrice: 100 },
    ];
    const discount = {
      type: 'PERCENT',
      value: 20,
      appliesTo: 'PRODUCTS',
      productIds: [10],
    };
    const discounts = applyDiscount({ lines, discount });

    expect(discounts[0]).toBe(20);
    expect(discounts[1]).toBe(0);
  });

  test('calcInvoiceTotals calculates tax AFTER discount and sums correctly', () => {
    const lines = [
      {
        quantity: 1,
        unitPrice: 100,
        discountAmount: 20, // taxable base: 80
        tax: { type: 'PERCENT', value: 10 }, // 10% of 80 = 8
      },
    ];
    const totals = calcInvoiceTotals(lines);

    expect(totals.subtotal).toBe(100);
    expect(totals.discountTotal).toBe(20);
    expect(totals.taxTotal).toBe(8);
    expect(totals.total).toBe(88); // 100 - 20 + 8
  });
});

describe('Subscription State Machine', () => {
  test('verifies all legal transitions', () => {
    // DRAFT transitions
    expect(canTransition('DRAFT', 'QUOTATION')).toBe(true);
    expect(canTransition('DRAFT', 'CLOSED')).toBe(true);

    // QUOTATION transitions
    expect(canTransition('QUOTATION', 'CONFIRMED')).toBe(true);
    expect(canTransition('QUOTATION', 'DRAFT')).toBe(true);
    expect(canTransition('QUOTATION', 'CLOSED')).toBe(true);

    // CONFIRMED transitions
    expect(canTransition('CONFIRMED', 'ACTIVE')).toBe(true);
    expect(canTransition('CONFIRMED', 'CLOSED')).toBe(true);

    // ACTIVE transitions
    expect(canTransition('ACTIVE', 'CLOSED')).toBe(true);
  });

  test('rejects illegal transitions', () => {
    expect(canTransition('DRAFT', 'ACTIVE')).toBe(false);
    expect(canTransition('DRAFT', 'CONFIRMED')).toBe(false);
    expect(canTransition('ACTIVE', 'DRAFT')).toBe(false);
    expect(canTransition('ACTIVE', 'QUOTATION')).toBe(false);
    expect(canTransition('ACTIVE', 'CONFIRMED')).toBe(false);
    expect(canTransition('CLOSED', 'ACTIVE')).toBe(false);
    expect(canTransition('CLOSED', 'DRAFT')).toBe(false);
  });

  test('assertTransition throws status 400 error on illegal move', () => {
    expect(() => assertTransition('DRAFT', 'ACTIVE')).toThrow();
    try {
      assertTransition('DRAFT', 'ACTIVE');
    } catch (err) {
      expect(err.status).toBe(400);
    }
  });
});
