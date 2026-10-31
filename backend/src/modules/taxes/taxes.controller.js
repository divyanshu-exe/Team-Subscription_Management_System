// OWNER: BE-1
// PURPOSE: HTTP handlers for tax rules

const taxesService = require('./taxes.service');
const { ok } = require('../../utils/apiResponse');

async function listTaxes(req, res, next) {
  try {
    const data = await taxesService.listTaxes();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function getTaxById(req, res, next) {
  try {
    const data = await taxesService.getTaxById(req.params.id);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function createTax(req, res, next) {
  try {
    const data = await taxesService.createTax(req.body);
    return ok(res, data, 'Tax rule created successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function updateTax(req, res, next) {
  try {
    const data = await taxesService.updateTax(req.params.id, req.body);
    return ok(res, data, 'Tax rule updated successfully');
  } catch (err) {
    next(err);
  }
}

async function deleteTax(req, res, next) {
  try {
    const data = await taxesService.deleteTax(req.params.id);
    return ok(res, data, 'Tax rule deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listTaxes,
  getTaxById,
  createTax,
  updateTax,
  deleteTax,
};
