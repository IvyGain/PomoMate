import prisma from '../config/database.js';
import { calculateXPForLevel } from '../utils/helpers.js';

// Get user statistics
export const getUserStats = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if requesting own stats or if friends
    if (userId !== req.user.id) {
      // Check if they are friends
      const friendship = await prisma.friend.findFirst({
        where: {
          OR: [
            { userId: req.user.id, friendId: userId },
            { userId: userId, friendId: req.user.id },
          ],
        },
      });

      if (!friendship) {
        return res.status(403).json({ error: 'Can only view friends\' stats' });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        displayName: true,
        photoURL: true,
        level: true,
        xp: true,
        totalSessions: true,
        totalMinutes: true,
        currentStreak: true,
        longestStreak: true,
        characterType: true,
        characterLevel: true,
        evolutionPath: true,
        createdAt: true,
        _count: {
          select: {
            achievements: true,
            friends: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate XP to next level
    const xpToNextLevel = calculateXPForLevel(user.level);

    res.json({
      ...user,
      xpToNextLevel,
      achievementCount: user._count.achievements,
      friendCount: user._count.friends,
    });
  } catch (error) {
    next(error);
  }
};

// Get user achievements
export const getUserAchievements = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check permissions (same as getUserStats)
    if (userId !== req.user.id) {
      const friendship = await prisma.friend.findFirst({
        where: {
          OR: [
            { userId: req.user.id, friendId: userId },
            { userId: userId, friendId: req.user.id },
          ],
        },
      });

      if (!friendship) {
        return res.status(403).json({ error: 'Can only view friends\' achievements' });
      }
    }

    const achievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true,
      },
      orderBy: { unlockedAt: 'desc' },
    });

    // Get all achievements to show locked ones
    const allAchievements = await prisma.achievement.findMany({
      orderBy: { category: 'asc' },
    });

    const unlockedIds = new Set(achievements.map(ua => ua.achievementId));

    const formattedAchievements = allAchievements.map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlockedAt: achievements.find(ua => ua.achievementId === achievement.id)?.unlockedAt,
    }));

    res.json({
      achievements: formattedAchievements,
      totalUnlocked: achievements.length,
      totalAvailable: allAchievements.length,
    });
  } catch (error) {
    next(error);
  }
};

// Update character
export const updateCharacter = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { characterType, evolutionPath } = req.body;

    // Can only update own character
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Cannot update other users\' characters' });
    }

    const updateData = {};
    if (characterType) updateData.characterType = characterType;
    if (evolutionPath) updateData.evolutionPath = evolutionPath;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        characterType: true,
        characterLevel: true,
        evolutionPath: true,
      },
    });

    res.json({
      message: 'Character updated',
      character: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Get active days
export const getActiveDays = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { year, month } = req.query;

    // Check permissions
    if (userId !== req.user.id) {
      const friendship = await prisma.friend.findFirst({
        where: {
          OR: [
            { userId: req.user.id, friendId: userId },
            { userId: userId, friendId: req.user.id },
          ],
        },
      });

      if (!friendship) {
        return res.status(403).json({ error: 'Can only view friends\' active days' });
      }
    }

    // Build date filter
    const where = { userId };
    if (year && month) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const activeDays = await prisma.activeDay.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    res.json({
      activeDays,
      total: activeDays.length,
    });
  } catch (error) {
    next(error);
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res, next) => {
  try {
    const { type = 'level', period = 'all', limit = 10 } = req.query;

    let orderBy = {};
    const where = {};

    // Determine sort field
    switch (type) {
      case 'level':
        orderBy = [{ level: 'desc' }, { xp: 'desc' }];
        break;
      case 'streak':
        orderBy = { currentStreak: 'desc' };
        break;
      case 'sessions':
        orderBy = { totalSessions: 'desc' };
        break;
      case 'minutes':
        orderBy = { totalMinutes: 'desc' };
        break;
      default:
        orderBy = [{ level: 'desc' }, { xp: 'desc' }];
    }

    // Add time filter for recent activity
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      where.lastActiveDate = { gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      where.lastActiveDate = { gte: monthAgo };
    }

    // Get top users
    const users = await prisma.user.findMany({
      where,
      orderBy,
      take: parseInt(limit),
      select: {
        id: true,
        displayName: true,
        photoURL: true,
        level: true,
        xp: true,
        currentStreak: true,
        totalSessions: true,
        totalMinutes: true,
      },
    });

    // Get user's rank
    let userRank = null;
    if (req.user) {
      const userStats = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          level: true,
          xp: true,
          currentStreak: true,
          totalSessions: true,
          totalMinutes: true,
        },
      });

      if (userStats) {
        // Count users with better stats
        let betterCount = 0;
        switch (type) {
          case 'level':
            betterCount = await prisma.user.count({
              where: {
                OR: [
                  { level: { gt: userStats.level } },
                  { 
                    level: userStats.level,
                    xp: { gt: userStats.xp },
                  },
                ],
              },
            });
            break;
          case 'streak':
            betterCount = await prisma.user.count({
              where: { currentStreak: { gt: userStats.currentStreak } },
            });
            break;
          case 'sessions':
            betterCount = await prisma.user.count({
              where: { totalSessions: { gt: userStats.totalSessions } },
            });
            break;
          case 'minutes':
            betterCount = await prisma.user.count({
              where: { totalMinutes: { gt: userStats.totalMinutes } },
            });
            break;
        }
        userRank = betterCount + 1;
      }
    }

    res.json({
      leaderboard: users,
      userRank,
    });
  } catch (error) {
    next(error);
  }
};