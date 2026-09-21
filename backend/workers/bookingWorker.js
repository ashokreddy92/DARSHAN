/**
 * DarshanEase — Booking Worker
 * Consumes: darshanease.booking
 */

const { getConsumerChannel, TOPOLOGY } = require('../config/rabbitmq');
const { processMessage } = require('./workerUtils');
const cacheService = require('../services/cacheService');
const { broadcastEvent } = require('../socket/socketService');

async function handleBookingJob(data, envelope) {
  const Booking = require('../models/Booking');
  const { bookingId, bookingReference, slotId, templeId } = data;

  console.log(`[BookingWorker] Processing booking job for reference: ${bookingReference}`);

  // Invalidate slot cache
  if (slotId) {
    await cacheService.del(`slot:${slotId}`);
  }
  if (templeId) {
    await cacheService.del(`temple:${templeId}:slots`);
  }

  // Notify active sockets
  broadcastEvent('booking:updated', {
    bookingReference,
    status: data.status || 'Confirmed',
    timestamp: new Date().toISOString()
  });
}

async function startBookingWorker() {
  const channel = getConsumerChannel();
  if (!channel) return;

  console.log('[BookingWorker] Starting consumer on', TOPOLOGY.queues.booking);
  await channel.consume(
    TOPOLOGY.queues.booking,
    (msg) => processMessage(msg, handleBookingJob, TOPOLOGY.queues.booking),
    { noAck: false }
  );
}

module.exports = { startBookingWorker };
