/**
 * DarshanEase — Metrics & Bottleneck Detection Service
 * Features:
 * - Real-time Measured Latency Tracking (Avg, P95, P99)
 * - Slow API & Error Hotspot Detection
 * - Live MongoDB & Redis Latency Probing
 * - Prometheus / OpenMetrics Format Generator
 */

const mongoose = require('mongoose');
const { getRedisHealth } = require('../config/redis');
const { getRabbitMQHealth, getQueueStats } = require('../config/rabbitmq');

// Rolling in-memory window of the last 1,000 HTTP requests
const MAX_SAMPLES = 1000;
const latencySamples = [];
const endpointStats = new Map(); // endpoint -> { totalCalls, totalTime, errors, p95 }

class MetricsService {
  /**
   * Express middleware to capture response times
   */
  requestTrackingMiddleware() {
    return (req, res, next) => {
      // Exclude polling and metrics endpoints from skewing numbers
      if (req.path.startsWith('/metrics') || req.path === '/api/health') {
        return next();
      }

      const start = process.hrtime();

      res.on('finish', () => {
        const diff = process.hrtime(start);
        const durationMs = Math.round((diff[0] * 1e3 + diff[1] * 1e-6) * 100) / 100;

        // Clean route template (e.g. /api/temples/:id)
        const routePath = req.baseUrl + (req.route ? req.route.path : req.path);
        const method = req.method;
        const key = `${method} ${routePath}`;

        // 1. Record sample in circular buffer
        if (latencySamples.length >= MAX_SAMPLES) {
          latencySamples.shift();
        }
        latencySamples.push({ durationMs, timestamp: Date.now(), isError: res.statusCode >= 400 });

        // 2. Accumulate endpoint stats
        let stat = endpointStats.get(key);
        if (!stat) {
          stat = { key, method, path: routePath, count: 0, totalMs: 0, errors: 0, samples: [] };
          endpointStats.set(key, stat);
        }
        stat.count++;
        stat.totalMs += durationMs;
        if (res.statusCode >= 400) stat.errors++;
        if (stat.samples.length >= 100) stat.samples.shift();
        stat.samples.push(durationMs);
      });

      next();
    };
  }

  /**
   * Calculate percentile from an array of numbers
   */
  calculatePercentile(arr, p) {
    if (!arr || arr.length === 0) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return Math.round(sorted[Math.max(0, index)] * 10) / 10;
  }

  /**
   * Measure live MongoDB latency
   */
  async getMongoLatency() {
    if (mongoose.connection.readyState !== 1) {
      return { status: 'disconnected', latencyMs: -1 };
    }
    const start = Date.now();
    try {
      await mongoose.connection.db.admin().ping();
      return { status: 'healthy', latencyMs: Date.now() - start };
    } catch (err) {
      return { status: 'degraded', latencyMs: -1, error: err.message };
    }
  }

  /**
   * Comprehensive System Metrics
   */
  async getSystemMetrics() {
    const memory = process.memoryUsage();
    const durations = latencySamples.map((s) => s.durationMs);

    const avgLatency = durations.length > 0
      ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10
      : 0;
    const p95Latency = this.calculatePercentile(durations, 95);
    const p99Latency = this.calculatePercentile(durations, 99);

    const mongoHealth = await this.getMongoLatency();
    const redisHealth = await getRedisHealth();
    const rabbitHealth = await getRabbitMQHealth();
    const queueStats = await getQueueStats();

    // Top Slowest Endpoints
    const endpointsArray = Array.from(endpointStats.values()).map((s) => ({
      endpoint: s.key,
      calls: s.count,
      errors: s.errors,
      avgLatencyMs: Math.round(s.totalMs / s.count),
      p95LatencyMs: this.calculatePercentile(s.samples, 95)
    }));

    const topSlow = [...endpointsArray].sort((a, b) => b.p95LatencyMs - a.p95LatencyMs).slice(0, 5);
    const topFailed = [...endpointsArray].filter((e) => e.errors > 0).sort((a, b) => b.errors - a.errors).slice(0, 5);

    return {
      performance: {
        totalRequestsSampled: durations.length,
        avgLatencyMs: avgLatency,
        p95LatencyMs: p95Latency,
        p99LatencyMs: p99Latency
      },
      topSlowAPIs: topSlow,
      topFailedAPIs: topFailed,
      infrastructure: {
        mongodb: mongoHealth,
        redis: redisHealth,
        rabbitmq: rabbitHealth,
        queues: queueStats
      },
      resources: {
        uptimeSeconds: Math.floor(process.uptime()),
        memoryRssMb: Math.round(memory.rss / (1024 * 1024)),
        memoryHeapMb: Math.round(memory.heapUsed / (1024 * 1024)),
        nodeVersion: process.version
      }
    };
  }

  /**
   * Bottleneck Analysis Report
   */
  async getBottlenecks() {
    const metrics = await this.getSystemMetrics();
    const bottlenecks = [];

    // 1. API Latency Warning
    if (metrics.performance.p95LatencyMs > 500) {
      bottlenecks.push({
        component: 'API Gateway',
        severity: metrics.performance.p95LatencyMs > 1000 ? 'CRITICAL' : 'WARNING',
        message: `High P95 API Latency: ${metrics.performance.p95LatencyMs}ms (Threshold: 500ms)`,
        recommendation: 'Inspect slow queries in top slow endpoints or scale HTTP worker processes.'
      });
    }

    // 2. Database Latency
    if (metrics.infrastructure.mongodb.latencyMs > 100) {
      bottlenecks.push({
        component: 'MongoDB',
        severity: metrics.infrastructure.mongodb.latencyMs > 300 ? 'CRITICAL' : 'WARNING',
        message: `MongoDB ping response time elevated: ${metrics.infrastructure.mongodb.latencyMs}ms`,
        recommendation: 'Check database connection pool or investigate unindexed collection scans.'
      });
    }

    // 3. Redis Latency
    if (metrics.infrastructure.redis.status !== 'healthy') {
      bottlenecks.push({
        component: 'Redis Cache/Locks',
        severity: 'CRITICAL',
        message: `Redis is not healthy: ${metrics.infrastructure.redis.status}`,
        recommendation: 'Verify Redis broker connectivity to ensure distributed booking locks function safely.'
      });
    }

    // 4. RabbitMQ Queue Backlogs
    if (metrics.infrastructure.queues.available) {
      metrics.infrastructure.queues.queues.forEach((q) => {
        if (q.messagesReady > 100) {
          bottlenecks.push({
            component: `Queue: ${q.name}`,
            severity: q.messagesReady > 500 ? 'CRITICAL' : 'WARNING',
            message: `Queue depth backlogged with ${q.messagesReady} pending messages`,
            recommendation: `Increase consumer worker prefetch or scale worker instances on queue ${q.name}.`
          });
        }
      });
    }

    return {
      evaluatedAt: new Date().toISOString(),
      bottleneckCount: bottlenecks.length,
      status: bottlenecks.some((b) => b.severity === 'CRITICAL')
        ? 'CRITICAL'
        : bottlenecks.length > 0
        ? 'WARNING'
        : 'HEALTHY',
      bottlenecks,
      metrics
    };
  }

  /**
   * Export OpenMetrics / Prometheus standard format
   */
  async getPrometheusMetrics() {
    const metrics = await this.getSystemMetrics();
    const lines = [
      '# HELP darshanease_api_latency_seconds Response time in seconds',
      '# TYPE darshanease_api_latency_seconds gauge',
      `darshanease_api_latency_seconds{quantile="0.50"} ${(metrics.performance.avgLatencyMs / 1000).toFixed(4)}`,
      `darshanease_api_latency_seconds{quantile="0.95"} ${(metrics.performance.p95LatencyMs / 1000).toFixed(4)}`,
      `darshanease_api_latency_seconds{quantile="0.99"} ${(metrics.performance.p99LatencyMs / 1000).toFixed(4)}`,
      '',
      '# HELP darshanease_mongodb_latency_seconds MongoDB ping latency',
      '# TYPE darshanease_mongodb_latency_seconds gauge',
      `darshanease_mongodb_latency_seconds ${(Math.max(0, metrics.infrastructure.mongodb.latencyMs) / 1000).toFixed(4)}`,
      '',
      '# HELP darshanease_process_uptime_seconds Process uptime in seconds',
      '# TYPE darshanease_process_uptime_seconds counter',
      `darshanease_process_uptime_seconds ${metrics.resources.uptimeSeconds}`,
      '',
      '# HELP darshanease_memory_bytes Node.js memory footprint',
      '# TYPE darshanease_memory_bytes gauge',
      `darshanease_memory_bytes{type="rss"} ${metrics.resources.memoryRssMb * 1024 * 1024}`,
      `darshanease_memory_bytes{type="heap"} ${metrics.resources.memoryHeapMb * 1024 * 1024}`
    ];

    if (metrics.infrastructure.queues.available) {
      lines.push('');
      lines.push('# HELP darshanease_rabbitmq_queue_depth Messages waiting in queue');
      lines.push('# TYPE darshanease_rabbitmq_queue_depth gauge');
      metrics.infrastructure.queues.queues.forEach((q) => {
        lines.push(`darshanease_rabbitmq_queue_depth{queue="${q.name}"} ${q.messagesReady}`);
      });
    }

    return lines.join('\n') + '\n';
  }
}

module.exports = new MetricsService();
