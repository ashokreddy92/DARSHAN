/**
 * DarshanEase — Notification Queue Producer
 */

const rabbitmqService = require('../services/rabbitmqService');

class NotificationQueue {
  async enqueueNotification(title, message, targetRole = 'ADMIN', metadata = {}) {
    return rabbitmqService.publishNotification({
      title,
      message,
      targetRole,
      metadata,
      createdAt: new Date().toISOString()
    }, {
      eventId: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    });
  }
}

module.exports = new NotificationQueue();
