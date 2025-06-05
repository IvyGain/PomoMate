import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

export const initializeSocketHandlers = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User ${socket.userId} connected`);

    // Join user's personal room
    socket.join(`user:${socket.userId}`);

    // Team session events
    socket.on('team_session:create', async (data) => {
      try {
        const sessionId = data.sessionId;
        socket.join(`session:${sessionId}`);
        
        // Notify all participants
        io.to(`session:${sessionId}`).emit('team_session:created', {
          sessionId,
          hostId: socket.userId,
          ...data,
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('team_session:join', async (data) => {
      try {
        const { sessionId } = data;
        socket.join(`session:${sessionId}`);
        
        // Notify all participants
        io.to(`session:${sessionId}`).emit('team_session:joined', {
          sessionId,
          userId: socket.userId,
          ...data,
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('team_session:leave', async (data) => {
      try {
        const { sessionId } = data;
        socket.leave(`session:${sessionId}`);
        
        // Notify remaining participants
        io.to(`session:${sessionId}`).emit('team_session:left', {
          sessionId,
          userId: socket.userId,
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('team_session:timer_sync', async (data) => {
      try {
        const { sessionId } = data;
        
        // Broadcast timer update to all participants
        socket.to(`session:${sessionId}`).emit('team_session:timer_update', data);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('team_session:send_message', async (data) => {
      try {
        const { sessionId, message } = data;
        
        // Broadcast message to all participants
        io.to(`session:${sessionId}`).emit('team_session:message', {
          sessionId,
          userId: socket.userId,
          message,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    // Friend events
    socket.on('friend:status_update', async (status) => {
      try {
        // Get user's friends and notify them
        // This would normally fetch from database
        socket.broadcast.emit('friend:status_changed', {
          userId: socket.userId,
          status,
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User ${socket.userId} disconnected`);
      
      // Notify friends that user is offline
      socket.broadcast.emit('friend:offline', {
        userId: socket.userId,
      });
    });
  });
};