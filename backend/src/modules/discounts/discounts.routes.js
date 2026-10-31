// OWNER: BE-1
// PURPOSE: Express router: discount endpoints (ADMIN only)

const express = require('express');
const router = express.Router();

const discountsController = require('./discounts.controller');
const { createDiscountSchema, updateDiscountSchema } = require('./discounts.schema');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');

// All discount routes are strictly ADMIN only
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

router.get('/', discountsController.listDiscounts);
router.get('/:id', discountsController.getDiscountById);
router.post('/', validate(createDiscountSchema), discountsController.createDiscount);
router.put('/:id', validate(updateDiscountSchema), discountsController.updateDiscount);
router.delete('/:id', discountsController.deleteDiscount);

module.exports = router;
