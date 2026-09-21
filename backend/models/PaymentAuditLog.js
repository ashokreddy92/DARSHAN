const mongoose = require('mongoose');

const paymentAuditLogSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      index: true
    },
    bookingId: {
      type: mongoose.Schema.Types.Mixed,
      index: true
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        'PAYMENT_CREATED', 'PAYMENT_PROCESSING', 'PAYMENT_SUCCESS',
        'PAYMENT_FAILED', 'PAYMENT_CANCELLED', 'REFUND_REQUESTED',
        'REFUND_SUCCESS', 'REFUND_FAILED', 'PAYMENT_WEBHOOK_RECEIVED',
        'PAYMENT_RECONCILED', 'STATUS_OVERRIDE', 'REQUIRES_REVIEW'
      ]
    },
    previousStatus: {
      type: String
    },
    newStatus: {
      type: String,
      required: true
    },
    actorType: {
      type: String,
      enum: ['SYSTEM', 'ADMIN', 'USER', 'GATEWAY'],
      default: 'SYSTEM'
    },
    actorId: {
      type: mongoose.Schema.Types.Mixed
    },
    message: {
      type: String,
      required: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true
    }
  },
  {
    // Permanent, non-deletable audit ledger
    timestamps: false
  }
);

module.exports = mongoose.model('PaymentAuditLog', paymentAuditLogSchema);
