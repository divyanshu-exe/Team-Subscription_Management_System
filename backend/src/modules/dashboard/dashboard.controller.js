// OWNER: BE-2
// PURPOSE: Request handlers for the dashboard endpoints

const dashboardService = require('./dashboard.service');
const { ok } = require('../../utils/apiResponse');

async function getSummary(req, res, next) {
  try {
    const summary = await dashboardService.getSummary(req.query);
    return ok(res, summary);
  } catch (err) {
    next(err);
  }
}

async function getOverdueInvoices(req, res, next) {
  try {
    const result = await dashboardService.getOverdueInvoices(req.query);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

async function getSubscriptionsByStatus(req, res, next) {
  try {
    const counts = await dashboardService.getSubscriptionsByStatus();
    return ok(res, counts);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSummary,
  getOverdueInvoices,
  getSubscriptionsByStatus,
};
