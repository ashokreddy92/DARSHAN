// DarshanEase Backend Server
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const http = require('http');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const compression = require('compression');
const helmet = require('helmet');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const connectDB = require('./config/db');
const { getRedisClient, getRedisHealth, closeRedis } = require('./config/redis');
const { connectRabbitMQ, getRabbitMQHealth, closeRabbitMQ } = require('./config/rabbitmq');
const { initWorkers } = require('./workers');
const { initSocketIO } = require('./socket/socketService');
const cacheService = require('./services/cacheService');
const rateLimitService = require('./services/rateLimitService');
const bookingLockService = require('./services/bookingLockService');
const metricsService = require('./services/metricsService');
const { protect, authorize } = require('./middleware/authMiddleware');

const startServer = async () => {
  // 1. Connect to MongoDB (Primary Source of Truth)
  await connectDB();

  // 2. Initialize Redis connection asynchronously
  getRedisClient();

  // 3. Initialize RabbitMQ & Background Workers (Resilient)
  connectRabbitMQ().then((conn) => {
    if (conn) initWorkers();
  }).catch((err) => console.warn('[RabbitMQ] Init note:', err.message));

  const app = express();
  const server = http.createServer(app);

  // 3. Initialize Socket.IO with Redis Adapter support
  initSocketIO(server);

  // Performance: HTTP Compression (reduces API payload sizes by 65-75%)
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
    level: 6,
  }));

  // Security Headers: Protection against XSS, clickjacking, sniffing
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));

  // Middlewares  
  const cookieParser = require('cookie-parser');
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/$/, '') : null,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'https://darshan-2-sap7.onrender.com',
    'https://darshanease-frontend-3.onrender.com'
  ].filter(Boolean);

  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(',').forEach(o => {
      const trimmed = o.trim().replace(/\/$/, '');
      if (trimmed) allowedOrigins.push(trimmed);
    });
  }

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.onrender.com') ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.endsWith('.netlify.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: '10mb' }));

  // Observability: Request response-time tracking for P95 & bottleneck metrics
  app.use(metricsService.requestTrackingMiddleware());

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Section 27: Health Check Endpoint
  app.get('/api/health', async (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const redisHealth = await getRedisHealth();
    const rabbitHealth = await getRabbitMQHealth();

    res.status(200).json({
      server: 'ok',
      mongodb: dbStatus,
      redis: redisHealth.status,
      rabbitmq: rabbitHealth.status,
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString()
    });
  });

  // Section 24: Prometheus & Grafana Compatible Metrics Endpoint
  app.get('/metrics', async (req, res) => {
    try {
      const output = await metricsService.getPrometheusMetrics();
      res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
      res.send(output);
    } catch (err) {
      res.status(500).send('# Error rendering metrics');
    }
  });

  // Section 28: Redis Monitoring Metrics for Admins
  app.get('/api/admin/redis-metrics', protect, authorize('ADMIN'), async (req, res) => {
    try {
      const health = await getRedisHealth();
      const cacheMetrics = cacheService.getMetrics();
      const blockedRequests = rateLimitService.getBlockedCount();
      const activeLocks = bookingLockService.getActiveLocksCount();

      res.json({
        success: true,
        data: {
          redis: health,
          cache: cacheMetrics,
          rateLimiter: { blockedRequests },
          concurrency: { activeBookingLocks: activeLocks }
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Routes
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/temples', require('./routes/templeRoutes'));
  app.use('/api/deities', require('./routes/deityRoutes'));
  app.use('/api/slots', require('./routes/slotRoutes'));
  app.use('/api/bookings', require('./routes/bookingRoutes'));
  app.use('/api/payments', require('./routes/paymentRoutes'));
  app.use('/api/donations', require('./routes/donationRoutes'));
  app.use('/api/contact', require('./routes/contactRoutes'));
  app.use('/api/users', require('./routes/userRoutes'));
  app.use('/api/upload', require('./routes/uploadRoutes'));
  app.use('/api/admin', require('./routes/adminRoutes'));
  app.use('/api/staff', require('./routes/staffRoutes'));

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to DarshanEase API', status: 'online' });
  });

  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || err.status || (res.statusCode === 200 ? 500 : res.statusCode);
    console.error('[SERVER_ERROR]', err.stack || err.message);
    const isProd = process.env.NODE_ENV === 'production';
    res.status(statusCode).json({
      success: false,
      message: (isProd && statusCode === 500) ? 'An unexpected server error occurred. Please try again later.' : (err.message || 'Internal Server Error'),
      ...(isProd ? {} : { stack: err.stack })
    });
  });

  const PORT = process.env.PORT || 5000;

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[SERVER] Port ${PORT} is temporarily busy. Retrying in 1.5s...`);
      setTimeout(() => {
        try { server.close(); } catch (_) {}
        server.listen(PORT, () => {
          console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
      }, 1500);
    } else {
      console.error('[SERVER] Listen error:', err);
    }
  });

  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Zero-downtime & graceful shutdown
  const gracefulShutdown = (signal) => {
    console.log(`\nReceived ${signal}. Draining active HTTP connections...`);
    server.close(async () => {
      try {
        await closeRabbitMQ();
        await closeRedis();
        await mongoose.connection.close(false);
        console.log('RabbitMQ, Redis, MongoDB connections and HTTP server cleanly closed.');
        process.exit(0);
      } catch (closeErr) {
        console.error('Error during graceful shutdown:', closeErr);
        process.exit(1);
      }
    });

    // Enforce 10s maximum drain time before forced kill
    setTimeout(() => {
      console.error('Forced shutdown: ongoing requests did not finish in time.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

startServer().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
