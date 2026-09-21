const mongoose = require('mongoose');

const darshanSlotSchema = new mongoose.Schema(
  {
    temple: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Temple',
      required: true
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Please add a date']
    },
    timeSlot: {
      type: String, // e.g., "06:00 AM - 08:00 AM"
      required: [true, 'Please add a time slot']
    },
    maxCapacity: {
      type: Number,
      required: [true, 'Please add max capacity']
    },
    bookedCount: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      default: 300
    },
    slotType: {
      type: String,
      enum: ['VIP', 'Special Pooja'],
      default: 'VIP'
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate slots for same temple, date, timeSlot, and type
darshanSlotSchema.index({ temple: 1, date: 1, timeSlot: 1, slotType: 1 }, { unique: true });

module.exports = mongoose.model('DarshanSlot', darshanSlotSchema);
