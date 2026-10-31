// OWNER: BE-2
// PURPOSE: Express router for payments: list, record

const express = require('express');
const router = express.Router();
const paymentsController = require('./payments.controller');
const { createPaymentSchema, listPaymentsQuerySchema } = require('./payments.schema');
const authMiddleware = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');

router.use(authMiddleware, requireRole('ADMIN', 'STAFF'));

router.get('/', validate(listPaymentsQuerySchema, 'query'), paymentsController.listPayments);
router.post('/', validate(createPaymentSchema), paymentsController.recordPayment);

module.exports = router;
