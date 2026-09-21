/**
 * DarshanEase — Notification Worker
 * Consumes: darshanease.notification
 */

const { getConsumerChannel, TOPOLOGY } = require('../config/rabbitmq');
const { processMessage } = require('./workerUtils');
const { broadcastEvent } = require('../socket/socketService');

async function handleNotificationJob(data) {
  const { title, message, targetRole } = data;
  console.log(`[NotificationWorker] Dispatching alert to ${targetRole}: ${title}`);

  broadcastEvent('admin:alert', {
    title,
    message,
    targetRole,
    timestamp: new Date().toISOString()
  });
}

async function startNotificationWorker() {
  const channel = getConsumerChannel();
  if (!channel) return;

  console.log('[NotificationWorker] Starting consumer on', TOPOLOGY.queues.notification);
  await channel.consume(
    TOPOLOGY.queues.notification,
    (msg) => processMessage(msg, handleNotificationJob, TOPOLOGY.queues.notification),
    { noAck: false }
  );
}

module.exports = { startNotificationWorker };
