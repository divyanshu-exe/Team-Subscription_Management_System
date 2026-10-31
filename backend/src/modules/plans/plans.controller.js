// OWNER: BE-1
// PURPOSE: HTTP handlers for subscription plans

const plansService = require('./plans.service');
const { ok } = require('../../utils/apiResponse');

async function listPlans(req, res, next) {
  try {
    const data = await plansService.listPlans(req.query);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function getPlanById(req, res, next) {
  try {
    const data = await plansService.getPlanById(req.params.id);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function createPlan(req, res, next) {
  try {
    const data = await plansService.createPlan(req.body);
    return ok(res, data, 'Plan created successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function updatePlan(req, res, next) {
  try {
    const data = await plansService.updatePlan(req.params.id, req.body);
    return ok(res, data, 'Plan updated successfully');
  } catch (err) {
    next(err);
  }
}

async function deletePlan(req, res, next) {
  try {
    const data = await plansService.deletePlan(req.params.id);
    return ok(res, data, 'Plan deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
};
