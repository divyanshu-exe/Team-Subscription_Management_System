// OWNER: BE-2
// PURPOSE: Generate ~5,000 subscriptions + invoices for performance testing and demo

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // eslint-disable-next-line no-console
  console.log('Starting bulk data generation (~5k subscriptions, ~15k invoices, ~8k payments)...');

  // Load existing customers, plans, products, admin
  let customers = await prisma.customer.findMany({ select: { id: true } });
  let plans = await prisma.plan.findMany({ select: { id: true, period: true } });
  let products = await prisma.product.findMany({ select: { id: true, salesPrice: true } });
  let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });

  if (customers.length === 0 || plans.length === 0 || !admin) {
    // eslint-disable-next-line no-console
    console.log('Prerequisites missing. Please run `npm run seed` first.');
    return;
  }

  const statuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'CONFIRMED', 'QUOTATION', 'DRAFT', 'CLOSED'];
  const methods = ['CARD', 'BANK_TRANSFER', 'UPI', 'CASH', 'CHEQUE'];

  const now = new Date();
  const subRows = [];
  const TOTAL_SUBS = 5000;

  for (let i = 1; i <= TOTAL_SUBS; i++) {
    const cust = customers[i % customers.length];
    const plan = plans[i % plans.length];
    const status = statuses[i % statuses.length];
    const num = `SUB-BULK-${String(i).padStart(5, '0')}`;

    const startDate = new Date(Date.UTC(2024, (i % 12), (i % 28) + 1));
    const expiryDate = new Date(Date.UTC(2025, (i % 12), (i % 28) + 1));
    const nextInvoiceDate = status === 'ACTIVE' ? new Date(Date.UTC(2024, 6, 1)) : null;

    subRows.push({
      number: num,
      customerId: cust.id,
      planId: plan.id,
      startDate,
      expiryDate,
      paymentTermsDays: 15,
      paymentTermsLabel: 'Net 15',
      status,
      isPaused: false,
      nextInvoiceDate,
      createdById: admin.id,
    });
  }

  // Insert subscriptions in batches of 500
  // eslint-disable-next-line no-console
  console.log('Inserting subscriptions in batches...');
  for (let i = 0; i < subRows.length; i += 500) {
    const slice = subRows.slice(i, i + 500);
    await prisma.subscription.createMany({
      data: slice,
      skipDuplicates: true,
    });
  }

  // Fetch created sub ids
  const createdSubs = await prisma.subscription.findMany({
    where: { number: { startsWith: 'SUB-BULK-' } },
    select: { id: true, customerId: true, status: true, startDate: true },
  });

  // eslint-disable-next-line no-console
  console.log(`Loaded ${createdSubs.length} created subscriptions for invoices.`);

  // Generate ~15,000 invoices
  const invoiceRows = [];
  let invCounter = 1;

  for (const sub of createdSubs) {
    // Generate 3 invoices per sub
    for (let period = 0; period < 3; period++) {
      const pStart = new Date(Date.UTC(2024, period, 1));
      const pEnd = new Date(Date.UTC(2024, period + 1, 0));
      const issueDate = pStart;
      const dueDate = new Date(Date.UTC(2024, period, 15));
      const isOverdue = dueDate < now && period < 2;
      const invStatus = period === 0 ? 'PAID' : isOverdue ? 'CONFIRMED' : 'DRAFT';

      const total = 99.0;
      const amountPaid = invStatus === 'PAID' ? 99.0 : 0.0;

      invoiceRows.push({
        number: `INV-BULK-${String(invCounter++).padStart(6, '0')}`,
        subscriptionId: sub.id,
        customerId: sub.customerId,
        periodStart: pStart,
        periodEnd: pEnd,
        issueDate,
        dueDate,
        status: invStatus,
        subtotal: total,
        discountTotal: 0,
        taxTotal: 0,
        total,
        amountPaid,
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log('Inserting invoices in batches...');
  for (let i = 0; i < invoiceRows.length; i += 500) {
    const slice = invoiceRows.slice(i, i + 500);
    await prisma.invoice.createMany({
      data: slice,
      skipDuplicates: true,
    });
  }

  // Fetch created paid invoices for payments
  const paidInvoices = await prisma.invoice.findMany({
    where: { number: { startsWith: 'INV-BULK-' }, status: 'PAID' },
    select: { id: true, total: true, issueDate: true },
    take: 8000,
  });

  const paymentRows = paidInvoices.map((inv, idx) => ({
    invoiceId: inv.id,
    method: methods[idx % methods.length],
    amount: inv.total,
    paymentDate: inv.issueDate,
    note: 'Automated batch payment',
    recordedById: admin.id,
  }));

  // eslint-disable-next-line no-console
  console.log(`Inserting ${paymentRows.length} payments in batches...`);
  for (let i = 0; i < paymentRows.length; i += 500) {
    const slice = paymentRows.slice(i, i + 500);
    await prisma.payment.createMany({
      data: slice,
    });
  }

  // eslint-disable-next-line no-console
  console.log('Bulk dataset seeded successfully!');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('Error in bulk seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
