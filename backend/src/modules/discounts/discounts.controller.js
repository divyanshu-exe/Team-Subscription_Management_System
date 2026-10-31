// OWNER: BE-1
// PURPOSE: HTTP handlers for discounts module (ADMIN only)

const discountsService = require('./discounts.service');
const { ok } = require('../../utils/apiResponse');

async function listDiscounts(req, res, next) {
  try {
    const data = await discountsService.listDiscounts();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function getDiscountById(req, res, next) {
  try {
    const data = await discountsService.getDiscountById(req.params.id);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function createDiscount(req, res, next) {
  try {
    const data = await discountsService.createDiscount(req.body);
    return ok(res, data, 'Discount created successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function updateDiscount(req, res, next) {
  try {
    const data = await discountsService.updateDiscount(req.params.id, req.body);
    return ok(res, data, 'Discount updated successfully');
  } catch (err) {
    next(err);
  }
}

async function deleteDiscount(req, res, next) {
  try {
    const data = await discountsService.deleteDiscount(req.params.id);
    return ok(res, data, 'Discount deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listDiscounts,
  getDiscountById,
  createDiscount,
  updateDiscount,
  deleteDiscount,
};
