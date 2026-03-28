export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  sessions: number;
  streak: number;
  lastSessionDate: string | null;
  totalMinutes: number;
  unlockedAchievements: string[];
  totalDays: number;
  totalSessions: number;
  activeDays: string[];
  playedGames: string[];
  gamePlayCount: number;
  teamSessionsCompleted: number;
  teamSessionMinutes: number;
}

export interface Friend {
  userId: string;
  friendId: string;
  displayName: string;
  photoURL?: string;
  level: number;
  status: 'pending' | 'accepted';
  createdAt: string;
}

export interface TeamSession {
  id: string;
  name: string;
  creatorId: string;
  members: string[];
  duration: number;
  startTime: string | null;
  status: 'waiting' | 'active' | 'completed';
  createdAt: string;
}

export interface Achievement {
  userId: string;
  achievementId: string;
  unlockedAt: string;
}

class MemoryDatabase {
  private users: Map<string, User> = new Map();
  private friends: Map<string, Friend[]> = new Map();
  private teamSessions: Map<string, TeamSession> = new Map();
  private achievements: Map<string, Achievement[]> = new Map();
  
  getUser(id: string): User | undefined {
    return this.users.get(id);
  }
  
  createUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }
  
  updateUser(id: string, data: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }
  
  getFriends(userId: string): Friend[] {
    return this.friends.get(userId) || [];
  }
  
  addFriend(userId: string, friend: Friend): void {
    const userFriends = this.friends.get(userId) || [];
    userFriends.push(friend);
    this.friends.set(userId, userFriends);
  }
  
  removeFriend(userId: string, friendId: string): void {
    const userFriends = this.friends.get(userId) || [];
    const filtered = userFriends.filter(f => f.friendId !== friendId);
    this.friends.set(userId, filtered);
  }
  
  updateFriendStatus(userId: string, friendId: string, status: 'accepted' | 'pending'): void {
    const userFriends = this.friends.get(userId) || [];
    const friend = userFriends.find(f => f.friendId === friendId);
    if (friend) {
      friend.status = status;
    }
  }
  
  getTeamSessions(): TeamSession[] {
    return Array.from(this.teamSessions.values());
  }
  
  getTeamSession(id: string): TeamSession | undefined {
    return this.teamSessions.get(id);
  }
  
  createTeamSession(session: TeamSession): TeamSession {
    this.teamSessions.set(session.id, session);
    return session;
  }
  
  updateTeamSession(id: string, data: Partial<TeamSession>): TeamSession | undefined {
    const session = this.teamSessions.get(id);
    if (!session) return undefined;
    
    const updated = { ...session, ...data };
    this.teamSessions.set(id, updated);
    return updated;
  }
  
  deleteTeamSession(id: string): void {
    this.teamSessions.delete(id);
  }
  
  getAchievements(userId: string): Achievement[] {
    return this.achievements.get(userId) || [];
  }
  
  addAchievement(userId: string, achievement: Achievement): void {
    const userAchievements = this.achievements.get(userId) || [];
    
    const exists = userAchievements.some(a => a.achievementId === achievement.achievementId);
    if (exists) return;
    
    userAchievements.push(achievement);
    this.achievements.set(userId, userAchievements);
  }
}

export const db = new MemoryDatabase();
