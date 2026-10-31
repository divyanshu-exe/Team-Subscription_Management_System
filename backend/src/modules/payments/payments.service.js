// OWNER: BE-2
// PURPOSE: Business logic for payment recording, balance updating, and settlement

const prisma = require('../../config/db');
const { parsePagination, paginated } = require('../../utils/pagination');

async function listPayments(query = {}) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = {};

  if (query.invoiceId) {
    where.invoiceId = parseInt(query.invoiceId, 10);
  }

  if (query.method) {
    where.method = query.method;
  }

  if (query.from || query.to) {
    where.paymentDate = {};
    if (query.from) {
      where.paymentDate.gte = new Date(query.from);
    }
    if (query.to) {
      where.paymentDate.lte = new Date(query.to);
    }
  }

  const [total, items] = await Promise.all([
    prisma.payment.count({ where }),
    prisma.payment.findMany({
      where,
      skip,
      take,
      include: {
        invoice: {
          select: {
            id: true,
            number: true,
            total: true,
            amountPaid: true,
            status: true,
            customer: {
              select: { id: true, name: true },
            },
          },
        },
        recordedBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { paymentDate: 'desc' },
    }),
  ]);

  return paginated(items, total, page, limit);
}

async function recordPayment(data, userId) {
  const invoiceId = parseInt(data.invoiceId, 10);
  const amount = Number(data.amount);

  if (amount <= 0) {
    const error = new Error('Payment amount must be greater than zero');
    error.status = 400;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      const error = new Error('Invoice not found');
      error.status = 404;
      throw error;
    }

    if (invoice.status !== 'CONFIRMED') {
      const error = new Error(`Cannot record payment for invoice in '${invoice.status}' status`);
      error.status = 400;
      throw error;
    }

    const total = Number(invoice.total);
    const currentPaid = Number(invoice.amountPaid || 0);
    const balance = Number((total - currentPaid).toFixed(2));

    if (amount > balance) {
      const error = new Error(`Payment amount ($${amount.toFixed(2)}) exceeds balance ($${balance.toFixed(2)})`);
      error.status = 400;
      throw error;
    }

    const payment = await tx.payment.create({
      data: {
        invoiceId,
        method: data.method,
        amount,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
        note: data.note || null,
        recordedById: userId,
      },
    });

    const newPaid = Number((currentPaid + amount).toFixed(2));
    const isSettled = newPaid >= total;
    const newStatus = isSettled ? 'PAID' : 'CONFIRMED';

    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: newPaid,
        status: newStatus,
      },
    });

    if (isSettled) {
      await tx.statusHistory.create({
        data: {
          entityType: 'INVOICE',
          entityId: invoiceId,
          fromStatus: 'CONFIRMED',
          toStatus: 'PAID',
          changedById: userId,
        },
      });
    }

    return payment;
  });
}

module.exports = {
  listPayments,
  recordPayment,
};
