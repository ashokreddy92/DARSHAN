const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const compression = require('compression');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env'), override: true });

const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  const app = express();

  // Performance: HTTP Compression (reduces API payload sizes by 65-75%)
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) return false;
      return compression.filter(req, res);
    },
    level: 6, // Optimal CPU-to-compression ratio
  }));

  // Middlewares  
  app.use(cors());
  app.use(express.json());

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // Uptime & Health Check Endpoint (Used by Render / UptimeRobot to eliminate cold starts)
  app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.status(200).json({
      status: 'healthy',
      service: 'darshanease-backend',
      uptime: `${Math.floor(process.uptime())}s`,
      timestamp: new Date().toISOString(),
      database: dbStatus,
    });
  });

  // Routes
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/temples', require('./routes/templeRoutes'));
  app.use('/api/slots', require('./routes/slotRoutes'));
  app.use('/api/bookings', require('./routes/bookingRoutes'));
  app.use('/api/donations', require('./routes/donationRoutes'));
  app.use('/api/contact', require('./routes/contactRoutes'));
  app.use('/api/upload', require('./routes/uploadRoutes'));

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({ message: 'Welcome to DarshanEase API', status: 'online' });
  });

  app.use((err, req, res, next) => {
    const statusCode = err.statusCode || err.status || (res.statusCode === 200 ? 500 : res.statusCode);
    console.error(err.stack);
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Internal Server Error',
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
  });

  const PORT = process.env.PORT || 5000;

  const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });

  // Zero-downtime & graceful shutdown for deployment recycling & load balancers
  const gracefulShutdown = (signal) => {
    console.log(`\nReceived ${signal}. Draining active HTTP connections...`);
    server.close(async () => {
      try {
        await mongoose.connection.close(false);
        console.log('MongoDB connection and HTTP server cleanly closed.');
        process.exit(0);
      } catch (closeErr) {
        console.error('Error closing MongoDB connection:', closeErr);
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
