// OWNER: BE-2
// PURPOSE: Express router for customer portal endpoints

const express = require('express');
const router = express.Router();
const portalController = require('./portal.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

// All portal routes require CUSTOMER role and use req.user.customerId
router.use(authMiddleware, requireRole('CUSTOMER'));

router.get('/subscriptions', portalController.listSubscriptions);
router.get('/subscriptions/:id', portalController.getSubscriptionById);
router.get('/invoices', portalController.listInvoices);
router.get('/invoices/:id', portalController.getInvoiceById);
router.get('/invoices/:id/print', portalController.printInvoice);

module.exports = router;
