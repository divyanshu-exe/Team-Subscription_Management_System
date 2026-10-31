// OWNER: BE-2
// PURPOSE: Business logic for customer self-service portal (subscriptions, invoices, PDF downloads)

const prisma = require('../../config/db');
const { parsePagination, paginated } = require('../../utils/pagination');
const invoicesService = require('../invoices/invoices.service');

async function listPortalSubscriptions(customerId, query = {}) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = {
    customerId: parseInt(customerId, 10),
  };

  if (query.status) {
    where.status = query.status;
  }

  const [total, items] = await Promise.all([
    prisma.subscription.count({ where }),
    prisma.subscription.findMany({
      where,
      skip,
      take,
      include: {
        plan: { select: { id: true, name: true, period: true, price: true } },
        lines: {
          include: {
            product: { select: { id: true, name: true } },
            variant: { select: { id: true, attribute: true, value: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return paginated(items, total, page, limit);
}

async function getPortalSubscriptionById(id, customerId) {
  const subId = parseInt(id, 10);
  const subscription = await prisma.subscription.findFirst({
    where: {
      id: subId,
      customerId: parseInt(customerId, 10),
    },
    include: {
      plan: true,
      lines: {
        include: {
          product: true,
          variant: true,
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
          issueDate: true,
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

  return subscription;
}

async function listPortalInvoices(customerId, query = {}) {
  return await invoicesService.listInvoices({
    ...query,
    customerId: parseInt(customerId, 10),
  });
}

async function getPortalInvoiceById(id, customerId) {
  return await invoicesService.getInvoiceById(id, parseInt(customerId, 10));
}

module.exports = {
  listPortalSubscriptions,
  getPortalSubscriptionById,
  listPortalInvoices,
  getPortalInvoiceById,
};
