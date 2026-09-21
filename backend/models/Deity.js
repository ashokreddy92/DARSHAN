const mongoose = require('mongoose');

const deitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide deity name'],
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    alternateNames: [
      {
        type: String,
        trim: true
      }
    ],
    description: {
      type: String,
      required: [true, 'Please provide deity description']
    },
    imageUrl: {
      type: String,
      default: ''
    },
    iconUrl: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: [
        'Vaishnavism', 'Shaivism', 'Shakta', 'Hanuman',
        'Ganesha', 'Navagraha', 'Murugan/Kartikeya', 'Other'
      ],
      default: 'Vaishnavism'
    },
    temples: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Temple'
      }
    ],
    isFeatured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Deity', deitySchema);
