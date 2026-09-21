/**
 * DarshanEase — Payment Queue Producer
 * Carries non-sensitive payment lifecycle events
 */

const rabbitmqService = require('../services/rabbitmqService');

class PaymentQueue {
  /**
   * Queue Payment Initiation Event
   */
  async enqueuePaymentInitiated(paymentData) {
    return rabbitmqService.publishEvent('event.payment.initiated', paymentData, {
      eventId: `pay_init_${paymentData.paymentId || paymentData.transactionReference}`,
      eventType: 'PAYMENT_INITIATED'
    });
  }

  /**
   * Queue Payment Verification / Success Event
   */
  async enqueuePaymentVerified(paymentData) {
    return rabbitmqService.publishEvent('event.payment.verified', paymentData, {
      eventId: `pay_ver_${paymentData.paymentId || paymentData.transactionReference}`,
      eventType: 'PAYMENT_VERIFIED'
    });
  }

  /**
   * Queue Payment Failure Event
   */
  async enqueuePaymentFailed(paymentData) {
    return rabbitmqService.publishEvent('event.payment.failed', paymentData, {
      eventId: `pay_fail_${paymentData.paymentId || paymentData.transactionReference}_${Date.now()}`,
      eventType: 'PAYMENT_FAILED'
    });
  }

  /**
   * Queue Refund Request Event
   */
  async enqueueRefundRequested(refundData) {
    return rabbitmqService.publishEvent('event.payment.refund', refundData, {
      eventId: `refund_${refundData.paymentId}_${Date.now()}`,
      eventType: 'REFUND_REQUESTED'
    });
  }
}

module.exports = new PaymentQueue();
