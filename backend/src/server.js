// OWNER: BE-1
// PURPOSE: Start HTTP server and register cron job

const app = require('./app');
const env = require('./config/env');

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend server running on http://localhost:${PORT}`);

  try {
    const billingCron = require('./jobs/billing.cron');
    if (billingCron && typeof billingCron.start === 'function') {
      billingCron.start();
      // eslint-disable-next-line no-console
      console.log('Billing cron job started');
    }
  } catch (err) {
    // Cron job not ready or failed to start
  }
});

module.exports = server;
