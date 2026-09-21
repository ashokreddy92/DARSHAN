/**
 * DarshanEase — Analytics Queue Producer
 */

const rabbitmqService = require('../services/rabbitmqService');

class AnalyticsQueue {
  async enqueueMetric(metricName, value = 1, tags = {}) {
    return rabbitmqService.publishEvent('event.analytics', {
      metricName,
      value,
      tags,
      timestamp: new Date().toISOString()
    }, {
      eventId: `metric_${metricName}_${Date.now()}`
    });
  }
}

module.exports = new AnalyticsQueue();
