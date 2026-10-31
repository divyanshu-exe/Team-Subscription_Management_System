// OWNER: BE-2
// PURPOSE: HTTP handlers for quotation templates

const quotationTemplatesService = require('./quotation-templates.service');
const { ok } = require('../../utils/apiResponse');

async function listQuotationTemplates(req, res, next) {
  try {
    const data = await quotationTemplatesService.listQuotationTemplates();
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function getQuotationTemplateById(req, res, next) {
  try {
    const data = await quotationTemplatesService.getQuotationTemplateById(req.params.id);
    return ok(res, data);
  } catch (err) {
    next(err);
  }
}

async function createQuotationTemplate(req, res, next) {
  try {
    const data = await quotationTemplatesService.createQuotationTemplate(req.body);
    return ok(res, data, 'Quotation template created successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function updateQuotationTemplate(req, res, next) {
  try {
    const data = await quotationTemplatesService.updateQuotationTemplate(req.params.id, req.body);
    return ok(res, data, 'Quotation template updated successfully');
  } catch (err) {
    next(err);
  }
}

async function deleteQuotationTemplate(req, res, next) {
  try {
    const data = await quotationTemplatesService.deleteQuotationTemplate(req.params.id);
    return ok(res, data, 'Quotation template deleted successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listQuotationTemplates,
  getQuotationTemplateById,
  createQuotationTemplate,
  updateQuotationTemplate,
  deleteQuotationTemplate,
};
