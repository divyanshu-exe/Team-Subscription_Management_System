// OWNER: BE-2
// PURPOSE: Express router for dashboard: summary, overdue, subscriptions-by-status

const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');
const {
  dashboardSummaryQuerySchema,
  dashboardOverdueQuerySchema,
} = require('./dashboard.schema');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');

router.use(authMiddleware, requireRole('ADMIN', 'STAFF'));

router.get('/summary', validate(dashboardSummaryQuerySchema, 'query'), dashboardController.getSummary);
router.get('/overdue', validate(dashboardOverdueQuerySchema, 'query'), dashboardController.getOverdueInvoices);
router.get('/subscriptions-by-status', dashboardController.getSubscriptionsByStatus);

module.exports = router;
