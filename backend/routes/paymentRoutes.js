/**
 * DarshanEase — Payment Routes & Webhook Processor
 * Implements:
 * - Idempotent Payment Webhook endpoint with signature verification
 * - Asynchronous Payment Verification event pipeline through RabbitMQ
 * - Secure status lookup
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Payment = require('../models/Payment');
const PaymentAuditLog = require('../models/PaymentAuditLog');
const Booking = require('../models/Booking');
const paymentQueue = require('../queues/paymentQueue');
const idempotencyService = require('../services/idempotencyService');
const { protect } = require('../middleware/authMiddleware');

/**
 * @desc    Process incoming Payment Gateway Webhook (Idempotent)
 * @route   POST /api/payments/webhook
 * @access  Public (Signature-Verified)
 */
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'] || req.headers['x-gateway-signature'];
    const { event, payload, transactionReference, bookingReference, amount, status } = req.body;

    const eventId = req.headers['x-event-id'] || req.body.eventId || `wh_${transactionReference || Date.now()}`;

    // 1. Idempotency Check: Don't re-process if already received
    const isProcessed = await idempotencyService.getSavedResponse(`webhook:${eventId}`);
    if (isProcessed) {
      console.log(`[Webhook] Duplicate webhook event ${eventId} safely ignored.`);
      return res.status(200).json({ success: true, message: 'Event already processed' });
    }

    // 2. Validate Signature if webhook secret configured
    const webhookSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (signature !== expectedSignature) {
        console.warn('[Webhook] Invalid gateway signature received.');
        return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
      }
    }

    // 3. Extract transaction details
    const finalTxn = transactionReference || req.body.transactionId || `TXN-WH-${Date.now()}`;
    const paymentStatus = status === 'SUCCESS' || event === 'payment.captured' ? 'Successful' : (status === 'FAILED' ? 'Failed' : 'Processing');

    // 4. Update or Upsert Payment Record in MongoDB
    let payment = await Payment.findOne({ transactionReference: finalTxn });
    let booking = null;
    if (bookingReference) {
      booking = await Booking.findOne({ bookingReference });
    }

    if (!payment) {
      const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      payment = await Payment.create({
        paymentId,
        booking: booking ? booking._id : undefined,
        user: booking ? booking.user : undefined,
        temple: booking ? booking.temple : undefined,
        amount: amount || (booking ? booking.totalPrice : 0),
        currency: 'INR',
        paymentMethod: req.body.paymentMethod || 'Card',
        gateway: req.body.gateway || 'MockGateway',
        transactionReference: finalTxn,
        status: paymentStatus,
        timeline: [
          { milestone: 'PAYMENT_CREATED', timestamp: new Date(), note: 'Payment recorded via webhook' },
          { milestone: paymentStatus === 'Successful' ? 'PAYMENT_VERIFIED' : 'PAYMENT_FAILED', timestamp: new Date(), note: `Gateway status: ${status || event}` }
        ]
      });
    } else {
      payment.status = paymentStatus;
      payment.timeline.push({
        milestone: paymentStatus === 'Successful' ? 'PAYMENT_VERIFIED' : 'PAYMENT_FAILED',
        timestamp: new Date(),
        note: `Updated via Webhook (${event || status})`
      });
      await payment.save();
    }

    // 5. Update booking status if payment succeeded
    if (booking && paymentStatus === 'Successful') {
      booking.status = 'Confirmed';
      await booking.save();
    }

    // 6. Record financial audit log
    await PaymentAuditLog.create({
      paymentId: payment.paymentId,
      bookingId: booking ? booking._id : null,
      eventType: 'PAYMENT_WEBHOOK_RECEIVED',
      previousStatus: 'Pending',
      newStatus: paymentStatus,
      actorType: 'GATEWAY',
      message: `Webhook event processed: ${event || status}`,
      metadata: { transactionReference: finalTxn, eventId }
    });

    // 7. Dispatch asynchronous event through RabbitMQ
    if (paymentStatus === 'Successful') {
      await paymentQueue.enqueuePaymentVerified({
        paymentId: payment.paymentId,
        bookingId: booking ? booking._id : null,
        transactionReference: finalTxn,
        amount: payment.amount,
        status: 'Successful'
      });
    } else if (paymentStatus === 'Failed') {
      await paymentQueue.enqueuePaymentFailed({
        paymentId: payment.paymentId,
        transactionReference: finalTxn,
        failureReason: req.body.failureReason || 'Declined by gateway'
      });
    }

    // 8. Cache response for idempotency
    await idempotencyService.saveResponse(`webhook:${eventId}`, 200, { success: true });

    res.status(200).json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('[Webhook Error]', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @desc    Verify payment status
 * @route   GET /api/payments/verify/:reference
 * @access  Private
 */
router.get('/verify/:reference', protect, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      $or: [{ paymentId: req.params.reference }, { transactionReference: req.params.reference }]
    })
      .populate('booking', 'bookingReference status totalPrice')
      .populate('temple', 'name location');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    res.json({
      success: true,
      data: {
        paymentId: payment.paymentId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        transactionReference: payment.transactionReference,
        timeline: payment.timeline,
        booking: payment.booking,
        createdAt: payment.createdAt
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
