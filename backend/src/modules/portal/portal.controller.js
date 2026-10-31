// OWNER: BE-2
// PURPOSE: Request handlers for customer portal

const portalService = require('./portal.service');
const { generateInvoicePdf } = require('../invoices/invoice.pdf');
const { ok } = require('../../utils/apiResponse');

function getCustomerId(req) {
  const customerId = req.user && req.user.customerId;
  if (!customerId) {
    const error = new Error('No customer account linked to current user');
    error.status = 403;
    throw error;
  }
  return customerId;
}

async function listSubscriptions(req, res, next) {
  try {
    const customerId = getCustomerId(req);
    const result = await portalService.listPortalSubscriptions(customerId, req.query);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

async function getSubscriptionById(req, res, next) {
  try {
    const customerId = getCustomerId(req);
    const sub = await portalService.getPortalSubscriptionById(req.params.id, customerId);
    return ok(res, sub);
  } catch (err) {
    next(err);
  }
}

async function listInvoices(req, res, next) {
  try {
    const customerId = getCustomerId(req);
    const result = await portalService.listPortalInvoices(customerId, req.query);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

async function getInvoiceById(req, res, next) {
  try {
    const customerId = getCustomerId(req);
    const invoice = await portalService.getPortalInvoiceById(req.params.id, customerId);
    return ok(res, invoice);
  } catch (err) {
    next(err);
  }
}

async function printInvoice(req, res, next) {
  try {
    const customerId = getCustomerId(req);
    const invoice = await portalService.getPortalInvoiceById(req.params.id, customerId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${invoice.number}.pdf"`);
    generateInvoicePdf(invoice, res);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listSubscriptions,
  getSubscriptionById,
  listInvoices,
  getInvoiceById,
  printInvoice,
};
