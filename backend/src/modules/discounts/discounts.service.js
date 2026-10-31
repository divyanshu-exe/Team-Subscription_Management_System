// OWNER: BE-1
// PURPOSE: Business logic for discounts and eligibility finder (used by billing engine)

const prisma = require('../../config/db');

/**
 * Finds applicable active discounts for a subscription at a specific date
 * Accepts Prisma transaction client (tx) for atomic billing usage.
 * @param {Object} subscription - { lines: Array<{ productId, quantity, unitPrice, amount? }> }
 * @param {Date|string} asOfDate
 * @param {Object} [tx=prisma]
 * @returns {Promise<Array<Object>>}
 */
async function findApplicableDiscounts(subscription, asOfDate = new Date(), tx = prisma) {
  const asOf = new Date(asOfDate).getTime();
  const lines = subscription.lines || [];

  const subTotalQty = lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
  const subTotalBase = lines.reduce((sum, line) => {
    if (line.amount !== undefined) return sum + Number(line.amount);
    return sum + Number(line.quantity || 0) * Number(line.unitPrice || 0);
  }, 0);

  const subProductIds = lines.map((l) => Number(l.productId));

  const allDiscounts = await tx.discount.findMany({
    where: {
      isActive: true,
    },
    include: {
      products: true,
    },
  });

  const eligibleDiscounts = allDiscounts.filter((d) => {
    const start = new Date(d.startDate).getTime();
    const end = new Date(d.endDate).getTime();

    // 1. Date window check (startDate <= asOfDate <= endDate)
    if (asOf < start || asOf > end) return false;

    // 2. Usage limit check (usedCount < usageLimit)
    if (d.usedCount >= d.usageLimit) return false;

    // 3. Minimum purchase requirement
    if (d.minPurchase !== null && d.minPurchase !== undefined) {
      if (subTotalBase < Number(d.minPurchase)) return false;
    }

    // 4. Minimum quantity requirement
    if (d.minQuantity !== null && d.minQuantity !== undefined) {
      if (subTotalQty < Number(d.minQuantity)) return false;
    }

    // 5. Product applicability check
    if (d.appliesTo === 'PRODUCTS') {
      const discountProductIds = (d.products || []).map((p) => Number(p.productId));
      const hasMatchingProduct = subProductIds.some((pId) => discountProductIds.includes(pId));
      if (!hasMatchingProduct) return false;
    }

    return true;
  });

  return eligibleDiscounts.map((d) => ({
    ...d,
    productIds: (d.products || []).map((p) => Number(p.productId)),
  }));
}

async function listDiscounts() {
  return await prisma.discount.findMany({
    where: { isActive: true },
    include: {
      products: {
        include: {
          product: {
            select: { id: true, name: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getDiscountById(id) {
  const discountId = parseInt(id, 10);
  const discount = await prisma.discount.findUnique({
    where: { id: discountId },
    include: {
      products: {
        include: {
          product: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!discount || !discount.isActive) {
    const error = new Error('Discount not found');
    error.status = 404;
    throw error;
  }

  return discount;
}

async function createDiscount(data) {
  return await prisma.$transaction(async (tx) => {
    const discount = await tx.discount.create({
      data: {
        name: data.name,
        type: data.type,
        value: data.value,
        minPurchase: data.minPurchase !== undefined ? data.minPurchase : null,
        minQuantity: data.minQuantity !== undefined ? data.minQuantity : null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        usageLimit: data.usageLimit,
        usedCount: 0,
        appliesTo: data.appliesTo,
        isActive: data.isActive !== undefined ? data.isActive : true,
        products: {
          create: (data.productIds || []).map((pId) => ({
            productId: Number(pId),
          })),
        },
      },
      include: {
        products: true,
      },
    });

    return discount;
  });
}

async function updateDiscount(id, data) {
  const discountId = parseInt(id, 10);

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.discount.findUnique({
      where: { id: discountId },
    });

    if (!existing || !existing.isActive) {
      const error = new Error('Discount not found');
      error.status = 404;
      throw error;
    }

    if (data.productIds !== undefined) {
      await tx.discountProduct.deleteMany({
        where: { discountId },
      });
    }

    const updated = await tx.discount.update({
      where: { id: discountId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.minPurchase !== undefined && { minPurchase: data.minPurchase }),
        ...(data.minQuantity !== undefined && { minQuantity: data.minQuantity }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
        ...(data.usageLimit !== undefined && { usageLimit: data.usageLimit }),
        ...(data.appliesTo !== undefined && { appliesTo: data.appliesTo }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.productIds !== undefined && {
          products: {
            create: data.productIds.map((pId) => ({
              productId: Number(pId),
            })),
          },
        }),
      },
      include: {
        products: true,
      },
    });

    return updated;
  });
}

async function deleteDiscount(id) {
  const discountId = parseInt(id, 10);
  await prisma.discount.update({
    where: { id: discountId },
    data: { isActive: false },
  });

  return { success: true, message: 'Discount deleted successfully' };
}

module.exports = {
  findApplicableDiscounts,
  listDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
};
