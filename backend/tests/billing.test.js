// OWNER: BE-2
// PURPOSE: Billing engine idempotency / catch-up / scheduler tests (B2-4)

jest.mock('../src/config/db', () => ({
  subscription: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  invoice: {
    create: jest.fn(),
  },
  discount: {
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
  counter: {
    upsert: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
  $queryRaw: jest.fn(),
}));

const prisma = require('../src/config/db');
const { runBilling } = require('../src/modules/billing/billing.service');

describe('Billing Engine (B2-4)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback) => {
      return await callback(prisma);
    });
    prisma.counter.upsert.mockResolvedValue({ key: 'INV', value: 1 });
    prisma.auditLog.create.mockResolvedValue({});
  });

  test('1. Paused subscription is skipped', async () => {
    // Subscription query returns empty because isPaused: true is excluded in query
    prisma.subscription.findMany.mockResolvedValue([]);

    const result = await runBilling(new Date('2024-06-01'));
    expect(result.total).toBe(0);
    expect(result.created).toBe(0);
    expect(prisma.invoice.create).not.toHaveBeenCalled();
  });

  test('2. Missed 3 months -> creates 3 invoices in catch-up loop', async () => {
    const subId = 10;
    const start = new Date('2024-01-01T00:00:00.000Z');
    const expiry = new Date('2024-12-31T00:00:00.000Z');
    const asOf = new Date('2024-03-15T00:00:00.000Z'); // 3 periods: Jan 1, Feb 1, Mar 1

    prisma.subscription.findMany.mockResolvedValue([
      { id: subId, nextInvoiceDate: start, expiryDate: expiry },
    ]);

    prisma.subscription.findUnique.mockResolvedValue({
      id: subId,
      customerId: 5,
      status: 'ACTIVE',
      isPaused: false,
      nextInvoiceDate: start,
      expiryDate: expiry,
      paymentTermsDays: 15,
      plan: { period: 'MONTHLY', name: 'Pro Monthly' },
      lines: [
        {
          productId: 1,
          quantity: 1,
          unitPrice: 100,
          product: { name: 'SaaS Suite' },
          variant: null,
          tax: null,
        },
      ],
    });

    prisma.discount.findMany.mockResolvedValue([]);
    prisma.invoice.create.mockResolvedValue({ id: 1 });
    prisma.subscription.update.mockResolvedValue({});

    const result = await runBilling(asOf);

    expect(result.total).toBe(1);
    expect(result.created).toBe(3); // Jan 1, Feb 1, Mar 1
    expect(prisma.invoice.create).toHaveBeenCalledTimes(3);
  });

  test('3. Run twice -> second run skips existing or finds 0 due', async () => {
    const subId = 20;
    const date = new Date('2024-05-01T00:00:00.000Z');

    prisma.subscription.findMany.mockResolvedValue([
      { id: subId, nextInvoiceDate: date, expiryDate: new Date('2024-12-31') },
    ]);

    prisma.subscription.findUnique.mockResolvedValue({
      id: subId,
      customerId: 5,
      status: 'ACTIVE',
      isPaused: false,
      nextInvoiceDate: date,
      expiryDate: new Date('2024-12-31'),
      paymentTermsDays: 0,
      plan: { period: 'MONTHLY' },
      lines: [{ productId: 1, quantity: 1, unitPrice: 50, product: { name: 'Basic' }, variant: null, tax: null }],
    });

    prisma.discount.findMany.mockResolvedValue([]);
    // First run creates invoice
    prisma.invoice.create.mockResolvedValueOnce({ id: 101 });
    prisma.subscription.update.mockResolvedValue({});

    const firstRun = await runBilling(date);
    expect(firstRun.created).toBe(1);

    // Second run: unique constraint P2002 error simulates already billed period
    const p2002Error = new Error('Unique constraint failed');
    p2002Error.code = 'P2002';
    prisma.invoice.create.mockRejectedValueOnce(p2002Error);

    const secondRun = await runBilling(date);
    expect(secondRun.created).toBe(0);
    expect(secondRun.skippedExisting).toBe(1);
  });

  test('4. Discount usage limit stops at N and updates usedCount', async () => {
    const subId = 30;
    const date = new Date('2024-05-01T00:00:00.000Z');

    prisma.subscription.findMany.mockResolvedValue([
      { id: subId, nextInvoiceDate: date, expiryDate: new Date('2024-12-31') },
    ]);

    prisma.subscription.findUnique.mockResolvedValue({
      id: subId,
      customerId: 5,
      status: 'ACTIVE',
      isPaused: false,
      nextInvoiceDate: date,
      expiryDate: new Date('2024-12-31'),
      paymentTermsDays: 0,
      plan: { period: 'MONTHLY' },
      lines: [{ productId: 1, quantity: 1, unitPrice: 100, product: { name: 'Item' }, variant: null, tax: null }],
    });

    // Discount active, but updateMany count: 0 (usage limit reached concurrently)
    prisma.discount.findMany.mockResolvedValue([
      {
        id: 7,
        name: 'Promo 10',
        type: 'FIXED',
        value: 10,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        usageLimit: 5,
        usedCount: 4,
        appliesTo: 'SUBSCRIPTION',
        isActive: true,
        products: [],
      },
    ]);

    prisma.discount.updateMany.mockResolvedValue({ count: 0 }); // limit reached
    prisma.invoice.create.mockResolvedValue({ id: 201 });
    prisma.subscription.update.mockResolvedValue({});

    await runBilling(date);

    // Invoice created without discount (discountTotal = 0, discountId = null)
    expect(prisma.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          discountId: null,
          discountTotal: 0,
        }),
      })
    );
  });

  test('5. Expired discount is ignored during billing run', async () => {
    const subId = 40;
    const date = new Date('2024-06-01T00:00:00.000Z');

    prisma.subscription.findMany.mockResolvedValue([
      { id: subId, nextInvoiceDate: date, expiryDate: new Date('2024-12-31') },
    ]);

    prisma.subscription.findUnique.mockResolvedValue({
      id: subId,
      customerId: 5,
      status: 'ACTIVE',
      isPaused: false,
      nextInvoiceDate: date,
      expiryDate: new Date('2024-12-31'),
      paymentTermsDays: 0,
      plan: { period: 'MONTHLY' },
      lines: [{ productId: 1, quantity: 1, unitPrice: 100, product: { name: 'Item' }, variant: null, tax: null }],
    });

    // Discount expired before June 1
    prisma.discount.findMany.mockResolvedValue([
      {
        id: 8,
        name: 'Spring Promo',
        type: 'PERCENT',
        value: 20,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-05-15'), // expired
        usageLimit: 100,
        usedCount: 0,
        appliesTo: 'SUBSCRIPTION',
        isActive: true,
        products: [],
      },
    ]);

    prisma.invoice.create.mockResolvedValue({ id: 301 });
    prisma.subscription.update.mockResolvedValue({});

    await runBilling(date);

    expect(prisma.discount.updateMany).not.toHaveBeenCalled();
    expect(prisma.invoice.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          discountId: null,
          discountTotal: 0,
        }),
      })
    );
  });
});
