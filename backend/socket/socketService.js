/**
 * DarshanEase — Real-time Socket.IO Service with Redis Adapter
 * Enables multi-server horizontal scaling using Redis pub/sub adapter.
 */

const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { getRedisClient, isRedisConnected } = require('../config/redis');

let io = null;

const initSocketIO = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  const redisClient = getRedisClient();

  if (redisClient && isRedisConnected()) {
    try {
      // Create dedicated pub/sub duplicate clients for the Redis adapter
      const pubClient = redisClient.duplicate();
      const subClient = redisClient.duplicate();

      io.adapter(createAdapter(pubClient, subClient));
      console.log('[SOCKET_IO_REDIS] Socket.IO scaled with Redis pub/sub adapter.');
    } catch (err) {
      console.warn('[SOCKET_IO_REDIS_WARN] Could not attach Redis adapter, running in single-node mode:', err.message);
    }
  } else {
    console.log('[SOCKET_IO_STANDALONE] Socket.IO running in single-node mode.');
  }

  io.on('connection', (socket) => {
    // Devotees can join specific temple rooms for live darshan/slot updates
    socket.on('join_temple', (templeId) => {
      socket.join(`temple:${templeId}`);
    });

    socket.on('leave_temple', (templeId) => {
      socket.leave(`temple:${templeId}`);
    });
  });

  return io;
};

const getIO = () => io;

/**
 * Broadcast real-time events across all connected nodes via Redis/Socket.IO.
 */
const broadcastEvent = (eventName, data, room = null) => {
  if (!io) return;
  if (room) {
    io.to(room).emit(eventName, data);
  } else {
    io.emit(eventName, data);
  }
};

module.exports = {
  initSocketIO,
  getIO,
  broadcastEvent
};
