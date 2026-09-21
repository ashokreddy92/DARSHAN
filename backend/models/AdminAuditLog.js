const mongoose = require('mongoose');

const adminAuditLogSchema = new mongoose.Schema(
  {
    actorId: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      index: true
    },
    actorRole: {
      type: String,
      required: true,
      index: true
    },
    actorName: {
      type: String,
      default: 'Admin'
    },
    action: {
      type: String,
      required: true,
      index: true
    },
    resourceType: {
      type: String,
      required: true,
      index: true
    },
    resourceId: {
      type: mongoose.Schema.Types.Mixed,
      index: true
    },
    previousValue: {
      type: mongoose.Schema.Types.Mixed
    },
    newValue: {
      type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
      type: String
    },
    userAgent: {
      type: String
    },
    timestamp: {
      type: Date,
      default: Date.now,
      immutable: true,
      index: true
    }
  },
  {
    timestamps: false
  }
);

module.exports = mongoose.model('AdminAuditLog', adminAuditLogSchema);
