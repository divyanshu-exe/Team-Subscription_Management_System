// OWNER: BE-2
// PURPOSE: Generate printable invoice PDF (pdfkit: company header, customer, lines, tax, discount, total)

const PDFDocument = require('pdfkit');

/**
 * Streams generated PDF to an output writable stream (e.g., Express res)
 * @param {Object} invoice
 * @param {import('stream').Writable} stream
 */
function generateInvoicePdf(invoice, stream) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(stream);

  // Colors
  const primaryColor = '#2563EB';
  const textColor = '#1E293B';
  const lightGrey = '#94A3B8';

  // Company Header
  doc
    .fillColor(primaryColor)
    .fontSize(22)
    .font('Helvetica-Bold')
    .text('Brightloop Software', 50, 45)
    .fontSize(10)
    .font('Helvetica')
    .fillColor(lightGrey)
    .text('Subscription & Billing Services', 50, 72)
    .text('support@brightloop.test | www.brightloop.test', 50, 85);

  // Invoice Details Top Right
  doc
    .fillColor(textColor)
    .fontSize(18)
    .font('Helvetica-Bold')
    .text('INVOICE', 400, 45, { align: 'right' })
    .fontSize(10)
    .font('Helvetica')
    .text(`Invoice #: ${invoice.number}`, 400, 70, { align: 'right' })
    .text(`Issue Date: ${new Date(invoice.issueDate).toLocaleDateString()}`, 400, 85, { align: 'right' })
    .text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 400, 100, { align: 'right' })
    .text(`Status: ${invoice.status}`, 400, 115, { align: 'right' });

  doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(50, 135).lineTo(550, 135).stroke();

  // Billed To Info
  const customer = invoice.customer || {};
  doc
    .fontSize(11)
    .font('Helvetica-Bold')
    .fillColor(primaryColor)
    .text('BILLED TO:', 50, 150)
    .font('Helvetica-Bold')
    .fillColor(textColor)
    .fontSize(11)
    .text(customer.name || 'Valued Customer', 50, 168)
    .font('Helvetica')
    .fontSize(9)
    .fillColor(textColor)
    .text(customer.company || '', 50, 183)
    .text(customer.email || '', 50, 196)
    .text(customer.phone || '', 50, 209)
    .text(customer.address || '', 50, 222);

  // Subscription Reference
  if (invoice.subscription) {
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(primaryColor)
      .text('SUBSCRIPTION:', 350, 150)
      .font('Helvetica')
      .fillColor(textColor)
      .fontSize(9)
      .text(`Plan: ${invoice.subscription.plan ? invoice.subscription.plan.name : 'Custom'}`, 350, 168)
      .text(`Ref: ${invoice.subscription.number}`, 350, 183)
      .text(
        `Period: ${new Date(invoice.periodStart).toLocaleDateString()} - ${new Date(invoice.periodEnd).toLocaleDateString()}`,
        350,
        196
      );
  }

  // Items Table Header
  const tableTop = 250;
  doc
    .rect(50, tableTop, 500, 22)
    .fill('#F1F5F9');

  doc
    .fillColor('#334155')
    .fontSize(9)
    .font('Helvetica-Bold')
    .text('DESCRIPTION', 60, tableTop + 6)
    .text('QTY', 300, tableTop + 6, { width: 40, align: 'right' })
    .text('UNIT PRICE', 350, tableTop + 6, { width: 65, align: 'right' })
    .text('TAX', 420, tableTop + 6, { width: 45, align: 'right' })
    .text('AMOUNT', 475, tableTop + 6, { width: 65, align: 'right' });

  // Items Table Rows
  let y = tableTop + 28;
  const lines = invoice.lines || [];

  lines.forEach((line) => {
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(textColor)
      .text(line.description || 'Service', 60, y, { width: 230 })
      .text(String(line.quantity), 300, y, { width: 40, align: 'right' })
      .text(`$${Number(line.unitPrice).toFixed(2)}`, 350, y, { width: 65, align: 'right' })
      .text(`$${Number(line.taxAmount || 0).toFixed(2)}`, 420, y, { width: 45, align: 'right' })
      .text(`$${Number(line.amount).toFixed(2)}`, 475, y, { width: 65, align: 'right' });

    y += 20;
  });

  // Table Bottom Divider
  doc.strokeColor('#E2E8F0').lineWidth(1).moveTo(50, y + 5).lineTo(550, y + 5).stroke();
  y += 15;

  // Summary Box
  const summaryLeft = 350;
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(textColor)
    .text('Subtotal:', summaryLeft, y)
    .text(`$${Number(invoice.subtotal).toFixed(2)}`, 450, y, { width: 90, align: 'right' });
  y += 16;

  if (Number(invoice.discountTotal) > 0) {
    doc
      .fillColor('#16A34A')
      .text('Discount:', summaryLeft, y)
      .text(`-$${Number(invoice.discountTotal).toFixed(2)}`, 450, y, { width: 90, align: 'right' });
    y += 16;
  }

  doc
    .fillColor(textColor)
    .text('Tax:', summaryLeft, y)
    .text(`$${Number(invoice.taxTotal).toFixed(2)}`, 450, y, { width: 90, align: 'right' });
  y += 16;

  doc.strokeColor('#CBD5E1').lineWidth(1).moveTo(summaryLeft, y + 2).lineTo(550, y + 2).stroke();
  y += 8;

  doc
    .font('Helvetica-Bold')
    .fontSize(12)
    .fillColor(primaryColor)
    .text('Total Due:', summaryLeft, y)
    .text(`$${Number(invoice.total).toFixed(2)}`, 450, y, { width: 90, align: 'right' });
  y += 18;

  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor(textColor)
    .text('Amount Paid:', summaryLeft, y)
    .text(`$${Number(invoice.amountPaid).toFixed(2)}`, 450, y, { width: 90, align: 'right' });
  y += 16;

  const balance = Number(invoice.total) - Number(invoice.amountPaid);
  doc
    .font('Helvetica-Bold')
    .fontSize(10)
    .fillColor(balance > 0 ? '#DC2626' : '#16A34A')
    .text('Remaining Balance:', summaryLeft, y)
    .text(`$${balance.toFixed(2)}`, 450, y, { width: 90, align: 'right' });

  // Footer Note
  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor(lightGrey)
    .text('Thank you for your business. For any billing questions, contact support@brightloop.test.', 50, 750, {
      align: 'center',
      width: 500,
    });

  doc.end();
}

/**
 * Returns a Buffer of the generated PDF (for email attachments)
 * @param {Object} invoice
 * @returns {Promise<Buffer>}
 */
function generateInvoicePdfBuffer(invoice) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    generateInvoicePdf(invoice, doc);
  });
}

module.exports = {
  generateInvoicePdf,
  generateInvoicePdfBuffer,
};
