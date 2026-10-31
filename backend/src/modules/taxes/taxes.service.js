// OWNER: BE-1
// PURPOSE: Business logic for tax rules management

const prisma = require('../../config/db');

async function listTaxes() {
  return await prisma.tax.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  });
}

async function getTaxById(id) {
  const taxId = parseInt(id, 10);
  const tax = await prisma.tax.findUnique({
    where: { id: taxId },
  });

  if (!tax || !tax.isActive) {
    const error = new Error('Tax rule not found');
    error.status = 404;
    throw error;
  }

  return tax;
}

async function createTax(data) {
  return await prisma.tax.create({
    data: {
      name: data.name,
      type: data.type,
      value: data.value,
      isActive: data.isActive !== undefined ? data.isActive : true,
    },
  });
}

async function updateTax(id, data) {
  const taxId = parseInt(id, 10);

  const existing = await prisma.tax.findUnique({
    where: { id: taxId },
  });

  if (!existing || !existing.isActive) {
    const error = new Error('Tax rule not found');
    error.status = 404;
    throw error;
  }

  return await prisma.tax.update({
    where: { id: taxId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.value !== undefined && { value: data.value }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

async function deleteTax(id) {
  const taxId = parseInt(id, 10);
  // Soft delete
  await prisma.tax.update({
    where: { id: taxId },
    data: { isActive: false },
  });

  return { success: true, message: 'Tax rule deleted successfully' };
}

module.exports = {
  listTaxes,
  getTaxById,
  createTax,
  updateTax,
  deleteTax,
};
