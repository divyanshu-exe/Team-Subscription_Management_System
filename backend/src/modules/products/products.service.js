// OWNER: BE-1
// PURPOSE: Business logic for products, variants, and line price calculation

const prisma = require('../../config/db');
const { parsePagination, paginated } = require('../../utils/pagination');

/**
 * Calculates line price snapshot: salesPrice + variant.extraPrice
 * Exported for subscriptions module reuse.
 * @param {Object} product
 * @param {Object} [variant]
 * @returns {number}
 */
function calcLinePrice(product, variant) {
  const salesPrice = Number(product.salesPrice || 0);
  const extraPrice = variant ? Number(variant.extraPrice || 0) : 0;
  return Number((salesPrice + extraPrice).toFixed(2));
}

async function listProducts(query) {
  const { page, limit, skip, take } = parsePagination(query);

  const where = {
    isActive: true,
  };

  if (query.search) {
    where.name = { contains: query.search, mode: 'insensitive' };
  }

  if (query.type) {
    where.type = query.type;
  }

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      skip,
      take,
      include: {
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return paginated(items, total, page, limit);
}

async function getProductById(id) {
  const productId = parseInt(id, 10);
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      variants: true,
    },
  });

  if (!product || !product.isActive) {
    const error = new Error('Product not found');
    error.status = 404;
    throw error;
  }

  return product;
}

async function createProduct(data) {
  return await prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: data.name,
        type: data.type,
        salesPrice: data.salesPrice,
        costPrice: data.costPrice,
        notes: data.notes || null,
        variants: {
          create: (data.variants || []).map((v) => ({
            attribute: v.attribute,
            value: v.value,
            extraPrice: v.extraPrice || 0,
          })),
        },
      },
      include: {
        variants: true,
      },
    });

    return product;
  });
}

async function updateProduct(id, data) {
  const productId = parseInt(id, 10);

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.product.findUnique({
      where: { id: productId },
    });

    if (!existing || !existing.isActive) {
      const error = new Error('Product not found');
      error.status = 404;
      throw error;
    }

    if (data.variants !== undefined) {
      // Replace the full variant set
      await tx.variant.deleteMany({
        where: { productId },
      });
    }

    const updated = await tx.product.update({
      where: { id: productId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
        ...(data.salesPrice !== undefined && { salesPrice: data.salesPrice }),
        ...(data.costPrice !== undefined && { costPrice: data.costPrice }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.variants !== undefined && {
          variants: {
            create: data.variants.map((v) => ({
              attribute: v.attribute,
              value: v.value,
              extraPrice: v.extraPrice || 0,
            })),
          },
        }),
      },
      include: {
        variants: true,
      },
    });

    return updated;
  });
}

async function deleteProduct(id) {
  const productId = parseInt(id, 10);
  // Soft delete via isActive = false
  await prisma.product.update({
    where: { id: productId },
    data: { isActive: false },
  });

  return { success: true, message: 'Product deleted successfully' };
}

module.exports = {
  calcLinePrice,
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
