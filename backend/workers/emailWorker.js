/**
 * DarshanEase — Email Worker
 * Consumes: darshanease.email
 */

const { getConsumerChannel, TOPOLOGY } = require('../config/rabbitmq');
const { processMessage } = require('./workerUtils');
const emailService = require('../services/emailService');

async function handleEmailJob(data) {
  if (data.type === 'SEND_OTP') {
    await emailService.sendOtpEmail(data.email, data.otp);
  } else if (data.type === 'BOOKING_RECEIPT') {
    const { sendEmail } = require('../utils/emailHelper');
    await sendEmail({
      to: data.email,
      email: data.email,
      subject: data.subject || `DarshanEase Booking Receipt - ${data.bookingReference}`,
      text: data.text || 'Your booking has been received.',
      html: data.html
    });
  } else {
    console.warn('[EmailWorker] Unknown email job type:', data.type);
  }
}

async function startEmailWorker() {
  const channel = getConsumerChannel();
  if (!channel) {
    console.warn('[EmailWorker] Consumer channel not ready.');
    return;
  }

  console.log('[EmailWorker] Starting consumer on', TOPOLOGY.queues.email);
  await channel.consume(
    TOPOLOGY.queues.email,
    (msg) => processMessage(msg, handleEmailJob, TOPOLOGY.queues.email),
    { noAck: false } // Explicit manual acknowledgement
  );
}

module.exports = { startEmailWorker };
