// OWNER: BE-2
// PURPOSE: Request handlers for payments (list, record)

const paymentsService = require('./payments.service');
const { ok, created } = require('../../utils/apiResponse');

async function listPayments(req, res, next) {
  try {
    const result = await paymentsService.listPayments(req.query);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

async function recordPayment(req, res, next) {
  try {
    const userId = req.user.id;
    const payment = await paymentsService.recordPayment(req.body, userId);
    return created(res, payment, 'Payment recorded successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listPayments,
  recordPayment,
};
