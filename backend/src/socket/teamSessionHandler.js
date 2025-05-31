import prisma from '../config/database.js';
import { logger } from '../utils/logger.js';

export const handleTeamSession = (io, socket) => {
  // Join team session room
  socket.on('team:join', async (sessionId) => {
    try {
      // Verify user is participant
      const participant = await prisma.teamSessionParticipant.findFirst({
        where: {
          teamSessionId: sessionId,
          userId: socket.userId
        }
      });

      if (!participant) {
        return socket.emit('error', { message: 'Not a participant in this session' });
      }

      // Leave other team session rooms
      const rooms = Array.from(socket.rooms);
      rooms.forEach(room => {
        if (room.startsWith('team:') && room !== `team:${sessionId}`) {
          socket.leave(room);
        }
      });

      // Join new room
      socket.join(`team:${sessionId}`);
      socket.data.teamSessionId = sessionId;

      // Notify others
      socket.to(`team:${sessionId}`).emit('team:user-joined', {
        userId: socket.userId,
        user: socket.user
      });

      logger.info(`User ${socket.userId} joined team session ${sessionId}`);
    } catch (error) {
      logger.error('Error joining team session:', error);
      socket.emit('error', { message: 'Failed to join team session' });
    }
  });

  // Leave team session room
  socket.on('team:leave', async (sessionId) => {
    socket.leave(`team:${sessionId}`);
    delete socket.data.teamSessionId;

    // Notify others
    socket.to(`team:${sessionId}`).emit('team:user-left', {
      userId: socket.userId
    });
  });

  // Update ready status
  socket.on('team:ready', async ({ sessionId, isReady }) => {
    try {
      await prisma.teamSessionParticipant.update({
        where: {
          teamSessionId_userId: {
            teamSessionId: sessionId,
            userId: socket.userId
          }
        },
        data: { isReady }
      });

      // Notify all participants
      io.to(`team:${sessionId}`).emit('team:ready-update', {
        userId: socket.userId,
        isReady
      });
    } catch (error) {
      logger.error('Error updating ready status:', error);
      socket.emit('error', { message: 'Failed to update ready status' });
    }
  });

  // Timer sync
  socket.on('team:timer-sync', async ({ sessionId, timerState }) => {
    try {
      // Verify user is host
      const participant = await prisma.teamSessionParticipant.findFirst({
        where: {
          teamSessionId: sessionId,
          userId: socket.userId,
          role: 'host'
        }
      });

      if (!participant) {
        return socket.emit('error', { message: 'Only host can control timer' });
      }

      // Broadcast to all participants
      io.to(`team:${sessionId}`).emit('team:timer-update', timerState);
    } catch (error) {
      logger.error('Error syncing timer:', error);
      socket.emit('error', { message: 'Failed to sync timer' });
    }
  });

  // Chat message
  socket.on('team:message', async ({ sessionId, message }) => {
    try {
      // Create message in database
      const newMessage = await prisma.teamSessionMessage.create({
        data: {
          teamSessionId: sessionId,
          userId: socket.userId,
          message: message.trim()
        },
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
              photoURL: true
            }
          }
        }
      });

      // Broadcast to all participants
      io.to(`team:${sessionId}`).emit('team:new-message', newMessage);
    } catch (error) {
      logger.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Voice chat signaling (WebRTC)
  socket.on('team:voice-offer', ({ sessionId, targetUserId, offer }) => {
    io.to(`user:${targetUserId}`).emit('team:voice-offer', {
      sessionId,
      userId: socket.userId,
      offer
    });
  });

  socket.on('team:voice-answer', ({ sessionId, targetUserId, answer }) => {
    io.to(`user:${targetUserId}`).emit('team:voice-answer', {
      sessionId,
      userId: socket.userId,
      answer
    });
  });

  socket.on('team:voice-ice-candidate', ({ sessionId, targetUserId, candidate }) => {
    io.to(`user:${targetUserId}`).emit('team:voice-ice-candidate', {
      sessionId,
      userId: socket.userId,
      candidate
    });
  });

  // Handle disconnect
  socket.on('disconnect', async () => {
    if (socket.data.teamSessionId) {
      // Notify team members
      socket.to(`team:${socket.data.teamSessionId}`).emit('team:user-disconnected', {
        userId: socket.userId
      });

      // Update participant status
      try {
        await prisma.teamSessionParticipant.update({
          where: {
            teamSessionId_userId: {
              teamSessionId: socket.data.teamSessionId,
              userId: socket.userId
            }
          },
          data: { isReady: false }
        });
      } catch (error) {
        // Participant might have already left
      }
    }
  });
};