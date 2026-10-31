// OWNER: BE-1
// PURPOSE: Express router: tax rule endpoints

const express = require('express');
const router = express.Router();

const taxesController = require('./taxes.controller');
const { createTaxSchema, updateTaxSchema } = require('./taxes.schema');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');

router.use(authMiddleware);

// Staff and Admin can read
router.get('/', requireRole('ADMIN', 'STAFF'), taxesController.listTaxes);
router.get('/:id', requireRole('ADMIN', 'STAFF'), taxesController.getTaxById);

// Admin only writes
router.post('/', requireRole('ADMIN'), validate(createTaxSchema), taxesController.createTax);
router.put('/:id', requireRole('ADMIN'), validate(updateTaxSchema), taxesController.updateTax);
router.delete('/:id', requireRole('ADMIN'), taxesController.deleteTax);

module.exports = router;
