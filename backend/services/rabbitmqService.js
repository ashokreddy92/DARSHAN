/**
 * DarshanEase — RabbitMQ Publisher & Event Service
 * Features:
 * - Guaranteed Delivery using Publisher Confirms
 * - Message Idempotency key tracking
 * - Sensitive Data Sanitizer (PCI-DSS compliance: no cards, CVV, UPI PINs)
 * - Dead-letter reporting
 */

const { getPublisherChannel, TOPOLOGY } = require('../config/rabbitmq');
const idempotencyService = require('./idempotencyService');

// Sensitive keys to scrub from event payloads
const SENSITIVE_KEYS = [
  'password', 'cvv', 'cvc', 'pin', 'cardNumber', 'card_number',
  'upiPin', 'token', 'secret', 'authCode'
];

/**
 * Recursively scrub sensitive payment & authentication details
 */
function sanitizePayload(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizePayload);

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      clean[key] = sanitizePayload(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

class RabbitmqService {
  /**
   * Publish a message with Publisher Confirm & Idempotency
   * @param {string} exchange - Target exchange
   * @param {string} routingKey - Target routing key
   * @param {object} payload - Message payload
   * @param {object} [options] - Additional AMQP options
   * @returns {Promise<boolean>} True if broker confirmed receipt
   */
  async publish(exchange, routingKey, payload, options = {}) {
    const channel = getPublisherChannel();
    if (!channel) {
      console.warn(`[RabbitMQ] Channel unavailable. Skipping async publish to ${exchange}/${routingKey}`);
      return false;
    }

    const eventId = options.eventId || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check idempotency if eventId provided
    if (options.eventId) {
      const alreadySent = await idempotencyService.getSavedResponse(`msg:${options.eventId}`);
      if (alreadySent) {
        console.log(`[RabbitMQ] Idempotent skip: Event ${options.eventId} already published.`);
        return true;
      }
    }

    // Sanitize payload
    const safePayload = sanitizePayload(payload);
    const messageEnvelope = {
      eventId,
      eventType: options.eventType || routingKey,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      data: safePayload
    };

    const buffer = Buffer.from(JSON.stringify(messageEnvelope));
    const publishOptions = {
      persistent: true,
      contentType: 'application/json',
      messageId: eventId,
      timestamp: Date.now(),
      headers: {
        'x-retry-count': 0,
        ...options.headers
      }
    };

    return new Promise((resolve, reject) => {
      channel.publish(exchange, routingKey, buffer, publishOptions, async (err) => {
        if (err) {
          console.error(`[RabbitMQ] Publisher NACK for event ${eventId}:`, err);
          return reject(err);
        }
        // Save publish confirmation in idempotency cache
        if (options.eventId) {
          await idempotencyService.saveResponse(`msg:${options.eventId}`, 200, { published: true });
        }
        resolve(true);
      });
    });
  }

  /**
   * Helper: Publish an Event to darshanease.events
   */
  async publishEvent(routingKey, data, options = {}) {
    return this.publish(TOPOLOGY.exchanges.events.name, routingKey, data, {
      eventType: routingKey,
      ...options
    });
  }

  /**
   * Helper: Publish a Job to darshanease.jobs
   */
  async publishJob(routingKey, data, options = {}) {
    return this.publish(TOPOLOGY.exchanges.jobs.name, routingKey, data, {
      eventType: routingKey,
      ...options
    });
  }

  /**
   * Helper: Publish Notification to darshanease.notifications
   */
  async publishNotification(data, options = {}) {
    return this.publish(TOPOLOGY.exchanges.notifications.name, '', data, {
      eventType: 'NOTIFICATION',
      ...options
    });
  }
}

module.exports = new RabbitmqService();
