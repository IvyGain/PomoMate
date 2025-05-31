import prisma from '../config/database.js';
import { generateTeamSessionCode } from '../utils/helpers.js';

// Create a team session
export const createTeamSession = async (req, res, next) => {
  try {
    const { name, focusDuration = 25, breakDuration = 5 } = req.body;
    const hostId = req.user.id;

    if (!name) {
      return res.status(400).json({ error: 'Session name is required' });
    }

    // Generate unique code
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateTeamSessionCode();
      const existing = await prisma.teamSession.findUnique({
        where: { code }
      });
      if (!existing) isUnique = true;
    }

    // Create team session
    const teamSession = await prisma.teamSession.create({
      data: {
        code,
        name,
        hostId,
        focusDuration,
        breakDuration,
        participants: {
          create: {
            userId: hostId,
            role: 'host',
            isReady: true
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                photoURL: true,
                level: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Team session created',
      teamSession
    });
  } catch (error) {
    next(error);
  }
};

// Get team session details
export const getTeamSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const teamSession = await prisma.teamSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                photoURL: true,
                level: true
              }
            }
          }
        },
        messages: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                photoURL: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 50
        }
      }
    });

    if (!teamSession) {
      return res.status(404).json({ error: 'Team session not found' });
    }

    // Check if user is a participant
    const isParticipant = teamSession.participants.some(
      p => p.userId === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({ error: 'Not a participant in this session' });
    }

    res.json({ teamSession });
  } catch (error) {
    next(error);
  }
};

// Join team session
export const joinTeamSession = async (req, res, next) => {
  try {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) {
      return res.status(400).json({ error: 'Session code is required' });
    }

    // Find team session by code
    const teamSession = await prisma.teamSession.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        participants: true
      }
    });

    if (!teamSession) {
      return res.status(404).json({ error: 'Invalid session code' });
    }

    // Check if already a participant
    const existingParticipant = teamSession.participants.find(
      p => p.userId === userId
    );

    if (existingParticipant) {
      return res.status(400).json({ error: 'Already in this session' });
    }

    // Check if session is full (max 10 participants)
    if (teamSession.participants.length >= 10) {
      return res.status(400).json({ error: 'Session is full' });
    }

    // Add participant
    await prisma.teamSessionParticipant.create({
      data: {
        teamSessionId: teamSession.id,
        userId,
        role: 'participant'
      }
    });

    // Return updated session
    const updatedSession = await prisma.teamSession.findUnique({
      where: { id: teamSession.id },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                photoURL: true,
                level: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Joined team session',
      teamSession: updatedSession
    });
  } catch (error) {
    next(error);
  }
};

// Leave team session
export const leaveTeamSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Find participant
    const participant = await prisma.teamSessionParticipant.findFirst({
      where: {
        teamSessionId: sessionId,
        userId
      }
    });

    if (!participant) {
      return res.status(404).json({ error: 'Not a participant in this session' });
    }

    // If host is leaving, transfer host role or delete session
    if (participant.role === 'host') {
      const otherParticipants = await prisma.teamSessionParticipant.findMany({
        where: {
          teamSessionId: sessionId,
          userId: { not: userId }
        }
      });

      if (otherParticipants.length > 0) {
        // Transfer host role
        await prisma.teamSessionParticipant.update({
          where: { id: otherParticipants[0].id },
          data: { role: 'host' }
        });
      } else {
        // Delete session if no other participants
        await prisma.teamSession.delete({
          where: { id: sessionId }
        });
        return res.json({ message: 'Team session deleted' });
      }
    }

    // Remove participant
    await prisma.teamSessionParticipant.delete({
      where: { id: participant.id }
    });

    res.json({ message: 'Left team session' });
  } catch (error) {
    next(error);
  }
};

// Update team session status (start/pause/complete)
export const updateTeamSessionStatus = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { status, currentMode } = req.body;
    const userId = req.user.id;

    // Validate status
    if (!['active', 'paused', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if user is the host
    const participant = await prisma.teamSessionParticipant.findFirst({
      where: {
        teamSessionId: sessionId,
        userId,
        role: 'host'
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Only the host can update session status' });
    }

    // Update session
    const updateData = { status };
    
    if (status === 'active' && !updateData.startedAt) {
      updateData.startedAt = new Date();
    } else if (status === 'paused') {
      updateData.pausedAt = new Date();
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    if (currentMode) {
      updateData.currentMode = currentMode;
    }

    const updatedSession = await prisma.teamSession.update({
      where: { id: sessionId },
      data: updateData,
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                photoURL: true,
                level: true
              }
            }
          }
        }
      }
    });

    res.json({
      message: 'Session status updated',
      teamSession: updatedSession
    });
  } catch (error) {
    next(error);
  }
};

// Send message in team session
export const sendTeamMessage = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Check if user is a participant
    const participant = await prisma.teamSessionParticipant.findFirst({
      where: {
        teamSessionId: sessionId,
        userId
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Not a participant in this session' });
    }

    // Create message
    const newMessage = await prisma.teamSessionMessage.create({
      data: {
        teamSessionId: sessionId,
        userId,
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

    res.json({
      message: 'Message sent',
      data: newMessage
    });
  } catch (error) {
    next(error);
  }
};

// Delete team session
export const deleteTeamSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Check if user is the host
    const participant = await prisma.teamSessionParticipant.findFirst({
      where: {
        teamSessionId: sessionId,
        userId,
        role: 'host'
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Only the host can delete the session' });
    }

    // Delete session (cascades to participants and messages)
    await prisma.teamSession.delete({
      where: { id: sessionId }
    });

    res.json({ message: 'Team session deleted' });
  } catch (error) {
    next(error);
  }
};