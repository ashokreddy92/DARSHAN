/**
 * DarshanEase — Payment Worker
 * Consumes: darshanease.payment
 * Synchronizes payments, audits financial transitions, and notifies admin
 */

const { getConsumerChannel, TOPOLOGY } = require('../config/rabbitmq');
const { processMessage } = require('./workerUtils');

async function handlePaymentJob(data, envelope) {
  const Payment = require('../models/Payment');
  const PaymentAuditLog = require('../models/PaymentAuditLog');
  const Booking = require('../models/Booking');

  const { paymentId, bookingId, eventType, amount, status, failureReason, transactionReference } = data;

  console.log(`[PaymentWorker] Processing ${eventType} for Payment ${paymentId || transactionReference}`);

  // Find or update payment record
  let payment = null;
  if (paymentId) {
    payment = await Payment.findOne({ paymentId });
  } else if (transactionReference) {
    payment = await Payment.findOne({ transactionReference });
  }

  const previousStatus = payment ? payment.status : 'None';
  const newStatus = status || (eventType === 'PAYMENT_VERIFIED' ? 'Successful' : (eventType === 'PAYMENT_FAILED' ? 'Failed' : 'Processing'));

  if (payment) {
    payment.status = newStatus;
    if (failureReason) payment.failureReason = failureReason;
    payment.timeline.push({
      milestone: eventType,
      timestamp: new Date(),
      note: `Event processed via RabbitMQ (${envelope.eventId})`
    });
    await payment.save();
  }

  // Update associated Booking if confirmed
  if (bookingId && newStatus === 'Successful') {
    await Booking.findByIdAndUpdate(bookingId, {
      status: 'Confirmed'
    });
  }

  // Record permanent immutable financial audit log
  await PaymentAuditLog.create({
    paymentId: paymentId || transactionReference,
    bookingId: bookingId || (payment ? payment.booking : null),
    eventType: eventType || 'PAYMENT_PROCESSED',
    previousStatus,
    newStatus,
    actorType: 'SYSTEM',
    message: `Processed asynchronously by PaymentWorker: ${newStatus}`,
    metadata: {
      eventId: envelope.eventId,
      transactionReference,
      amount
    }
  });
}

async function startPaymentWorker() {
  const channel = getConsumerChannel();
  if (!channel) return;

  console.log('[PaymentWorker] Starting consumer on', TOPOLOGY.queues.payment);
  await channel.consume(
    TOPOLOGY.queues.payment,
    (msg) => processMessage(msg, handlePaymentJob, TOPOLOGY.queues.payment),
    { noAck: false }
  );
}

module.exports = { startPaymentWorker };
