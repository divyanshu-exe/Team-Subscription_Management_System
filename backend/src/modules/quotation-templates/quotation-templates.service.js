// OWNER: BE-2
// PURPOSE: Business logic for quotation templates with nested lines and plan minimum validation

const prisma = require('../../config/db');

async function listQuotationTemplates() {
  return await prisma.quotationTemplate.findMany({
    include: {
      plan: {
        select: { id: true, name: true, period: true, price: true, minQuantity: true },
      },
      lines: {
        include: {
          product: { select: { id: true, name: true, salesPrice: true } },
          variant: { select: { id: true, attribute: true, value: true, extraPrice: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getQuotationTemplateById(id) {
  const templateId = parseInt(id, 10);
  const template = await prisma.quotationTemplate.findUnique({
    where: { id: templateId },
    include: {
      plan: {
        select: { id: true, name: true, period: true, price: true, minQuantity: true },
      },
      lines: {
        include: {
          product: { select: { id: true, name: true, salesPrice: true } },
          variant: { select: { id: true, attribute: true, value: true, extraPrice: true } },
        },
      },
    },
  });

  if (!template) {
    const error = new Error('Quotation template not found');
    error.status = 404;
    throw error;
  }

  return template;
}

async function createQuotationTemplate(data) {
  return await prisma.$transaction(async (tx) => {
    const plan = await tx.plan.findUnique({
      where: { id: data.planId },
    });

    if (!plan || !plan.isActive) {
      const error = new Error('Selected plan does not exist or is inactive');
      error.status = 400;
      throw error;
    }

    // Validate lines and minimum quantity
    for (const line of data.lines) {
      if (line.quantity < plan.minQuantity) {
        const error = new Error(
          `Line quantity (${line.quantity}) is less than plan minimum quantity (${plan.minQuantity})`
        );
        error.status = 400;
        throw error;
      }

      const product = await tx.product.findUnique({
        where: { id: line.productId },
      });
      if (!product || !product.isActive) {
        const error = new Error(`Product with ID ${line.productId} not found or inactive`);
        error.status = 400;
        throw error;
      }

      if (line.variantId) {
        const variant = await tx.variant.findUnique({
          where: { id: line.variantId },
        });
        if (!variant || variant.productId !== line.productId) {
          const error = new Error(`Variant ${line.variantId} does not belong to product ${line.productId}`);
          error.status = 400;
          throw error;
        }
      }
    }

    const template = await tx.quotationTemplate.create({
      data: {
        name: data.name,
        planId: data.planId,
        validityDays: data.validityDays,
        lines: {
          create: data.lines.map((l) => ({
            productId: l.productId,
            variantId: l.variantId || null,
            quantity: l.quantity,
          })),
        },
      },
      include: {
        plan: {
          select: { id: true, name: true, period: true, price: true, minQuantity: true },
        },
        lines: {
          include: {
            product: { select: { id: true, name: true, salesPrice: true } },
            variant: { select: { id: true, attribute: true, value: true, extraPrice: true } },
          },
        },
      },
    });

    return template;
  });
}

async function updateQuotationTemplate(id, data) {
  const templateId = parseInt(id, 10);

  return await prisma.$transaction(async (tx) => {
    const existing = await tx.quotationTemplate.findUnique({
      where: { id: templateId },
      include: { plan: true },
    });

    if (!existing) {
      const error = new Error('Quotation template not found');
      error.status = 404;
      throw error;
    }

    const planId = data.planId || existing.planId;
    const plan = await tx.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      const error = new Error('Plan not found or inactive');
      error.status = 400;
      throw error;
    }

    if (data.lines) {
      for (const line of data.lines) {
        if (line.quantity < plan.minQuantity) {
          const error = new Error(
            `Line quantity (${line.quantity}) is less than plan minimum quantity (${plan.minQuantity})`
          );
          error.status = 400;
          throw error;
        }

        const product = await tx.product.findUnique({ where: { id: line.productId } });
        if (!product || !product.isActive) {
          const error = new Error(`Product ${line.productId} not found`);
          error.status = 400;
          throw error;
        }
      }

      await tx.quotationTemplateLine.deleteMany({
        where: { templateId },
      });
    }

    const updated = await tx.quotationTemplate.update({
      where: { id: templateId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.planId !== undefined && { planId: data.planId }),
        ...(data.validityDays !== undefined && { validityDays: data.validityDays }),
        ...(data.lines && {
          lines: {
            create: data.lines.map((l) => ({
              productId: l.productId,
              variantId: l.variantId || null,
              quantity: l.quantity,
            })),
          },
        }),
      },
      include: {
        plan: { select: { id: true, name: true, period: true, price: true, minQuantity: true } },
        lines: {
          include: {
            product: { select: { id: true, name: true, salesPrice: true } },
            variant: { select: { id: true, attribute: true, value: true, extraPrice: true } },
          },
        },
      },
    });

    return updated;
  });
}

async function deleteQuotationTemplate(id) {
  const templateId = parseInt(id, 10);
  await prisma.quotationTemplate.delete({
    where: { id: templateId },
  });
  return { success: true, message: 'Quotation template deleted successfully' };
}

module.exports = {
  listQuotationTemplates,
  getQuotationTemplateById,
  createQuotationTemplate,
  updateQuotationTemplate,
  deleteQuotationTemplate,
};
