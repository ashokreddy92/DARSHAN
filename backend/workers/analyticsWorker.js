/**
 * DarshanEase — Analytics Worker
 * Consumes: darshanease.analytics
 */

const { getConsumerChannel, TOPOLOGY } = require('../config/rabbitmq');
const { processMessage } = require('./workerUtils');

async function handleAnalyticsJob(data) {
  // Aggregate real-time analytical event
  // (Can increment Redis counters or metrics)
}

async function startAnalyticsWorker() {
  const channel = getConsumerChannel();
  if (!channel) return;

  console.log('[AnalyticsWorker] Starting consumer on', TOPOLOGY.queues.analytics);
  await channel.consume(
    TOPOLOGY.queues.analytics,
    (msg) => processMessage(msg, handleAnalyticsJob, TOPOLOGY.queues.analytics),
    { noAck: false }
  );
}

module.exports = { startAnalyticsWorker };
