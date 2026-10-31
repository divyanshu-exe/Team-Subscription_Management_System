// OWNER: BE-2
// PURPOSE: Express router: subscription management endpoints (ADMIN and STAFF)

const express = require('express');
const router = express.Router();

const subscriptionsController = require('./subscriptions.controller');
const {
  createSubscriptionSchema,
  updateSubscriptionSchema,
  transitionSubscriptionSchema,
} = require('./subscriptions.schema');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');

router.use(authMiddleware);
router.use(requireRole('ADMIN', 'STAFF'));

router.get('/', subscriptionsController.listSubscriptions);
router.get('/:id', subscriptionsController.getSubscriptionById);
router.post('/', validate(createSubscriptionSchema), subscriptionsController.createSubscription);
router.put('/:id', validate(updateSubscriptionSchema), subscriptionsController.updateSubscription);
router.post('/:id/transition', validate(transitionSubscriptionSchema), subscriptionsController.transitionSubscription);
router.post('/:id/pause', subscriptionsController.pauseSubscription);
router.post('/:id/resume', subscriptionsController.resumeSubscription);
router.post('/:id/renew', subscriptionsController.renewSubscription);
router.post('/:id/close', subscriptionsController.closeSubscription);

module.exports = router;
