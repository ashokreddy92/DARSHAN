const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    service: {
      type: String,
      required: true,
      enum: ['API', 'DATABASE', 'REDIS', 'RABBITMQ', 'PAYMENTS', 'EMAIL'],
      index: true
    },
    severity: {
      type: String,
      required: true,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      default: 'WARNING',
      index: true
    },
    errorType: {
      type: String,
      required: true
    },
    fingerprint: {
      type: String,
      required: true,
      index: true
    },
    message: {
      type: String,
      required: true
    },
    occurrences: {
      type: Number,
      default: 1
    },
    firstSeen: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Investigating', 'Acknowledged', 'Resolved'],
      default: 'Investigating',
      index: true
    },
    affectedEntities: {
      type: mongoose.Schema.Types.Mixed
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: {
      type: Date
    },
    resolutionNote: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Incident', incidentSchema);
