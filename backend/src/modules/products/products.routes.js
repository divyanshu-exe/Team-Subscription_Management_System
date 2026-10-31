// OWNER: BE-1
// PURPOSE: Express router: product & variant endpoints

const express = require('express');
const router = express.Router();

const productsController = require('./products.controller');
const { createProductSchema, updateProductSchema } = require('./products.schema');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');

router.use(authMiddleware);

// Staff and Admin can read
router.get('/', requireRole('ADMIN', 'STAFF'), productsController.listProducts);
router.get('/:id', requireRole('ADMIN', 'STAFF'), productsController.getProductById);

// Admin only writes
router.post('/', requireRole('ADMIN'), validate(createProductSchema), productsController.createProduct);
router.put('/:id', requireRole('ADMIN'), validate(updateProductSchema), productsController.updateProduct);
router.delete('/:id', requireRole('ADMIN'), productsController.deleteProduct);

module.exports = router;
