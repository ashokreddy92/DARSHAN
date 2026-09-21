/**
 * DarshanEase — Booking Queue Producer
 */

const rabbitmqService = require('../services/rabbitmqService');

class BookingQueue {
  /**
   * Queue Booking Creation / Confirmation
   */
  async enqueueBookingConfirmed(bookingData) {
    return rabbitmqService.publishEvent('event.booking.confirmed', bookingData, {
      eventId: `book_conf_${bookingData.bookingReference}`,
      eventType: 'BOOKING_CONFIRMED'
    });
  }

  /**
   * Queue QR Ticket Generation Job
   */
  async enqueueGenerateQrTicket(bookingId, bookingReference) {
    return rabbitmqService.publishJob('job.qr', { bookingId, bookingReference }, {
      eventId: `qr_${bookingReference}`
    });
  }

  /**
   * Queue Booking Cancellation Event
   */
  async enqueueBookingCancelled(bookingData) {
    return rabbitmqService.publishEvent('event.booking.cancelled', bookingData, {
      eventId: `book_cancel_${bookingData.bookingReference}`,
      eventType: 'BOOKING_CANCELLED'
    });
  }
}

module.exports = new BookingQueue();
