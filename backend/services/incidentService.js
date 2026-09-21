/**
 * DarshanEase — Incident & Failure Grouping Service
 * Features:
 * - Error deduplication by fingerprinting (prevents 10,000 alert flood)
 * - Incident lifecycle management (Investigating -> Acknowledged -> Resolved)
 * - Real-time Socket.IO alert broadcasting
 */

const crypto = require('crypto');
const Incident = require('../models/Incident');
const { broadcastEvent } = require('../socket/socketService');

class IncidentService {
  /**
   * Generate grouping fingerprint from service, type, and sanitized message
   */
  generateFingerprint(service, errorType, message) {
    // Normalize message by removing numbers/IDs/timestamps
    const normalized = (message || '').replace(/\d+/g, 'X').substring(0, 150);
    return crypto
      .createHash('md5')
      .update(`${service}:${errorType}:${normalized}`)
      .digest('hex');
  }

  /**
   * Record or update an incident
   */
  async recordIncident({ service, severity = 'WARNING', errorType, message, affectedEntities = {} }) {
    try {
      const fingerprint = this.generateFingerprint(service, errorType, message);

      // Check if an unresolved incident with the same fingerprint exists
      let incident = await Incident.findOne({
        fingerprint,
        status: { $in: ['Investigating', 'Acknowledged'] }
      });

      if (incident) {
        incident.occurrences += 1;
        incident.lastSeen = new Date();
        incident.message = message; // update with latest message
        if (severity === 'CRITICAL') incident.severity = 'CRITICAL';
        await incident.save();
        return incident;
      }

      // Create new grouped incident
      const incidentId = `INC-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      incident = await Incident.create({
        incidentId,
        service,
        severity,
        errorType,
        fingerprint,
        message,
        occurrences: 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
        status: 'Investigating',
        affectedEntities
      });

      // Broadcast alert to admin dashboard
      broadcastEvent('admin:incident', {
        incidentId: incident.incidentId,
        service: incident.service,
        severity: incident.severity,
        message: incident.message,
        timestamp: incident.lastSeen
      });

      return incident;
    } catch (err) {
      console.error('[IncidentService] Failed to record incident:', err.message);
      return null;
    }
  }

  /**
   * Acknowledge an incident
   */
  async acknowledgeIncident(incidentId, user) {
    const incident = await Incident.findOne({ incidentId });
    if (!incident) throw new Error('Incident not found');

    incident.status = 'Acknowledged';
    await incident.save();
    return incident;
  }

  /**
   * Resolve an incident
   */
  async resolveIncident(incidentId, user, resolutionNote = '') {
    const incident = await Incident.findOne({ incidentId });
    if (!incident) throw new Error('Incident not found');

    incident.status = 'Resolved';
    incident.resolvedAt = new Date();
    incident.resolvedBy = user ? user._id : null;
    incident.resolutionNote = resolutionNote;
    await incident.save();
    return incident;
  }
}

module.exports = new IncidentService();
