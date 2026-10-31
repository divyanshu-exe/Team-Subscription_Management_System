// OWNER: BE-1
// PURPOSE: Business logic for staff user administration (ADMIN only)

const prisma = require('../../config/db');
const { hashPassword } = require('../../utils/password');
const { parsePagination, paginated } = require('../../utils/pagination');

async function createStaff({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    const error = new Error('Email already registered');
    error.status = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(password);

  const staff = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash: hashedPassword,
      role: 'STAFF',
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return staff;
}

async function listStaff(query) {
  const { page, limit, skip, take } = parsePagination(query);

  const where = { role: 'STAFF' };

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    }),
  ]);

  return paginated(items, total, page, limit);
}

async function updateStaff(id, data) {
  const staffId = parseInt(id, 10);

  const updated = await prisma.user.update({
    where: { id: staffId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return updated;
}

module.exports = {
  createStaff,
  listStaff,
  updateStaff,
};
