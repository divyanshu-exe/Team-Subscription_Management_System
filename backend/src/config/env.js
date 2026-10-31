// OWNER: BE-1
// PURPOSE: Central configuration validator and environment constants

const dotenv = require('dotenv');
dotenv.config();

const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

module.exports = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  RESET_TOKEN_EXPIRES_MIN: process.env.RESET_TOKEN_EXPIRES_MIN ? parseInt(process.env.RESET_TOKEN_EXPIRES_MIN, 10) : 30,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  MAIL_FROM: process.env.MAIL_FROM || 'Brightloop <no-reply@brightloop.test>',
  BILLING_CRON: process.env.BILLING_CRON || '0 1 * * *',
};
