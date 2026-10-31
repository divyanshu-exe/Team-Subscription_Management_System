// OWNER: BE-1
// PURPOSE: Seed demo accounts (admin, 2 staff, 5 customers), taxes, products, plans, discounts, templates

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
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@brightloop.test',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
    },
  });

  // 2. Staff Users
  const staffPassword = await hashPassword('Staff@1234');
  const staff1 = await prisma.user.upsert({
    where: { email: 'staff1@brightloop.test' },
    update: {},
    create: {
      name: 'Sarah Connor',
      email: 'staff1@brightloop.test',
      password: staffPassword,
      role: 'STAFF',
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'staff2@brightloop.test' },
    update: {},
    create: {
      name: 'John Miller',
      email: 'staff2@brightloop.test',
      password: staffPassword,
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

  for (const c of customerList) {
    const cust = await prisma.customer.upsert({
      where: { email: c.email },
      update: {},
      create: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        address: c.address,
      },
    });

    await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        name: c.name,
        email: c.email,
        password: c.pass,
        role: 'CUSTOMER',
        customerId: cust.id,
        isActive: true,
      },
    });
  }

  // 4. Taxes
  const zeroTax = await prisma.tax.create({
    data: { name: 'No Tax (0%)', type: 'PERCENT', value: 0, isActive: true },
  }).catch(() => null);

  const tax5 = await prisma.tax.create({
    data: { name: 'Standard VAT (5%)', type: 'PERCENT', value: 5, isActive: true },
  }).catch(() => null);

  const gst18 = await prisma.tax.create({
    data: { name: 'GST (18%)', type: 'PERCENT', value: 18, isActive: true },
  }).catch(() => null);

  await prisma.tax.create({
    data: { name: 'Regulatory Fixed Fee', type: 'FIXED', value: 10, isActive: true },
  }).catch(() => null);

  // 5. Products & Variants
  const cloudSuite = await prisma.product.create({
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
  }).catch(() => null);

  const supportRetainer = await prisma.product.create({
    data: {
      name: 'Support Retainer (24/7 SLA)',
      type: 'service',
      salesPrice: 199.0,
      costPrice: 50.0,
      notes: 'Dedicated engineering support',
    },
  }).catch(() => null);

  const dedicatedIp = await prisma.product.create({
    data: {
      name: 'Dedicated Static IP',
      type: 'service',
      salesPrice: 15.0,
      costPrice: 2.0,
      notes: 'High-reputation static IP',
    },
  }).catch(() => null);

  await prisma.product.create({
    data: {
      name: 'Hardware Appliance',
      type: 'consumable',
      salesPrice: 499.0,
      costPrice: 280.0,
      notes: 'On-premise cache edge appliance',
    },
  }).catch(() => null);

  // 6. Plans
  const now = new Date();
  const availableFrom = new Date(Date.UTC(now.getUTCFullYear() - 1, 0, 1));
  const availableTo = new Date(Date.UTC(now.getUTCFullYear() + 2, 11, 31));

  const monthlyStarterPlan = await prisma.plan.create({
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
  }).catch(() => null);

  const annualProPlan = await prisma.plan.create({
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
  }).catch(() => null);

  await prisma.plan.create({
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
  }).catch(() => null);

  // 7. Discounts
  await prisma.discount.create({
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
  }).catch(() => null);

  await prisma.discount.create({
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
  }).catch(() => null);

  if (cloudSuite) {
    await prisma.discount.create({
      data: {
        name: 'Cloud Suite Promo 15%',
        type: 'PERCENT',
        value: 15.0,
        startDate: availableFrom,
        endDate: availableTo,
        usageLimit: 200,
        usedCount: 0,
        appliesTo: 'PRODUCTS',
        isActive: true,
        products: {
          create: [{ productId: cloudSuite.id }],
        },
      },
    }).catch(() => null);
  }

  // 8. Quotation Templates
  if (monthlyStarterPlan && cloudSuite && dedicatedIp) {
    await prisma.quotationTemplate.create({
      data: {
        name: 'Standard Cloud Starter Package',
        planId: monthlyStarterPlan.id,
        validityDays: 30,
        lines: {
          create: [
            { productId: cloudSuite.id, quantity: 1 },
            { productId: dedicatedIp.id, quantity: 1 },
          ],
        },
      },
    }).catch(() => null);
  }

  if (annualProPlan && cloudSuite && supportRetainer) {
    await prisma.quotationTemplate.create({
      data: {
        name: 'Enterprise Annual Bundle',
        planId: annualProPlan.id,
        validityDays: 45,
        lines: {
          create: [
            { productId: cloudSuite.id, quantity: 1 },
            { productId: supportRetainer.id, quantity: 1 },
          ],
        },
      },
    }).catch(() => null);
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
