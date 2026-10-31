// OWNER: BE-1
// PURPOSE: Express router: staff endpoints (ADMIN only)

const express = require('express');
const router = express.Router();

const usersController = require('./users.controller');
const { createStaffSchema, updateStaffSchema } = require('./users.schema');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');

// All staff endpoints are strictly ADMIN only
router.use(authMiddleware);
router.use(requireRole('ADMIN'));

router.post('/staff', validate(createStaffSchema), usersController.createStaff);
router.get('/staff', usersController.listStaff);
router.patch('/staff/:id', validate(updateStaffSchema), usersController.updateStaff);

module.exports = router;
