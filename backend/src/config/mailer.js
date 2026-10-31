// OWNER: BE-1
// PURPOSE: Email delivery service with console fallback

const nodemailer = require('nodemailer');
const env = require('./env');

let transporter = null;

if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });
}

/**
 * Sends an email using SMTP or logs to console if unconfigured
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 * @param {Array} [options.attachments]
 */
async function sendMail({ to, subject, html, attachments = [] }) {
  if (transporter) {
    return await transporter.sendMail({
      from: env.MAIL_FROM,
      to,
      subject,
      html,
      attachments,
    });
  }

  // Fallback for development without active SMTP
  // Note: structured log for dev debugging
  process.stdout.write(
    `\n=== [MAIL SERVICE (DEV FALLBACK)] ===\nTo: ${to}\nSubject: ${subject}\nAttachments: ${attachments.length}\n${html}\n=====================================\n\n`
  );
  return { messageId: `dev-mock-${Date.now()}` };
}

module.exports = {
  sendMail,
};