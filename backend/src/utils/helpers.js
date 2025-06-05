import dayjs from 'dayjs';

// Generate a unique friend code
export const generateFriendCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Calculate XP for next level
export const calculateXPForLevel = (level) => {
  // Base XP: 100, increases by 50 per level
  return 100 + (level - 1) * 50;
};

// Calculate total XP needed for a level
export const calculateTotalXPForLevel = (level) => {
  let totalXP = 0;
  for (let i = 1; i < level; i++) {
    totalXP += calculateXPForLevel(i);
  }
  return totalXP;
};

// Calculate XP earned from a session
export const calculateSessionXP = (duration, type, streak = 0) => {
  let baseXP = duration * 2; // 2 XP per minute
  
  // Type bonuses
  if (type === 'focus') {
    baseXP *= 1.2; // 20% bonus for focus sessions
  }
  
  // Streak bonuses
  if (streak > 0) {
    const streakBonus = Math.min(streak * 0.02, 0.5); // 2% per day, max 50%
    baseXP *= (1 + streakBonus);
  }
  
  return Math.round(baseXP);
};

// Check if user should level up
export const checkLevelUp = (currentXP, currentLevel) => {
  const xpForNextLevel = calculateXPForLevel(currentLevel);
  if (currentXP >= xpForNextLevel) {
    return {
      shouldLevelUp: true,
      newLevel: currentLevel + 1,
      remainingXP: currentXP - xpForNextLevel,
    };
  }
  return { shouldLevelUp: false };
};

// Calculate streak
export const calculateStreak = (lastActiveDate, currentStreak) => {
  if (!lastActiveDate) return 1;
  
  const lastActive = dayjs(lastActiveDate);
  const today = dayjs().startOf('day');
  const yesterday = today.subtract(1, 'day');
  
  // If last active was today, maintain streak
  if (lastActive.isSame(today, 'day')) {
    return currentStreak;
  }
  
  // If last active was yesterday, increment streak
  if (lastActive.isSame(yesterday, 'day')) {
    return currentStreak + 1;
  }
  
  // Otherwise, reset streak
  return 1;
};

// Determine character evolution
export const determineCharacterEvolution = (sessions, streak, totalDays) => {
  // Simple logic: check which stat is highest
  if (sessions > streak * 3 && sessions > totalDays * 2) {
    return 'focused'; // User completes many sessions
  } else if (streak > sessions / 3 && streak > totalDays) {
    return 'consistent'; // User has long streaks
  } else {
    return 'balanced'; // Default balanced type
  }
};

// Format duration for display
export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

// Generate team session code
export const generateTeamSessionCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};