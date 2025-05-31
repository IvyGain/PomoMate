import prisma from '../config/database.js';
import { 
  calculateSessionXP, 
  checkLevelUp, 
  calculateStreak,
  determineCharacterEvolution 
} from '../utils/helpers.js';
import dayjs from 'dayjs';

// Record a completed session
export const createSession = async (req, res, next) => {
  try {
    const { type, duration, teamSessionId } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!['focus', 'break', 'longBreak'].includes(type)) {
      return res.status(400).json({ error: 'Invalid session type' });
    }

    if (!duration || duration < 1) {
      return res.status(400).json({ error: 'Invalid duration' });
    }

    // Get user's current stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        level: true,
        xp: true,
        currentStreak: true,
        longestStreak: true,
        lastActiveDate: true,
        totalSessions: true,
        totalMinutes: true,
        characterType: true,
        characterLevel: true,
        evolutionPath: true
      }
    });

    // Calculate streak
    const newStreak = calculateStreak(user.lastActiveDate, user.currentStreak);
    const longestStreak = Math.max(newStreak, user.longestStreak);

    // Calculate XP
    const xpEarned = calculateSessionXP(duration, type, newStreak);
    const newTotalXP = user.xp + xpEarned;

    // Check for level up
    const levelUpResult = checkLevelUp(newTotalXP, user.level);
    const newLevel = levelUpResult.shouldLevelUp ? levelUpResult.newLevel : user.level;
    const currentXP = levelUpResult.shouldLevelUp ? levelUpResult.remainingXP : newTotalXP;

    // Update active days
    const today = dayjs().startOf('day').toDate();
    await prisma.activeDay.upsert({
      where: {
        userId_date: {
          userId,
          date: today
        }
      },
      create: {
        userId,
        date: today,
        sessionsCount: 1,
        totalMinutes: duration
      },
      update: {
        sessionsCount: { increment: 1 },
        totalMinutes: { increment: duration }
      }
    });

    // Get total active days count
    const activeDaysCount = await prisma.activeDay.count({
      where: { userId }
    });

    // Check for character evolution
    const newTotalSessions = user.totalSessions + 1;
    const characterType = determineCharacterEvolution(
      newTotalSessions,
      newStreak,
      activeDaysCount
    );

    // Update character evolution path if type changed
    let evolutionPath = user.evolutionPath;
    if (characterType !== user.characterType && user.characterLevel < 5) {
      evolutionPath = [...user.evolutionPath, characterType];
    }

    // Create session record
    const session = await prisma.session.create({
      data: {
        userId,
        type,
        duration,
        xpEarned,
        teamSessionId
      }
    });

    // Update user stats
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        level: newLevel,
        xp: currentXP,
        totalSessions: { increment: 1 },
        totalMinutes: { increment: duration },
        currentStreak: newStreak,
        longestStreak,
        lastActiveDate: new Date(),
        characterType,
        evolutionPath
      }
    });

    // Check achievements (simplified)
    const achievements = await checkAchievements(userId, {
      totalSessions: newTotalSessions,
      totalMinutes: user.totalMinutes + duration,
      currentStreak: newStreak,
      level: newLevel
    });

    res.json({
      session,
      stats: {
        xpEarned,
        levelUp: levelUpResult.shouldLevelUp,
        newLevel,
        currentXP,
        streak: newStreak,
        achievements
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's sessions
export const getUserSessions = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const userId = req.user.id;

    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
      include: {
        teamSession: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    const total = await prisma.session.count({
      where: { userId }
    });

    res.json({
      sessions,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    next(error);
  }
};

// Get session statistics
export const getSessionStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { period = 'week' } = req.query;

    // Calculate date range
    let startDate = dayjs();
    switch (period) {
      case 'day':
        startDate = startDate.startOf('day');
        break;
      case 'week':
        startDate = startDate.subtract(7, 'days').startOf('day');
        break;
      case 'month':
        startDate = startDate.subtract(30, 'days').startOf('day');
        break;
      case 'year':
        startDate = startDate.subtract(365, 'days').startOf('day');
        break;
      default:
        startDate = startDate.subtract(7, 'days').startOf('day');
    }

    // Get sessions in date range
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        completedAt: {
          gte: startDate.toDate()
        }
      },
      orderBy: { completedAt: 'asc' }
    });

    // Get active days
    const activeDays = await prisma.activeDay.findMany({
      where: {
        userId,
        date: {
          gte: startDate.toDate()
        }
      },
      orderBy: { date: 'asc' }
    });

    // Calculate stats
    const stats = {
      totalSessions: sessions.length,
      totalMinutes: sessions.reduce((sum, s) => sum + s.duration, 0),
      totalXP: sessions.reduce((sum, s) => sum + s.xpEarned, 0),
      focusSessions: sessions.filter(s => s.type === 'focus').length,
      breakSessions: sessions.filter(s => s.type === 'break' || s.type === 'longBreak').length,
      averageSessionLength: sessions.length > 0 
        ? Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length)
        : 0,
      activeDays: activeDays.length,
      sessionsPerDay: []
    };

    // Group sessions by day
    const sessionsByDay = {};
    sessions.forEach(session => {
      const day = dayjs(session.completedAt).format('YYYY-MM-DD');
      if (!sessionsByDay[day]) {
        sessionsByDay[day] = {
          date: day,
          sessions: 0,
          minutes: 0,
          xp: 0
        };
      }
      sessionsByDay[day].sessions++;
      sessionsByDay[day].minutes += session.duration;
      sessionsByDay[day].xp += session.xpEarned;
    });

    stats.sessionsPerDay = Object.values(sessionsByDay);

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// Helper function to check achievements
async function checkAchievements(userId, stats) {
  const unlockedAchievements = [];

  // Get all achievements
  const achievements = await prisma.achievement.findMany();
  
  // Get user's unlocked achievements
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true }
  });
  
  const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));

  // Check each achievement
  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;

    let unlocked = false;
    const req = achievement.requirement;

    switch (achievement.category) {
      case 'sessions':
        if (req.totalSessions && stats.totalSessions >= req.totalSessions) {
          unlocked = true;
        }
        if (req.totalMinutes && stats.totalMinutes >= req.totalMinutes) {
          unlocked = true;
        }
        break;
      case 'streak':
        if (req.streak && stats.currentStreak >= req.streak) {
          unlocked = true;
        }
        break;
      case 'level':
        if (req.level && stats.level >= req.level) {
          unlocked = true;
        }
        break;
    }

    if (unlocked) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id
        }
      });
      unlockedAchievements.push(achievement);
    }
  }

  return unlockedAchievements;
}