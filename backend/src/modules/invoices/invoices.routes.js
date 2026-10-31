// OWNER: BE-2
// PURPOSE: Express router for invoices: list, detail, confirm, cancel, send, print

const express = require('express');
const router = express.Router();
const invoicesController = require('./invoices.controller');
const { listInvoicesQuerySchema } = require('./invoices.schema');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');

// All invoice management routes require ADMIN or STAFF
router.use(authMiddleware, requireRole('ADMIN', 'STAFF'));

router.get('/', validate(listInvoicesQuerySchema, 'query'), invoicesController.listInvoices);
router.get('/:id', invoicesController.getInvoiceById);
router.post('/:id/confirm', invoicesController.confirmInvoice);
router.post('/:id/cancel', invoicesController.cancelInvoice);
router.post('/:id/send', invoicesController.sendInvoice);
router.get('/:id/print', invoicesController.printInvoice);

module.exports = router;
