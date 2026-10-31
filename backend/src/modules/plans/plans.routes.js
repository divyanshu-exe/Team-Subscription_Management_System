// OWNER: BE-1
// PURPOSE: Express router: plan endpoints

const express = require('express');
const router = express.Router();

const plansController = require('./plans.controller');
const { createPlanSchema, updatePlanSchema } = require('./plans.schema');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');

router.use(authMiddleware);

// Staff and Admin can read
router.get('/', requireRole('ADMIN', 'STAFF'), plansController.listPlans);
router.get('/:id', requireRole('ADMIN', 'STAFF'), plansController.getPlanById);

// Admin only writes
router.post('/', requireRole('ADMIN'), validate(createPlanSchema), plansController.createPlan);
router.put('/:id', requireRole('ADMIN'), validate(updatePlanSchema), plansController.updatePlan);
router.delete('/:id', requireRole('ADMIN'), plansController.deletePlan);

module.exports = router;
