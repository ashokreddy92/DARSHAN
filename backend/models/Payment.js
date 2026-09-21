const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    temple: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Temple'
    },
    amount: {
      type: Number,
      required: [true, 'Please add payment amount']
    },
    currency: {
      type: String,
      default: 'INR'
    },
    paymentMethod: {
      type: String,
      enum: ['Card', 'UPI', 'NetBanking', 'MockGateway'],
      default: 'Card'
    },
    gateway: {
      type: String,
      enum: ['MockGateway', 'Razorpay', 'Stripe', 'UPI_Direct'],
      default: 'MockGateway'
    },
    transactionReference: {
      type: String,
      index: true
    },
    status: {
      type: String,
      enum: [
        'Pending', 'Processing', 'Successful', 'Failed',
        'Cancelled', 'Refunded', 'Partially Refunded', 'Disputed', 'Requires Review'
      ],
      default: 'Pending',
      index: true
    },
    timeline: [
      {
        milestone: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String }
      }
    ],
    failureReason: {
      type: String
    },
    refundStatus: {
      type: String,
      enum: ['None', 'Requested', 'Processed', 'Failed'],
      default: 'None'
    },
    refundAmount: {
      type: Number,
      default: 0
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
