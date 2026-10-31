// OWNER: BE-1
// PURPOSE: Express router: customer endpoints (ADMIN and STAFF)

const express = require('express');
const router = express.Router();

const customersController = require('./customers.controller');
const {
  createCustomerSchema,
  updateCustomerSchema,
} = require('./customers.schema');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');

// Customers are accessible to ADMIN and STAFF
router.use(authMiddleware);
router.use(requireRole('ADMIN', 'STAFF'));

router.get('/', customersController.listCustomers);
router.post('/', validate(createCustomerSchema), customersController.createCustomer);
router.get('/:id', customersController.getCustomerById);
router.patch('/:id', validate(updateCustomerSchema), customersController.updateCustomer);

module.exports = router;
