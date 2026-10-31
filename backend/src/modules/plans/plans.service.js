// OWNER: BE-1
// PURPOSE: Business logic for subscription plans & availability window check

const prisma = require('../../config/db');

/**
 * Checks whether a plan is active and valid on a specific date
 * Exported for BE-2 subscriptions module.
 * @param {Object} plan
 * @param {Date|string} [date=new Date()]
 * @returns {boolean}
 */
function isPlanAvailable(plan, date = new Date()) {
  if (!plan.isActive) return false;
  const target = new Date(date).getTime();
  const from = new Date(plan.availableFrom).getTime();
  const to = new Date(plan.availableTo).getTime();

  return target >= from && target <= to;
}

async function listPlans(query = {}) {
  const where = { isActive: true };

  if (query.active === 'true') {
    const today = new Date();
    where.availableFrom = { lte: today };
    where.availableTo = { gte: today };
  }

  return await prisma.plan.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

async function getPlanById(id) {
  const planId = parseInt(id, 10);
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!plan || !plan.isActive) {
    const error = new Error('Plan not found');
    error.status = 404;
    throw error;
  }

  return plan;
}

async function createPlan(data) {
  return await prisma.plan.create({
    data: {
      name: data.name,
      price: data.price,
      period: data.period,
      minQuantity: data.minQuantity || 1,
      availableFrom: new Date(data.availableFrom),
      availableTo: new Date(data.availableTo),
      autoCloseAtEnd: Boolean(data.autoCloseAtEnd),
      closableEarly: Boolean(data.closableEarly),
      pausable: Boolean(data.pausable),
      renewable: Boolean(data.renewable),
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
}

async function updatePlan(id, data) {
  const planId = parseInt(id, 10);

  const existing = await prisma.plan.findUnique({
    where: { id: planId },
  });

  if (!existing || !existing.isActive) {
    const error = new Error('Plan not found');
    error.status = 404;
    throw error;
  }

  return await prisma.plan.update({
    where: { id: planId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.period !== undefined && { period: data.period }),
      ...(data.minQuantity !== undefined && { minQuantity: data.minQuantity }),
      ...(data.availableFrom !== undefined && { availableFrom: new Date(data.availableFrom) }),
      ...(data.availableTo !== undefined && { availableTo: new Date(data.availableTo) }),
      ...(data.autoCloseAtEnd !== undefined && { autoCloseAtEnd: data.autoCloseAtEnd }),
      ...(data.closableEarly !== undefined && { closableEarly: data.closableEarly }),
      ...(data.pausable !== undefined && { pausable: data.pausable }),
      ...(data.renewable !== undefined && { renewable: data.renewable }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

async function deletePlan(id) {
  const planId = parseInt(id, 10);
  await prisma.plan.update({
    where: { id: planId },
    data: { isActive: false },
  });

  return { success: true, message: 'Plan deleted successfully' };
}

module.exports = {
  isPlanAvailable,
  listPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};
