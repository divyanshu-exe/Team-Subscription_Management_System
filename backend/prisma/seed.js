// OWNER: BE-1 & BE-2
// PURPOSE: Seed demo accounts (Admin, 2 Staff, Customers), taxes, products, plans, discounts, templates, and subscriptions

const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/utils/password');

const prisma = new PrismaClient();

async function main() {
  // eslint-disable-next-line no-console
  console.log('Seeding initial Brightloop data...');

  // 1. Admin User
  const adminPassword = await hashPassword('Admin@1234');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@brightloop.test' },
    update: { passwordHash: adminPassword },
    create: {
      name: 'System Admin',
      email: 'admin@brightloop.test',
      passwordHash: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  // 2. Staff Users
  const staffPassword = await hashPassword('Staff@1234');
  await prisma.user.upsert({
    where: { email: 'staff1@brightloop.test' },
    update: { passwordHash: staffPassword },
    create: {
      name: 'Sarah Connor',
      email: 'staff1@brightloop.test',
      passwordHash: staffPassword,
      role: 'STAFF',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff2@brightloop.test' },
    update: { passwordHash: staffPassword },
    create: {
      name: 'John Miller',
      email: 'staff2@brightloop.test',
      passwordHash: staffPassword,
      role: 'STAFF',
      isActive: true,
    },
  });

  // 3. Customers and Customer Users
  const custPassword = await hashPassword('Cust@1234');
  const demoCustPassword = await hashPassword('Customer@1234');
  const customerList = [
    { name: 'Acme Corporation', email: 'cust1@brightloop.test', phone: '+1 555-0101', company: 'Acme Corp', address: '100 Innovation Way, Suite 400', pass: custPassword },
    { name: 'Acme Demo Client', email: 'customer1@brightloop.test', phone: '+1 555-0199', company: 'Acme Corp', address: '100 Innovation Way, Suite 400', pass: demoCustPassword },
    { name: 'Globex Industries', email: 'cust2@brightloop.test', phone: '+1 555-0102', company: 'Globex Ltd', address: '220 Tech Park, Building B', pass: custPassword },
    { name: 'Soylent Ventures', email: 'cust3@brightloop.test', phone: '+1 555-0103', company: 'Soylent Inc', address: '77 Silicon Blvd', pass: custPassword },
    { name: 'Initech Systems', email: 'cust4@brightloop.test', phone: '+1 555-0104', company: 'Initech', address: '4120 Freemont Ave', pass: custPassword },
    { name: 'Umbrella Health', email: 'cust5@brightloop.test', phone: '+1 555-0105', company: 'Umbrella Corp', address: '99 Raccoon Street', pass: custPassword },
  ];

  const seededCustomers = [];

  for (const c of customerList) {
    let cust = await prisma.customer.findFirst({
      where: { email: c.email },
    });

    if (!cust) {
      cust = await prisma.customer.create({
        data: {
          name: c.name,
          email: c.email,
          phone: c.phone,
          company: c.company,
          address: c.address,
        },
      });
    }

    await prisma.user.upsert({
      where: { email: c.email },
      update: { passwordHash: c.pass, customerId: cust.id },
      create: {
        name: c.name,
        email: c.email,
        passwordHash: c.pass,
        role: 'CUSTOMER',
        customerId: cust.id,
        isActive: true,
      },
    });

    seededCustomers.push(cust);
  }

  // Also find if any user signed up directly (e.g. mohit) and include their customer
  const allCustomers = await prisma.customer.findMany();

  // 4. Taxes
  let taxZero = await prisma.tax.findFirst({ where: { name: 'No Tax (0%)' } });
  if (!taxZero) {
    taxZero = await prisma.tax.create({
      data: { name: 'No Tax (0%)', type: 'PERCENT', value: 0, isActive: true },
    });
  }

  let tax5 = await prisma.tax.findFirst({ where: { name: 'Standard VAT (5%)' } });
  if (!tax5) {
    tax5 = await prisma.tax.create({
      data: { name: 'Standard VAT (5%)', type: 'PERCENT', value: 5, isActive: true },
    });
  }

  let tax18 = await prisma.tax.findFirst({ where: { name: 'GST (18%)' } });
  if (!tax18) {
    tax18 = await prisma.tax.create({
      data: { name: 'GST (18%)', type: 'PERCENT', value: 18, isActive: true },
    });
  }

  let taxFixed = await prisma.tax.findFirst({ where: { name: 'Regulatory Fixed Fee' } });
  if (!taxFixed) {
    taxFixed = await prisma.tax.create({
      data: { name: 'Regulatory Fixed Fee', type: 'FIXED', value: 10, isActive: true },
    });
  }

  // 5. Products & Variants
  let cloudSuite = await prisma.product.findFirst({ where: { name: 'Brightloop Cloud Suite' }, include: { variants: true } });
  if (!cloudSuite) {
    cloudSuite = await prisma.product.create({
      data: {
        name: 'Brightloop Cloud Suite',
        type: 'service',
        salesPrice: 49.0,
        costPrice: 15.0,
        notes: 'Flagship enterprise subscription suite',
        variants: {
          create: [
            { attribute: 'Tier', value: 'Starter', extraPrice: 0.0 },
            { attribute: 'Tier', value: 'Pro', extraPrice: 30.0 },
            { attribute: 'Tier', value: 'Enterprise', extraPrice: 70.0 },
            { attribute: 'Brand', value: 'Odoo', extraPrice: 560.0 },
          ],
        },
      },
      include: { variants: true },
    });
  }

  let supportRetainer = await prisma.product.findFirst({ where: { name: 'Support Retainer (24/7 SLA)' } });
  if (!supportRetainer) {
    supportRetainer = await prisma.product.create({
      data: {
        name: 'Support Retainer (24/7 SLA)',
        type: 'service',
        salesPrice: 199.0,
        costPrice: 50.0,
        notes: 'Dedicated engineering support',
      },
    });
  }

  let dedicatedIp = await prisma.product.findFirst({ where: { name: 'Dedicated Static IP' } });
  if (!dedicatedIp) {
    dedicatedIp = await prisma.product.create({
      data: {
        name: 'Dedicated Static IP',
        type: 'service',
        salesPrice: 15.0,
        costPrice: 2.0,
        notes: 'High-reputation static IP',
      },
    });
  }

  let hardwareAppliance = await prisma.product.findFirst({ where: { name: 'Hardware Appliance' } });
  if (!hardwareAppliance) {
    hardwareAppliance = await prisma.product.create({
      data: {
        name: 'Hardware Appliance',
        type: 'consumable',
        salesPrice: 499.0,
        costPrice: 280.0,
        notes: 'On-premise cache edge appliance',
      },
    });
  }

  // 6. Plans
  const now = new Date();
  const availableFrom = new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1));
  const availableTo = new Date(Date.UTC(now.getUTCFullYear() + 2, 11, 31));

  let monthlyStarter = await prisma.plan.findFirst({ where: { name: 'Monthly Starter' } });
  if (!monthlyStarter) {
    monthlyStarter = await prisma.plan.create({
      data: {
        name: 'Monthly Starter',
        price: 49.0,
        period: 'MONTHLY',
        minQuantity: 1,
        availableFrom,
        availableTo,
        autoCloseAtEnd: false,
        closableEarly: true,
        pausable: true,
        renewable: true,
        isActive: true,
      },
    });
  }

  let annualPro = await prisma.plan.findFirst({ where: { name: 'Annual Pro' } });
  if (!annualPro) {
    annualPro = await prisma.plan.create({
      data: {
        name: 'Annual Pro',
        price: 490.0,
        period: 'YEARLY',
        minQuantity: 1,
        availableFrom,
        availableTo,
        autoCloseAtEnd: false,
        closableEarly: false,
        pausable: false,
        renewable: true,
        isActive: true,
      },
    });
  }

  let weeklyTrial = await prisma.plan.findFirst({ where: { name: 'Weekly Trial' } });
  if (!weeklyTrial) {
    weeklyTrial = await prisma.plan.create({
      data: {
        name: 'Weekly Trial',
        price: 10.0,
        period: 'WEEKLY',
        minQuantity: 1,
        availableFrom,
        availableTo,
        autoCloseAtEnd: true,
        closableEarly: true,
        pausable: false,
        renewable: false,
        isActive: true,
      },
    });
  }

  // 7. Discounts
  let discountWelcome = await prisma.discount.findFirst({ where: { name: 'Welcome 10%' } });
  if (!discountWelcome) {
    discountWelcome = await prisma.discount.create({
      data: {
        name: 'Welcome 10%',
        type: 'PERCENT',
        value: 10.0,
        startDate: availableFrom,
        endDate: availableTo,
        usageLimit: 100,
        usedCount: 0,
        appliesTo: 'SUBSCRIPTION',
        isActive: true,
      },
    });
  }

  let discountFlat = await prisma.discount.findFirst({ where: { name: 'Flat $20 Off' } });
  if (!discountFlat) {
    discountFlat = await prisma.discount.create({
      data: {
        name: 'Flat $20 Off',
        type: 'FIXED',
        value: 20.0,
        minPurchase: 100.0,
        startDate: availableFrom,
        endDate: availableTo,
        usageLimit: 50,
        usedCount: 0,
        appliesTo: 'SUBSCRIPTION',
        isActive: true,
      },
    });
  }

  // 8. Quotation Templates
  let templateCloud = await prisma.quotationTemplate.findFirst({ where: { name: 'Standard Cloud Starter Package' } });
  if (!templateCloud && monthlyStarter && cloudSuite && dedicatedIp) {
    templateCloud = await prisma.quotationTemplate.create({
      data: {
        name: 'Standard Cloud Starter Package',
        planId: monthlyStarter.id,
        validityDays: 30,
        lines: {
          create: [
            { productId: cloudSuite.id, quantity: 1 },
            { productId: dedicatedIp.id, quantity: 1 },
          ],
        },
      },
    });
  }

  // 9. Demo Subscriptions and Invoices for each customer (including any user signed up)
  for (let idx = 0; idx < allCustomers.length; idx++) {
    const cust = allCustomers[idx];
    const subNum = `SUB-${String(idx + 1).padStart(5, '0')}`;

    let sub = await prisma.subscription.findUnique({
      where: { number: subNum },
    });

    if (!sub) {
      const startDate = new Date(Date.UTC(2024, 0, 1));
      const expiryDate = new Date(Date.UTC(2025, 0, 1));
      const nextInvoiceDate = new Date(Date.UTC(2024, 6, 1));

      sub = await prisma.subscription.create({
        data: {
          number: subNum,
          customerId: cust.id,
          planId: monthlyStarter.id,
          templateId: templateCloud ? templateCloud.id : null,
          startDate,
          expiryDate,
          paymentTermsDays: 15,
          paymentTermsLabel: 'Net 15',
          status: 'ACTIVE',
          isPaused: false,
          nextInvoiceDate,
          createdById: admin.id,
          lines: {
            create: [
              {
                productId: cloudSuite.id,
                quantity: 1,
                unitPrice: 49.0,
                taxId: tax5.id,
                amount: 49.0,
              },
              {
                productId: dedicatedIp.id,
                quantity: 1,
                unitPrice: 15.0,
                taxId: taxZero.id,
                amount: 15.0,
              },
            ],
          },
        },
      });

      // Add a status history row
      await prisma.statusHistory.create({
        data: {
          entityType: 'SUBSCRIPTION',
          entityId: sub.id,
          fromStatus: 'CONFIRMED',
          toStatus: 'ACTIVE',
          changedById: admin.id,
        },
      });

      // Generate 2 demo invoices for this subscription
      const inv1Num = `INV-${String(idx * 2 + 1).padStart(5, '0')}`;
      const inv2Num = `INV-${String(idx * 2 + 2).padStart(5, '0')}`;

      // Paid Invoice
      const inv1 = await prisma.invoice.create({
        data: {
          number: inv1Num,
          subscriptionId: sub.id,
          customerId: cust.id,
          periodStart: new Date(Date.UTC(2024, 0, 1)),
          periodEnd: new Date(Date.UTC(2024, 0, 31)),
          issueDate: new Date(Date.UTC(2024, 0, 1)),
          dueDate: new Date(Date.UTC(2024, 0, 16)),
          status: 'PAID',
          subtotal: 64.0,
          discountTotal: 0,
          taxTotal: 2.45,
          total: 66.45,
          amountPaid: 66.45,
          lines: {
            create: [
              {
                productId: cloudSuite.id,
                description: 'Brightloop Cloud Suite',
                quantity: 1,
                unitPrice: 49.0,
                taxAmount: 2.45,
                discountAmount: 0,
                amount: 51.45,
              },
              {
                productId: dedicatedIp.id,
                description: 'Dedicated Static IP',
                quantity: 1,
                unitPrice: 15.0,
                taxAmount: 0,
                discountAmount: 0,
                amount: 15.0,
              },
            ],
          },
        },
      });

      // Payment for inv1
      await prisma.payment.create({
        data: {
          invoiceId: inv1.id,
          method: 'CARD',
          amount: 66.45,
          paymentDate: new Date(Date.UTC(2024, 0, 5)),
          note: 'Initial subscription payment',
          recordedById: admin.id,
        },
      });

      // Confirmed (Outstanding) Invoice
      await prisma.invoice.create({
        data: {
          number: inv2Num,
          subscriptionId: sub.id,
          customerId: cust.id,
          periodStart: new Date(Date.UTC(2024, 1, 1)),
          periodEnd: new Date(Date.UTC(2024, 1, 29)),
          issueDate: new Date(Date.UTC(2024, 1, 1)),
          dueDate: new Date(Date.UTC(2024, 1, 16)),
          status: 'CONFIRMED',
          subtotal: 64.0,
          discountTotal: 0,
          taxTotal: 2.45,
          total: 66.45,
          amountPaid: 0,
          lines: {
            create: [
              {
                productId: cloudSuite.id,
                description: 'Brightloop Cloud Suite',
                quantity: 1,
                unitPrice: 49.0,
                taxAmount: 2.45,
                discountAmount: 0,
                amount: 51.45,
              },
              {
                productId: dedicatedIp.id,
                description: 'Dedicated Static IP',
                quantity: 1,
                unitPrice: 15.0,
                taxAmount: 0,
                discountAmount: 0,
                amount: 15.0,
              },
            ],
          },
        },
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log('Brightloop seed finished successfully.');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error('Error in seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
