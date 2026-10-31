// OWNER: BE-2
// PURPOSE: [Billing run endpoint and engine] Request handlers: read req, call service, return apiResponse

const billingService = require('./billing.service');
const { ok } = require('../../utils/apiResponse');

async function runBilling(req, res, next) {
  try {
    const { asOfDate } = req.body || {};
    const userId = req.user ? req.user.id : null;
    const result = await billingService.runBilling(asOfDate, userId);
    return ok(res, result, 'Billing run completed successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  runBilling,
};
