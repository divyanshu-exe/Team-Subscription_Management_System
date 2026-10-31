// OWNER: BE-2
// PURPOSE: Business logic for subscriptions, status workflows, plan flag enforcement, and auto-closing

const prisma = require('../../config/db');
const { parsePagination, paginated } = require('../../utils/pagination');
const { nextNumber } = require('../../utils/numbering');
const { addPeriod } = require('../../utils/dates');
const { calcLinePrice } = require('../products/products.service');
const { isPlanAvailable } = require('../plans/plans.service');
const { assertTransition } = require('./subscription.statemachine');

async function listSubscriptions(query) {
  const { page, limit, skip, take } = parsePagination(query);

  const where = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.customerId) {
    where.customerId = parseInt(query.customerId, 10);
  }

  if (query.search) {
    where.OR = [
      { number: { contains: query.search, mode: 'insensitive' } },
      { customer: { name: { contains: query.search, mode: 'insensitive' } } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.subscription.count({ where }),
    prisma.subscription.findMany({
      where,
      skip,
      take,
      select: {
        id: true,
        number: true,
        customerId: true,
        status: true,
        startDate: true,
        expiryDate: true,
        nextInvoiceDate: true,
        isPaused: true,
        customer: { select: { id: true, name: true, email: true } },
        plan: { select: { id: true, name: true, period: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return paginated(items, total, page, limit);
}

async function getSubscriptionById(id) {
  const subId = parseInt(id, 10);
  const subscription = await prisma.subscription.findUnique({
    where: { id: subId },
    include: {
      customer: true,
      plan: true,
      template: true,
      createdBy: { select: { id: true, name: true, email: true } },
      lines: {
        include: {
          product: true,
          variant: true,
          tax: true,
        },
      },
      invoices: {
        select: {
          id: true,
          number: true,
          status: true,
          total: true,
          amountPaid: true,
          dueDate: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!subscription) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }

  // Load status history
  const history = await prisma.statusHistory.findMany({
    where: {
      entityType: 'SUBSCRIPTION',
      entityId: subId,
    },
    include: {
      changedBy: { select: { id: true, name: true } },
    },
    orderBy: { changedAt: 'asc' },
  });

  return {
    ...subscription,
    history,
  };
}

async function createSubscription(data, userId) {
  return await prisma.$transaction(async (tx) => {
    const plan = await tx.plan.findUnique({ where: { id: data.planId } });
    if (!plan || !plan.isActive) {
      const error = new Error('Plan not found or inactive');
      error.status = 400;
      throw error;
    }

    // Validate plan availability on startDate
    if (!isPlanAvailable(plan, data.startDate)) {
      const error = new Error('Plan is not available for selection on the given start date');
      error.status = 400;
      throw error;
    }

    // Determine lines (copy from template if templateId provided and lines omitted)
    let sourceLines = data.lines || [];
    if (sourceLines.length === 0 && data.templateId) {
      const template = await tx.quotationTemplate.findUnique({
        where: { id: data.templateId },
        include: { lines: true },
      });
      if (template) {
        sourceLines = template.lines.map((l) => ({
          productId: l.productId,
          variantId: l.variantId,
          quantity: l.quantity,
          taxId: null,
        }));
      }
    }

    if (sourceLines.length === 0) {
      const error = new Error('Subscription must contain at least one line item');
      error.status = 400;
      throw error;
    }

    const calculatedLines = [];
    for (const line of sourceLines) {
      if (line.quantity < plan.minQuantity) {
        const error = new Error(
          `Line quantity (${line.quantity}) is less than plan minimum quantity (${plan.minQuantity})`
        );
        error.status = 400;
        throw error;
      }

      const product = await tx.product.findUnique({ where: { id: line.productId } });
      if (!product || !product.isActive) {
        const error = new Error(`Product ${line.productId} not found`);
        error.status = 400;
        throw error;
      }

      let variant = null;
      if (line.variantId) {
        variant = await tx.variant.findUnique({ where: { id: line.variantId } });
      }

      const unitPrice = calcLinePrice(product, variant);
      const amount = Number((line.quantity * unitPrice).toFixed(2));

      calculatedLines.push({
        productId: line.productId,
        variantId: line.variantId || null,
        quantity: line.quantity,
        unitPrice,
        taxId: line.taxId || null,
        amount,
      });
    }

    const subNumber = await nextNumber(tx, 'SUB', 'SUB');

    const subscription = await tx.subscription.create({
      data: {
        number: subNumber,
        customerId: data.customerId,
        planId: data.planId,
        templateId: data.templateId || null,
        startDate: new Date(data.startDate),
        expiryDate: new Date(data.expiryDate),
        paymentTermsDays: data.paymentTermsDays || 15,
        paymentTermsLabel: data.paymentTerms,
        status: 'DRAFT',
        isPaused: false,
        createdById: userId,
        lines: {
          create: calculatedLines,
        },
      },
      include: {
        lines: true,
        plan: true,
        customer: true,
      },
    });

    await tx.statusHistory.create({
      data: {
        entityType: 'SUBSCRIPTION',
        entityId: subscription.id,
        fromStatus: 'NONE',
        toStatus: 'DRAFT',
        changedById: userId,
      },
    });

    return subscription;
  });
}

async function updateSubscription(id, data, userId) {
  const subId = parseInt(id, 10);

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.subscription.findUnique({
      where: { id: subId },
      include: { plan: true },
    });

    if (!existing) {
      const error = new Error('Subscription not found');
      error.status = 404;
      throw error;
    }

    if (!['DRAFT', 'QUOTATION'].includes(existing.status)) {
      const error = new Error('Subscriptions can only be edited while in DRAFT or QUOTATION status');
      error.status = 400;
      throw error;
    }

    if (data.lines) {
      await tx.subscriptionLine.deleteMany({ where: { subscriptionId: subId } });

      for (const line of data.lines) {
        if (line.quantity < existing.plan.minQuantity) {
          const error = new Error(
            `Line quantity (${line.quantity}) is less than plan minimum quantity (${existing.plan.minQuantity})`
          );
          error.status = 400;
          throw error;
        }

        const product = await tx.product.findUnique({ where: { id: line.productId } });
        let variant = null;
        if (line.variantId) {
          variant = await tx.variant.findUnique({ where: { id: line.variantId } });
        }
        const unitPrice = calcLinePrice(product, variant);
        const amount = Number((line.quantity * unitPrice).toFixed(2));

        await tx.subscriptionLine.create({
          data: {
            subscriptionId: subId,
            productId: line.productId,
            variantId: line.variantId || null,
            quantity: line.quantity,
            unitPrice,
            taxId: line.taxId || null,
            amount,
          },
        });
      }
    }

    const updated = await tx.subscription.update({
      where: { id: subId },
      data: {
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.expiryDate && { expiryDate: new Date(data.expiryDate) }),
        ...(data.paymentTerms && { paymentTermsLabel: data.paymentTerms }),
        ...(data.paymentTermsDays !== undefined && { paymentTermsDays: data.paymentTermsDays }),
      },
      include: {
        lines: true,
        plan: true,
      },
    });

    return updated;
  });
}

async function transitionSubscription(id, to, userId) {
  const subId = parseInt(id, 10);

  return await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.findUnique({
      where: { id: subId },
    });

    if (!subscription) {
      const error = new Error('Subscription not found');
      error.status = 404;
      throw error;
    }

    assertTransition(subscription.status, to);

    const updateData = { status: to };

    if (to === 'ACTIVE') {
      updateData.nextInvoiceDate = subscription.startDate;
    } else if (to === 'CLOSED') {
      updateData.nextInvoiceDate = null;
    }

    const updated = await tx.subscription.update({
      where: { id: subId },
      data: updateData,
    });

    await tx.statusHistory.create({
      data: {
        entityType: 'SUBSCRIPTION',
        entityId: subId,
        fromStatus: subscription.status,
        toStatus: to,
        changedById: userId,
      },
    });

    return updated;
  });
}

async function pauseSubscription(id, userId) {
  const subId = parseInt(id, 10);
  const subscription = await prisma.subscription.findUnique({
    where: { id: subId },
    include: { plan: true },
  });

  if (!subscription) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }

  if (!subscription.plan.pausable) {
    const error = new Error('This subscription plan does not allow pausing');
    error.status = 400;
    throw error;
  }

  return await prisma.subscription.update({
    where: { id: subId },
    data: { isPaused: true },
  });
}

async function resumeSubscription(id, userId) {
  const subId = parseInt(id, 10);
  return await prisma.subscription.update({
    where: { id: subId },
    data: { isPaused: false },
  });
}

async function renewSubscription(id, userId) {
  const subId = parseInt(id, 10);
  const subscription = await prisma.subscription.findUnique({
    where: { id: subId },
    include: { plan: true },
  });

  if (!subscription) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }

  if (!subscription.plan.renewable) {
    const error = new Error('This subscription plan is not renewable');
    error.status = 400;
    throw error;
  }

  // Extend expiryDate by one plan period
  const newExpiry = addPeriod(subscription.expiryDate, subscription.plan.period);

  return await prisma.subscription.update({
    where: { id: subId },
    data: { expiryDate: newExpiry },
  });
}

async function closeSubscription(id, userId) {
  const subId = parseInt(id, 10);
  const subscription = await prisma.subscription.findUnique({
    where: { id: subId },
    include: { plan: true },
  });

  if (!subscription) {
    const error = new Error('Subscription not found');
    error.status = 404;
    throw error;
  }

  if (!subscription.plan.closableEarly) {
    const error = new Error('This subscription plan cannot be closed early');
    error.status = 400;
    throw error;
  }

  return await transitionSubscription(id, 'CLOSED', userId);
}

/**
 * Closes ACTIVE subscriptions whose expiryDate < today and whose plan.autoCloseAtEnd = true
 * Exported for scheduler cron job.
 * @param {Date|string} [today=new Date()]
 */
async function closeExpiredSubscriptions(today = new Date()) {
  const todayDate = new Date(today);

  const expiredSubs = await prisma.subscription.findMany({
    where: {
      status: 'ACTIVE',
      expiryDate: { lt: todayDate },
      plan: { autoCloseAtEnd: true },
    },
    select: { id: true, createdById: true },
  });

  for (const sub of expiredSubs) {
    await prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: sub.id },
        data: {
          status: 'CLOSED',
          nextInvoiceDate: null,
        },
      });

      await tx.statusHistory.create({
        data: {
          entityType: 'SUBSCRIPTION',
          entityId: sub.id,
          fromStatus: 'ACTIVE',
          toStatus: 'CLOSED',
          changedById: sub.createdById,
        },
      });
    });
  }

  return { closedCount: expiredSubs.length };
}

module.exports = {
  listSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  transitionSubscription,
  pauseSubscription,
  resumeSubscription,
  renewSubscription,
  closeSubscription,
  closeExpiredSubscriptions,
};
