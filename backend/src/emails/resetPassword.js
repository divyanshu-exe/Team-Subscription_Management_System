// OWNER: BE-1
// PURPOSE: Email template for password reset link

const env = require('../config/env');

/**
 * Generates email content for password reset
 * @param {Object} params
 * @param {string} params.name
 * @param {string} params.token - raw reset token
 * @returns {{ subject: string, html: string }}
 */
function resetPasswordEmail({ name, token }) {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

  return {
    subject: 'Password Reset Request - Brightloop',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">Reset Your Password</h2>
        <p>Hello ${name || 'there'},</p>
        <p>We received a request to reset your password for your Brightloop account. Click the button below to choose a new password:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>This link is single-use and will expire in ${env.RESET_TOKEN_EXPIRES_MIN} minutes.</p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="font-size: 12px; color: #64748b;">If the button above does not work, copy and paste this URL into your browser:<br/>${resetUrl}</p>
      </div>
    `,
  };
}

module.exports = {
  resetPasswordEmail,
};
