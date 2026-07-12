const mongoose = require('mongoose');

const devoteeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add pilgrim name']
  },
  age: {
    type: Number,
    required: [true, 'Please add pilgrim age']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: [true, 'Please select gender']
  },
  idProofType: {
    type: String,
    required: [true, 'Please specify ID proof type'] // e.g., Aadhaar, Passport, VoterID
  },
  idProofNumber: {
    type: String,
    required: [true, 'Please specify ID proof number']
  }
});

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    temple: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Temple',
      required: true
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DarshanSlot',
      required: true
    },
    devotees: [devoteeSchema],
    bookingDate: {
      type: Date,
      default: Date.now
    },
    totalPrice: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Pending Verification', 'Confirmed', 'Cancelled'],
      default: 'Confirmed'
    },
    bookingReference: {
      type: String,
      required: true,
      unique: true
    },
    paymentMethod: {
      type: String,
      enum: ['Card', 'UPI'],
      default: 'Card'
    },
    upiId: {
      type: String
    },
    transactionId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
