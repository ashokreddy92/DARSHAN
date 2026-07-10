const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    temple: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Temple'
    },
    donorName: {
      type: String,
      required: [true, 'Please provide donor name']
    },
    amount: {
      type: Number,
      required: [true, 'Please specify donation amount']
    },
    purpose: {
      type: String,
      default: 'General'
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Completed'
    },
    transactionId: {
      type: String,
      required: true,
      unique: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Donation', donationSchema);
