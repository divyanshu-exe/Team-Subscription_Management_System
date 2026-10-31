// OWNER: BE-2
// PURPOSE: SQL aggregates and reporting queries for the management dashboard

const prisma = require('../../config/db');
const { parsePagination, paginated } = require('../../utils/pagination');
const { toUtcMidnight } = require('../../utils/dates');

async function getSummary(filters = {}) {
  const { from, to, customerId, planId } = filters;
  const today = toUtcMidnight(new Date());

  const subWhere = { status: 'ACTIVE' };
  if (customerId) subWhere.customerId = parseInt(customerId, 10);
  if (planId) subWhere.planId = parseInt(planId, 10);

  const invWhere = {};
  if (customerId) invWhere.customerId = parseInt(customerId, 10);
  if (planId) invWhere.subscription = { planId: parseInt(planId, 10) };
  if (from || to) {
    invWhere.issueDate = {};
    if (from) invWhere.issueDate.gte = new Date(from);
    if (to) invWhere.issueDate.lte = new Date(to);
  }

  const paymentWhere = {};
  if (customerId) paymentWhere.invoice = { customerId: parseInt(customerId, 10) };
  if (from || to) {
    paymentWhere.paymentDate = {};
    if (from) paymentWhere.paymentDate.gte = new Date(from);
    if (to) paymentWhere.paymentDate.lte = new Date(to);
  }

  // 1. Active subscriptions count
  const activeSubsCountPromise = prisma.subscription.count({ where: subWhere });

  // 2. Revenue received sum
  const revenuePromise = prisma.payment.aggregate({
    _sum: { amount: true },
    where: paymentWhere,
  });

  // 3. Invoice counts by status
  const invoiceGroupsPromise = prisma.invoice.groupBy({
    by: ['status'],
    _count: { id: true },
    where: invWhere,
  });

  // 4. Confirmed invoices for outstanding balance & overdue
  const confirmedInvoicesPromise = prisma.invoice.findMany({
    where: {
      ...invWhere,
      status: 'CONFIRMED',
    },
    select: {
      total: true,
      amountPaid: true,
      dueDate: true,
    },
  });

  // 5. Payments breakdown by payment method
  const paymentsByMethodPromise = prisma.payment.groupBy({
    by: ['method'],
    _sum: { amount: true },
    _count: { id: true },
    where: paymentWhere,
  });

  const [
    activeSubscriptions,
    revenueAgg,
    invoiceGroups,
    confirmedInvoices,
    paymentsByMethodGroup,
  ] = await Promise.all([
    activeSubsCountPromise,
    revenuePromise,
    invoiceGroupsPromise,
    confirmedInvoicesPromise,
    paymentsByMethodPromise,
  ]);

  const revenueReceived = Number(revenueAgg._sum.amount || 0);

  let amountOutstanding = 0;
  let overdueCount = 0;
  let overdueAmount = 0;

  for (const inv of confirmedInvoices) {
    const tot = Number(inv.total);
    const paid = Number(inv.amountPaid || 0);
    const bal = Math.max(0, tot - paid);

    amountOutstanding = Number((amountOutstanding + bal).toFixed(2));

    const dueUtc = toUtcMidnight(inv.dueDate);
    if (dueUtc.getTime() < today.getTime() && bal > 0) {
      overdueCount++;
      overdueAmount = Number((overdueAmount + bal).toFixed(2));
    }
  }

  const invoiceCounts = {
    draft: 0,
    confirmed: 0,
    paid: 0,
    cancelled: 0,
  };

  for (const g of invoiceGroups) {
    const key = g.status.toLowerCase();
    if (invoiceCounts[key] !== undefined) {
      invoiceCounts[key] = g._count.id;
    }
  }

  const paymentsByMethod = paymentsByMethodGroup.map((p) => ({
    method: p.method,
    amount: Number(p._sum.amount || 0),
    count: p._count.id,
  }));

  return {
    activeSubscriptions,
    revenueReceived,
    amountOutstanding,
    overdueCount,
    overdueAmount,
    invoiceCounts,
    paymentsByMethod,
  };
}

async function getOverdueInvoices(query = {}) {
  const { page, limit, skip, take } = parsePagination(query);
  const today = toUtcMidnight(new Date());

  const where = {
    status: 'CONFIRMED',
    dueDate: { lt: today },
  };

  if (query.customerId) {
    where.customerId = parseInt(query.customerId, 10);
  }

  const [total, items] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      skip,
      take,
      include: {
        customer: { select: { id: true, name: true, email: true, company: true } },
        subscription: { select: { id: true, number: true } },
      },
      orderBy: { dueDate: 'asc' }, // Oldest first
    }),
  ]);

  const overdueItems = items.map((inv) => {
    const tot = Number(inv.total);
    const paid = Number(inv.amountPaid || 0);
    const balance = Number((tot - paid).toFixed(2));
    const dueTime = toUtcMidnight(inv.dueDate).getTime();
    const daysOverdue = Math.max(0, Math.floor((today.getTime() - dueTime) / (1000 * 60 * 60 * 24)));

    return {
      ...inv,
      balance,
      daysOverdue,
    };
  });

  return paginated(overdueItems, total, page, limit);
}

async function getSubscriptionsByStatus() {
  const groups = await prisma.subscription.groupBy({
    by: ['status'],
    _count: { id: true },
  });

  const result = {
    DRAFT: 0,
    QUOTATION: 0,
    CONFIRMED: 0,
    ACTIVE: 0,
    CLOSED: 0,
  };

  for (const g of groups) {
    result[g.status] = g._count.id;
  }

  return result;
}

module.exports = {
  getSummary,
  getOverdueInvoices,
  getSubscriptionsByStatus,
};
