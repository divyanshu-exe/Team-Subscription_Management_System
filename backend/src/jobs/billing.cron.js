// OWNER: BE-2
// PURPOSE: node-cron daily job that calls billing.service.runBilling() and closeExpiredSubscriptions()

const cron = require('node-cron');
const env = require('../config/env');
const { runBilling } = require('../modules/billing/billing.service');
const { closeExpiredSubscriptions } = require('../modules/subscriptions/subscriptions.service');

let cronTask = null;

function start() {
  const schedule = env.BILLING_CRON || '0 1 * * *';

  cronTask = cron.schedule(schedule, async () => {
    // eslint-disable-next-line no-console
    console.log(`[BillingCron] Running scheduled billing and subscription auto-close at ${new Date().toISOString()}`);
    try {
      const today = new Date();
      const billingResult = await runBilling(today, null);
      // eslint-disable-next-line no-console
      console.log('[BillingCron] Billing run result:', billingResult);

      const closeResult = await closeExpiredSubscriptions(today);
      // eslint-disable-next-line no-console
      console.log('[BillingCron] Auto-close result:', closeResult);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[BillingCron] Error executing scheduled billing:', err);
    }
  });

  return cronTask;
}

function stop() {
  if (cronTask) {
    cronTask.stop();
  }
}

module.exports = {
  start,
  stop,
};
