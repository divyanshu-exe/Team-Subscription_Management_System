// OWNER: BE-1
// PURPOSE: HTTP handlers for customer management routes

const customersService = require('./customers.service');
const { ok } = require('../../utils/apiResponse');

async function listCustomers(req, res, next) {
  try {
    const data = await customersService.listCustomers(req.query);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function createCustomer(req, res, next) {
  try {
    const data = await customersService.createCustomer(req.body);
    return ok(res, data, 'Customer created successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function getCustomerById(req, res, next) {
  try {
    const data = await customersService.getCustomerById(req.params.id);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function updateCustomer(req, res, next) {
  try {
    const data = await customersService.updateCustomer(req.params.id, req.body);
    return ok(res, data, 'Customer updated successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
};
