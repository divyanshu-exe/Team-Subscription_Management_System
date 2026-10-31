// OWNER: BE-2
// PURPOSE: Express router: quotation template endpoints (ADMIN and STAFF)

const express = require('express');
const router = express.Router();

const quotationTemplatesController = require('./quotation-templates.controller');
const {
  createQuotationTemplateSchema,
  updateQuotationTemplateSchema,
} = require('./quotation-templates.schema');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');

router.use(authMiddleware);
router.use(requireRole('ADMIN', 'STAFF'));

router.get('/', quotationTemplatesController.listQuotationTemplates);
router.get('/:id', quotationTemplatesController.getQuotationTemplateById);
router.post('/', validate(createQuotationTemplateSchema), quotationTemplatesController.createQuotationTemplate);
router.put('/:id', validate(updateQuotationTemplateSchema), quotationTemplatesController.updateQuotationTemplate);
router.delete('/:id', quotationTemplatesController.deleteQuotationTemplate);

module.exports = router;
