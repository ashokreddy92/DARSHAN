/**
 * DarshanEase — Enterprise RabbitMQ Connection Manager
 * Features:
 * - High-resilience auto-reconnect with exponential backoff
 * - Topology auto-provisioning (Durable exchanges, Queues, DLX/DLQ)
 * - Publisher Confirms for guaranteed message delivery
 * - Safe fallback mode when RabbitMQ is offline (no crashing)
 * - Health check & Queue metrics extraction
 */

const amqplib = require('amqplib');

let connection = null;
let publisherChannel = null;
let consumerChannel = null;
let isConnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY_MS = 30000;

// Centralized Topology Definition
const TOPOLOGY = {
  exchanges: {
    events: { name: 'darshanease.events', type: 'topic' },
    jobs: { name: 'darshanease.jobs', type: 'direct' },
    notifications: { name: 'darshanease.notifications', type: 'fanout' },
    deadletter: { name: 'darshanease.deadletter', type: 'direct' }
  },
  queues: {
    email: 'darshanease.email',
    payment: 'darshanease.payment',
    booking: 'darshanease.booking',
    notification: 'darshanease.notification',
    analytics: 'darshanease.analytics',
    deadletter: 'darshanease.deadletter'
  },
  routingKeys: {
    email: 'job.email',
    paymentEvents: 'event.payment.*',
    bookingEvents: 'event.booking.*',
    deadletter: 'deadletter'
  }
};

/**
 * Declare exchanges, queues, and bindings
 */
async function setupTopology(ch) {
  // 1. Declare Exchanges (durable)
  await ch.assertExchange(TOPOLOGY.exchanges.events.name, TOPOLOGY.exchanges.events.type, { durable: true });
  await ch.assertExchange(TOPOLOGY.exchanges.jobs.name, TOPOLOGY.exchanges.jobs.type, { durable: true });
  await ch.assertExchange(TOPOLOGY.exchanges.notifications.name, TOPOLOGY.exchanges.notifications.type, { durable: true });
  await ch.assertExchange(TOPOLOGY.exchanges.deadletter.name, TOPOLOGY.exchanges.deadletter.type, { durable: true });

  // 2. Declare Dead Letter Queue (DLQ)
  await ch.assertQueue(TOPOLOGY.queues.deadletter, {
    durable: true
  });
  await ch.bindQueue(TOPOLOGY.queues.deadletter, TOPOLOGY.exchanges.deadletter.name, TOPOLOGY.routingKeys.deadletter);

  // Common Queue Arguments with Dead Letter Exchange
  const dlqArgs = {
    'x-dead-letter-exchange': TOPOLOGY.exchanges.deadletter.name,
    'x-dead-letter-routing-key': TOPOLOGY.routingKeys.deadletter
  };

  // 3. Declare Business Queues
  await ch.assertQueue(TOPOLOGY.queues.email, { durable: true, arguments: dlqArgs });
  await ch.bindQueue(TOPOLOGY.queues.email, TOPOLOGY.exchanges.jobs.name, TOPOLOGY.routingKeys.email);

  await ch.assertQueue(TOPOLOGY.queues.payment, { durable: true, arguments: dlqArgs });
  await ch.bindQueue(TOPOLOGY.queues.payment, TOPOLOGY.exchanges.events.name, TOPOLOGY.routingKeys.paymentEvents);

  await ch.assertQueue(TOPOLOGY.queues.booking, { durable: true, arguments: dlqArgs });
  await ch.bindQueue(TOPOLOGY.queues.booking, TOPOLOGY.exchanges.events.name, TOPOLOGY.routingKeys.bookingEvents);

  await ch.assertQueue(TOPOLOGY.queues.notification, { durable: true, arguments: dlqArgs });
  await ch.bindQueue(TOPOLOGY.queues.notification, TOPOLOGY.exchanges.notifications.name, '');

  await ch.assertQueue(TOPOLOGY.queues.analytics, { durable: true, arguments: dlqArgs });
  await ch.bindQueue(TOPOLOGY.queues.analytics, TOPOLOGY.exchanges.events.name, 'event.#');

  console.log('[RabbitMQ] Exchange and Queue Topology successfully asserted.');
}

/**
 * Initialize RabbitMQ Connection with automatic reconnection
 */
async function connectRabbitMQ() {
  const isEnabled = process.env.RABBITMQ_ENABLED !== 'false';
  if (!isEnabled) {
    console.log('[RabbitMQ] Disabled via RABBITMQ_ENABLED=false. Skipping initialization.');
    return null;
  }

  if (connection && !connection.isClosed) {
    return connection;
  }

  if (isConnecting) return null;
  isConnecting = true;

  const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  const vhost = process.env.RABBITMQ_VHOST || '/';

  try {
    const opts = {
      clientProperties: {
        connection_name: 'darshanease-backend',
        environment: process.env.NODE_ENV || 'development'
      }
    };

    console.log(`[RabbitMQ] Connecting to broker at ${url.replace(/:([^:@]+)@/, ':****@')} (vhost: ${vhost})...`);
    connection = await amqplib.connect(url, opts);
    reconnectAttempts = 0;

    connection.on('error', (err) => {
      console.error('[RabbitMQ] Connection error:', err.message);
      scheduleReconnect();
    });

    connection.on('close', () => {
      console.warn('[RabbitMQ] Connection closed.');
      publisherChannel = null;
      consumerChannel = null;
      scheduleReconnect();
    });

    // 1. Create Publisher Confirm Channel
    publisherChannel = await connection.createConfirmChannel();
    // 2. Setup Exchanges, Queues, DLQ
    await setupTopology(publisherChannel);

    // 3. Create Consumer Channel with fair prefetch
    consumerChannel = await connection.createChannel();
    await consumerChannel.prefetch(10); // Fair dispatch: max 10 unacknowledged jobs per worker

    console.log('[RabbitMQ] Connected and Publisher/Consumer channels ready.');
    isConnecting = false;
    return connection;
  } catch (err) {
    isConnecting = false;
    console.warn(`[RabbitMQ] Unable to connect: ${err.message}. Running in resilient fallback mode.`);
    scheduleReconnect();
    return null;
  }
}

/**
 * Schedule reconnect with exponential backoff
 */
function scheduleReconnect() {
  if (isConnecting) return;
  reconnectAttempts++;
  const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), MAX_RECONNECT_DELAY_MS);
  console.log(`[RabbitMQ] Will retry connection in ${delay / 1000}s (attempt ${reconnectAttempts})...`);
  setTimeout(() => {
    connectRabbitMQ().catch((e) => console.debug('[RabbitMQ] Reconnect attempt failed:', e.message));
  }, delay);
}

/**
 * Get Confirm Channel for Publishing
 */
function getPublisherChannel() {
  return publisherChannel;
}

/**
 * Get Consumer Channel
 */
function getConsumerChannel() {
  return consumerChannel;
}

/**
 * Check health status
 */
async function getRabbitMQHealth() {
  const isEnabled = process.env.RABBITMQ_ENABLED !== 'false';
  if (!isEnabled) {
    return { status: 'disabled', message: 'RabbitMQ disabled in config' };
  }

  if (!connection || connection.isClosed || !publisherChannel) {
    return { status: 'disconnected', message: 'Not connected to RabbitMQ broker' };
  }

  try {
    const startTime = Date.now();
    // Quick check on DLQ to verify channel responsiveness
    await publisherChannel.checkQueue(TOPOLOGY.queues.deadletter);
    const latency = Date.now() - startTime;
    return {
      status: 'healthy',
      latency: `${latency}ms`,
      reconnectAttempts
    };
  } catch (err) {
    return { status: 'degraded', error: err.message };
  }
}

/**
 * Inspect Queue statistics for Admin Dashboard
 */
async function getQueueStats() {
  if (!publisherChannel) {
    return { available: false, queues: [] };
  }

  const results = [];
  for (const [key, qName] of Object.entries(TOPOLOGY.queues)) {
    try {
      const info = await publisherChannel.checkQueue(qName);
      results.push({
        id: key,
        name: qName,
        messagesReady: info.messageCount || 0,
        consumerCount: info.consumerCount || 0,
        status: info.messageCount > 100 ? 'Backlogged' : 'Healthy'
      });
    } catch (e) {
      results.push({
        id: key,
        name: qName,
        messagesReady: 0,
        consumerCount: 0,
        status: 'Unreachable'
      });
    }
  }

  return { available: true, queues: results };
}

/**
 * Cleanly close RabbitMQ connection on server shutdown
 */
async function closeRabbitMQ() {
  try {
    if (publisherChannel) await publisherChannel.close();
    if (consumerChannel) await consumerChannel.close();
    if (connection) await connection.close();
    console.log('[RabbitMQ] Cleanly closed all channels and connection.');
  } catch (err) {
    console.debug('[RabbitMQ] Error while closing connection:', err.message);
  }
}

module.exports = {
  TOPOLOGY,
  connectRabbitMQ,
  getPublisherChannel,
  getConsumerChannel,
  getRabbitMQHealth,
  getQueueStats,
  closeRabbitMQ
};
