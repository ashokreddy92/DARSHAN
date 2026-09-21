/**
 * DarshanEase — Worker Orchestrator
 * Bootstraps all asynchronous queue consumers
 */

const { startEmailWorker } = require('./emailWorker');
const { startPaymentWorker } = require('./paymentWorker');
const { startBookingWorker } = require('./bookingWorker');
const { startNotificationWorker } = require('./notificationWorker');
const { startAnalyticsWorker } = require('./analyticsWorker');

async function initWorkers() {
  try {
    await startEmailWorker();
    await startPaymentWorker();
    await startBookingWorker();
    await startNotificationWorker();
    await startAnalyticsWorker();
    console.log('[Workers] All background message consumers actively listening.');
  } catch (err) {
    console.error('[Workers] Error initializing workers:', err.message);
  }
}

module.exports = { initWorkers };
