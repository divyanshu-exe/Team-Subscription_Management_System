// OWNER: BE-1
// PURPOSE: Unit tests for discount eligibility finder (findApplicableDiscounts)

const { findApplicableDiscounts } = require('../src/modules/discounts/discounts.service');

describe('Discount Eligibility Engine (B1-7)', () => {
  const asOfDate = new Date('2024-05-15T00:00:00.000Z');

  const baseSubscription = {
    lines: [
      { productId: 101, quantity: 2, unitPrice: 50, amount: 100 },
      { productId: 102, quantity: 1, unitPrice: 50, amount: 50 },
    ],
  };

  test('1. Expired discount is ignored', async () => {
    const mockTx = {
      discount: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 1,
            name: 'Expired 10%',
            type: 'PERCENT',
            value: 10,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-04-30'), // Expired relative to 2024-05-15
            usageLimit: 100,
            usedCount: 0,
            appliesTo: 'SUBSCRIPTION',
            isActive: true,
            products: [],
          },
        ]),
      },
    };

    const results = await findApplicableDiscounts(baseSubscription, asOfDate, mockTx);
    expect(results.length).toBe(0);
  });

  test('2. Exhausted discount (usedCount >= usageLimit) is ignored', async () => {
    const mockTx = {
      discount: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 2,
            name: 'Exhausted Flat 20',
            type: 'FIXED',
            value: 20,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            usageLimit: 5,
            usedCount: 5, // Exhausted
            appliesTo: 'SUBSCRIPTION',
            isActive: true,
            products: [],
          },
        ]),
      },
    };

    const results = await findApplicableDiscounts(baseSubscription, asOfDate, mockTx);
    expect(results.length).toBe(0);
  });

  test('3. Below minimum purchase or quantity is ignored', async () => {
    const mockTx = {
      discount: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 3,
            name: 'High Min Purchase',
            type: 'PERCENT',
            value: 15,
            minPurchase: 500, // Subscription total is 150 < 500
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            usageLimit: 100,
            usedCount: 0,
            appliesTo: 'SUBSCRIPTION',
            isActive: true,
            products: [],
          },
          {
            id: 4,
            name: 'High Min Qty',
            type: 'PERCENT',
            value: 15,
            minQuantity: 10, // Subscription qty is 3 < 10
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            usageLimit: 100,
            usedCount: 0,
            appliesTo: 'SUBSCRIPTION',
            isActive: true,
            products: [],
          },
        ]),
      },
    };

    const results = await findApplicableDiscounts(baseSubscription, asOfDate, mockTx);
    expect(results.length).toBe(0);
  });

  test('4. Wrong product is ignored when appliesTo is PRODUCTS', async () => {
    const mockTx = {
      discount: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 5,
            name: 'Product 999 Special',
            type: 'PERCENT',
            value: 20,
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            usageLimit: 100,
            usedCount: 0,
            appliesTo: 'PRODUCTS',
            isActive: true,
            products: [{ productId: 999 }], // Not present in subscription (which has 101, 102)
          },
        ]),
      },
    };

    const results = await findApplicableDiscounts(baseSubscription, asOfDate, mockTx);
    expect(results.length).toBe(0);
  });

  test('5. Valid discount matching all conditions is returned', async () => {
    const mockTx = {
      discount: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 6,
            name: 'Valid 10% Off',
            type: 'PERCENT',
            value: 10,
            minPurchase: 100, // Subscription is 150 >= 100
            minQuantity: 2, // Subscription qty is 3 >= 2
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            usageLimit: 50,
            usedCount: 10,
            appliesTo: 'PRODUCTS',
            isActive: true,
            products: [{ productId: 101 }], // Matches product 101 in subscription
          },
        ]),
      },
    };

    const results = await findApplicableDiscounts(baseSubscription, asOfDate, mockTx);
    expect(results.length).toBe(1);
    expect(results[0].id).toBe(6);
    expect(results[0].productIds).toContain(101);
  });
});
