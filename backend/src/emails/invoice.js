// OWNER: BE-2
// PURPOSE: Invoice email template and generator

/**
 * Creates email HTML for an invoice notification
 * @param {Object} params
 * @param {Object} params.invoice
 * @param {Object} params.customer
 * @returns {{ subject: string, html: string }}
 */
function invoiceEmail({ invoice, customer }) {
  const customerName = customer ? customer.name : 'Valued Customer';
  const balance = Number(invoice.total) - Number(invoice.amountPaid);

  return {
    subject: `Brightloop Invoice ${invoice.number} - $${Number(invoice.total).toFixed(2)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 24px;">Brightloop Software</h1>
        </div>
        <p>Dear ${customerName},</p>
        <p>Please find attached your invoice <strong>${invoice.number}</strong> for the amount of <strong>$${Number(invoice.total).toFixed(2)}</strong>.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Invoice Number</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${invoice.number}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Issue Date</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${new Date(invoice.issueDate).toLocaleDateString()}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Due Date</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">${new Date(invoice.dueDate).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Total Amount</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">$${Number(invoice.total).toFixed(2)}</td>
          </tr>
          <tr style="background-color: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Remaining Balance</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: ${balance > 0 ? '#dc2626' : '#16a34a'};">$${balance.toFixed(2)}</td>
          </tr>
        </table>

        <p>A PDF copy of this invoice has been attached to this email for your records.</p>
        <p>If you have any questions, feel free to reply to this email or reach out to our billing team.</p>
        <br/>
        <p style="color: #64748b; font-size: 12px;">Brightloop Software Inc. &bull; All rights reserved</p>
      </div>
    `,
  };
}

module.exports = {
  invoiceEmail,
};
