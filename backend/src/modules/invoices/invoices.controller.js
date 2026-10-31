// OWNER: BE-2
// PURPOSE: Request handlers for invoices (list, detail, confirm, cancel, send, print)

const invoicesService = require('./invoices.service');
const { generateInvoicePdf } = require('./invoice.pdf');
const { ok } = require('../../utils/apiResponse');

async function listInvoices(req, res, next) {
  try {
    const result = await invoicesService.listInvoices(req.query);
    return ok(res, result);
  } catch (err) {
    next(err);
  }
}

async function getInvoiceById(req, res, next) {
  try {
    const invoice = await invoicesService.getInvoiceById(req.params.id);
    return ok(res, invoice);
  } catch (err) {
    next(err);
  }
}

async function confirmInvoice(req, res, next) {
  try {
    const userId = req.user.id;
    const invoice = await invoicesService.confirmInvoice(req.params.id, userId);
    return ok(res, invoice, 'Invoice confirmed successfully');
  } catch (err) {
    next(err);
  }
}

async function cancelInvoice(req, res, next) {
  try {
    const userId = req.user.id;
    const invoice = await invoicesService.cancelInvoice(req.params.id, userId);
    return ok(res, invoice, 'Invoice cancelled successfully');
  } catch (err) {
    next(err);
  }
}

async function sendInvoice(req, res, next) {
  try {
    const result = await invoicesService.sendInvoice(req.params.id);
    return ok(res, result, 'Invoice email sent successfully');
  } catch (err) {
    next(err);
  }
}

async function printInvoice(req, res, next) {
  try {
    const invoice = await invoicesService.getInvoiceById(req.params.id);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${invoice.number}.pdf"`);
    generateInvoicePdf(invoice, res);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listInvoices,
  getInvoiceById,
  confirmInvoice,
  cancelInvoice,
  sendInvoice,
  printInvoice,
};
