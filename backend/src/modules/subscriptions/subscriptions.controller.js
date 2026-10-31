// OWNER: BE-2
// PURPOSE: HTTP handlers for subscription endpoints

const subscriptionsService = require('./subscriptions.service');
const { ok } = require('../../utils/apiResponse');

async function listSubscriptions(req, res, next) {
  try {
    const data = await subscriptionsService.listSubscriptions(req.query);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function getSubscriptionById(req, res, next) {
  try {
    const data = await subscriptionsService.getSubscriptionById(req.params.id);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function createSubscription(req, res, next) {
  try {
    const data = await subscriptionsService.createSubscription(req.body, req.user.id);
    return ok(res, data, 'Subscription created successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function updateSubscription(req, res, next) {
  try {
    const data = await subscriptionsService.updateSubscription(req.params.id, req.body, req.user.id);
    return ok(res, data, 'Subscription updated successfully');
  } catch (err) {
    next(err);
  }
}

async function transitionSubscription(req, res, next) {
  try {
    const data = await subscriptionsService.transitionSubscription(
      req.params.id,
      req.body.to,
      req.user.id
    );
    return ok(res, data, `Subscription transitioned to ${req.body.to}`);
  } catch (err) {
    next(err);
  }
}

async function pauseSubscription(req, res, next) {
  try {
    const data = await subscriptionsService.pauseSubscription(req.params.id, req.user.id);
    return ok(res, data, 'Subscription paused');
  } catch (err) {
    next(err);
  }
}

async function resumeSubscription(req, res, next) {
  try {
    const data = await subscriptionsService.resumeSubscription(req.params.id, req.user.id);
    return ok(res, data, 'Subscription resumed');
  } catch (err) {
    next(err);
  }
}

async function renewSubscription(req, res, next) {
  try {
    const data = await subscriptionsService.renewSubscription(req.params.id, req.user.id);
    return ok(res, data, 'Subscription renewed successfully');
  } catch (err) {
    next(err);
  }
}

async function closeSubscription(req, res, next) {
  try {
    const data = await subscriptionsService.closeSubscription(req.params.id, req.user.id);
    return ok(res, data, 'Subscription closed successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  transitionSubscription,
  pauseSubscription,
  resumeSubscription,
  renewSubscription,
  closeSubscription,
};
