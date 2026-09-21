/**
 * DarshanEase — Worker Utilities for Reliable Message Consumption
 * Implements:
 * - Consumer Acknowledgement (Manual ACK)
 * - Controlled Retries with Exponential Backoff
 * - Dead Lettering on Max Retries Exceeded
 * - Idempotency Validation (Skip duplicates)
 */

const { getConsumerChannel, TOPOLOGY } = require('../config/rabbitmq');
const idempotencyService = require('../services/idempotencyService');

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [5000, 30000, 120000]; // 5s, 30s, 2m

/**
 * Handle worker message with automatic retry, exponential backoff, and DLQ
 */
async function processMessage(msg, handlerFn, queueName) {
  const channel = getConsumerChannel();
  if (!channel || !msg) return;

  let content;
  try {
    content = JSON.parse(msg.content.toString());
  } catch (parseErr) {
    console.error(`[Worker] Malformed message on ${queueName}. Rejecting to DLQ:`, parseErr);
    return channel.nack(msg, false, false); // Nack directly to DLQ
  }

  const { eventId, eventType, data } = content;
  const retryCount = (msg.properties.headers && msg.properties.headers['x-retry-count']) || 0;

  // 1. Idempotency Check: Don't process if already processed
  if (eventId) {
    const isProcessed = await idempotencyService.getSavedResponse(`processed:${eventId}`);
    if (isProcessed) {
      console.log(`[Worker] Idempotency: Event ${eventId} on ${queueName} already processed. Acking.`);
      return channel.ack(msg);
    }
  }

  try {
    // 2. Execute business handler
    await handlerFn(data, content);

    // 3. Mark event as processed in idempotency store
    if (eventId) {
      await idempotencyService.saveResponse(`processed:${eventId}`, 200, { success: true, at: new Date() });
    }

    // 4. Acknowledge message upon success
    channel.ack(msg);
  } catch (err) {
    console.error(`[Worker Error] Processing failed for ${eventType || queueName} (Attempt ${retryCount + 1}/${MAX_RETRIES}):`, err.message);

    if (retryCount < MAX_RETRIES) {
      const nextAttempt = retryCount + 1;
      const delay = RETRY_DELAYS_MS[retryCount] || 60000;

      console.warn(`[Worker Retry] Re-queueing message with ${delay / 1000}s backoff...`);

      // Reject current message without requeue so it doesn't loop instantly
      channel.ack(msg);

      // Re-publish after backoff delay with incremented retry header
      setTimeout(async () => {
        try {
          const rabbitmqService = require('../services/rabbitmqService');
          await rabbitmqService.publish(msg.fields.exchange || TOPOLOGY.exchanges.jobs.name, msg.fields.routingKey, data, {
            eventId,
            eventType,
            headers: {
              'x-retry-count': nextAttempt,
              'x-last-error': err.message
            }
          });
        } catch (repubErr) {
          console.error('[Worker] Failed to re-publish retry message:', repubErr);
        }
      }, delay);
    } else {
      console.error(`[Worker DLQ] Max retries (${MAX_RETRIES}) exhausted for ${eventId}. Rejecting to Dead Letter Queue.`);
      // NACK without requeue routes the message to darshanease.deadletter via x-dead-letter-exchange
      channel.nack(msg, false, false);

      // Register an incident for admin visibility
      try {
        const incidentService = require('../services/incidentService');
        await incidentService.recordIncident({
          service: 'RABBITMQ',
          severity: 'CRITICAL',
          errorType: 'DLQ_MESSAGE_EXHAUSTED',
          message: `Job on ${queueName} failed after ${MAX_RETRIES} attempts: ${err.message}`,
          affectedEntities: { eventId, queueName, eventType }
        });
      } catch (incErr) {
        console.error('[Worker] Error recording DLQ incident:', incErr.message);
      }
    }
  }
}

module.exports = {
  processMessage
};
