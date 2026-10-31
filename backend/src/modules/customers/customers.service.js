// OWNER: BE-1
// PURPOSE: Business logic for customer management (ADMIN and STAFF)

const prisma = require('../../config/db');
const { parsePagination, paginated } = require('../../utils/pagination');

async function listCustomers(query) {
  const { page, limit, skip, take } = parsePagination(query);

  const where = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { company: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return paginated(items, total, page, limit);
}

async function createCustomer(data) {
  return await prisma.customer.create({
    data: {
      name: data.name,
      email: data.email.trim().toLowerCase(),
      phone: data.phone || null,
      company: data.company || null,
      address: data.address || null,
    },
  });
}

async function getCustomerById(id) {
  const customerId = parseInt(id, 10);
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      subscriptions: {
        select: {
          id: true,
          number: true,
          status: true,
          startDate: true,
          expiryDate: true,
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
      },
    },
  });

  if (!customer) {
    const error = new Error('Customer not found');
    error.status = 404;
    throw error;
  }

  return customer;
}

async function updateCustomer(id, data) {
  const customerId = parseInt(id, 10);

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email.trim().toLowerCase();
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.company !== undefined) updateData.company = data.company;
  if (data.address !== undefined) updateData.address = data.address;

  const customer = await prisma.customer.update({
    where: { id: customerId },
    data: updateData,
  });

  return customer;
}

module.exports = {
  listCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
};
