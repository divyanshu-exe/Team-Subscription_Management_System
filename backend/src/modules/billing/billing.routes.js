// OWNER: BE-2
// PURPOSE: [Billing run endpoint and engine] Express router: declare endpoints, attach auth/role/validate middleware

const express = require('express');
const router = express.Router();
const billingController = require('./billing.controller');
const { runBillingSchema } = require('./billing.schema');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');

router.post(
  '/run',
  authMiddleware,
  requireRole('ADMIN'),
  validate(runBillingSchema),
  billingController.runBilling
);

module.exports = router;
