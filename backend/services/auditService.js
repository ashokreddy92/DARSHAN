/**
 * DarshanEase — Administrative Audit Service
 * Permanently logs operational actions across the platform
 */

const AdminAuditLog = require('../models/AdminAuditLog');

const SENSITIVE_PROPERTIES = ['password', 'otp', 'token', 'secret', 'cvv', 'pin', 'key'];

function sanitizeValues(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const clean = Array.isArray(obj) ? [] : {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_PROPERTIES.some((s) => k.toLowerCase().includes(s))) {
      clean[k] = '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      clean[k] = sanitizeValues(v);
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

class AuditService {
  /**
   * Record an administrative audit entry
   */
  async logAction(req, action, resourceType, resourceId, previousValue = null, newValue = null) {
    try {
      const actor = req && req.user ? req.user : { _id: 'SYSTEM', role: 'SYSTEM', name: 'System Process' };
      const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : 'internal';
      const userAgent = req ? (req.headers['user-agent'] || 'internal') : 'internal';

      await AdminAuditLog.create({
        actorId: actor._id,
        actorRole: actor.role || 'ADMIN',
        actorName: actor.name || 'Administrator',
        action,
        resourceType,
        resourceId: resourceId ? resourceId.toString() : undefined,
        previousValue: sanitizeValues(previousValue),
        newValue: sanitizeValues(newValue),
        ipAddress,
        userAgent,
        timestamp: new Date()
      });
    } catch (err) {
      console.error('[AuditService] Failed to record audit log:', err.message);
    }
  }
}

module.exports = new AuditService();
