/**
 * DarshanEase — Email Queue Producer
 */

const rabbitmqService = require('../services/rabbitmqService');
const { TOPOLOGY } = require('../config/rabbitmq');

class EmailQueue {
  /**
   * Queue 6-Digit OTP Email Job
   */
  async enqueueOtpEmail(email, otp, meta = {}) {
    return rabbitmqService.publishJob(TOPOLOGY.routingKeys.email, {
      type: 'SEND_OTP',
      email,
      otp,
      meta
    }, {
      eventId: `email_otp_${email}_${Date.now()}`
    });
  }

  /**
   * Queue Darshan Confirmation Receipt Email Job
   */
  async enqueueBookingReceipt(bookingDetails) {
    return rabbitmqService.publishJob(TOPOLOGY.routingKeys.email, {
      type: 'BOOKING_RECEIPT',
      ...bookingDetails
    }, {
      eventId: `email_booking_${bookingDetails.bookingReference}_${Date.now()}`
    });
  }
}

module.exports = new EmailQueue();
