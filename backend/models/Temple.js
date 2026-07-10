const mongoose = require('mongoose');

const templeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a temple name'],
      trim: true
    },
    location: {
      city: {
        type: String,
        required: [true, 'Please add a city']
      },
      state: {
        type: String,
        required: [true, 'Please add a state']
      }
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    deity: {
      type: String,
      required: [true, 'Please add a primary deity']
    },
    imageUrl: {
      type: String,
      default: ''
    },
    openingHours: {
      type: String,
      default: '06:00 AM - 09:00 PM'
    },
    speciality: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Temple', templeSchema);
