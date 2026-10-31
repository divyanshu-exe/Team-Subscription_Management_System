// OWNER: BE-2
// PURPOSE: Business logic for invoices: list with computed balance, confirmation, cancellation, and email delivery

const prisma = require('../../config/db');
const { parsePagination, paginated } = require('../../utils/pagination');
const { toUtcMidnight } = require('../../utils/dates');
const { generateInvoicePdfBuffer } = require('./invoice.pdf');
const { invoiceEmail } = require('../../emails/invoice');
const { sendMail } = require('../../config/mailer');

async function listInvoices(query = {}) {
  const { page, limit, skip, take } = parsePagination(query);
  const where = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.customerId) {
    where.customerId = parseInt(query.customerId, 10);
  }

  if (query.from || query.to) {
    where.issueDate = {};
    if (query.from) {
      where.issueDate.gte = new Date(query.from);
    }
    if (query.to) {
      where.issueDate.lte = new Date(query.to);
    }
  }

  if (query.overdue === 'true') {
    const today = toUtcMidnight(new Date());
    where.status = 'CONFIRMED';
    where.dueDate = { lt: today };
    // Prisma Decimal comparison: total > amountPaid
    // Note: total > amountPaid is guaranteed for CONFIRMED status before full payment
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
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const itemsWithBalance = items.map((inv) => {
    const totalNum = Number(inv.total);
    const paidNum = Number(inv.amountPaid || 0);
    const balance = Number((totalNum - paidNum).toFixed(2));
    return {
      ...inv,
      balance,
    };
  });

  return paginated(itemsWithBalance, total, page, limit);
}

async function getInvoiceById(id, customerIdFilter = null) {
  const invoiceId = parseInt(id, 10);
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      subscription: {
        include: {
          plan: true,
        },
      },
      lines: {
        include: {
          product: true,
        },
      },
      payments: {
        include: {
          recordedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      discount: true,
    },
  });

  if (!invoice) {
    const error = new Error('Invoice not found');
    error.status = 404;
    throw error;
  }

  if (customerIdFilter !== null && invoice.customerId !== parseInt(customerIdFilter, 10)) {
    const error = new Error('Invoice not found');
    error.status = 404;
    throw error;
  }

  const history = await prisma.statusHistory.findMany({
    where: {
      entityType: 'INVOICE',
      entityId: invoiceId,
    },
    include: {
      changedBy: { select: { id: true, name: true } },
    },
    orderBy: { changedAt: 'asc' },
  });

  const totalNum = Number(invoice.total);
  const paidNum = Number(invoice.amountPaid || 0);
  const balance = Number((totalNum - paidNum).toFixed(2));

  return {
    ...invoice,
    balance,
    history,
  };
}

async function confirmInvoice(id, userId) {
  const invoiceId = parseInt(id, 10);
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
  });

  if (!invoice) {
    const error = new Error('Invoice not found');
    error.status = 404;
    throw error;
  }

  if (invoice.status !== 'DRAFT') {
    const error = new Error(`Cannot confirm invoice in '${invoice.status}' status`);
    error.status = 400;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: 'CONFIRMED' },
    });

    await tx.statusHistory.create({
      data: {
        entityType: 'INVOICE',
        entityId: invoiceId,
        fromStatus: 'DRAFT',
        toStatus: 'CONFIRMED',
        changedById: userId,
      },
    });

    return updated;
  });
}

async function cancelInvoice(id, userId) {
  const invoiceId = parseInt(id, 10);
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });

  if (!invoice) {
    const error = new Error('Invoice not found');
    error.status = 404;
    throw error;
  }

  if (invoice.status === 'CANCELLED' || invoice.status === 'PAID') {
    const error = new Error(`Cannot cancel invoice with status '${invoice.status}'`);
    error.status = 400;
    throw error;
  }

  if (invoice.payments && invoice.payments.length > 0) {
    const error = new Error('Cannot cancel an invoice with recorded payments');
    error.status = 400;
    throw error;
  }

  return await prisma.$transaction(async (tx) => {
    const updated = await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: 'CANCELLED' },
    });

    await tx.statusHistory.create({
      data: {
        entityType: 'INVOICE',
        entityId: invoiceId,
        fromStatus: invoice.status,
        toStatus: 'CANCELLED',
        changedById: userId,
      },
    });

    return updated;
  });
}

async function sendInvoice(id) {
  const invoiceId = parseInt(id, 10);
  const invoice = await getInvoiceById(invoiceId);

  if (invoice.status === 'DRAFT') {
    const error = new Error('Invoice must be confirmed before sending');
    error.status = 400;
    throw error;
  }

  if (!invoice.customer || !invoice.customer.email) {
    const error = new Error('Customer does not have an email address');
    error.status = 400;
    throw error;
  }

  const pdfBuffer = await generateInvoicePdfBuffer(invoice);
  const emailContent = invoiceEmail({ invoice, customer: invoice.customer });

  await sendMail({
    to: invoice.customer.email,
    subject: emailContent.subject,
    html: emailContent.html,
    attachments: [
      {
        filename: `${invoice.number}.pdf`,
        content: pdfBuffer,
      },
    ],
  });

  return {
    sent: true,
    recipient: invoice.customer.email,
  };
}

module.exports = {
  listInvoices,
  getInvoiceById,
  confirmInvoice,
  cancelInvoice,
  sendInvoice,
};
