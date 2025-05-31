import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger.js';

async function seed() {
  try {
    logger.info('Starting database seed...');

    // Create achievements
    const achievements = [
      // Session achievements
      {
        name: '初めての一歩',
        description: '初めてのポモドーロセッションを完了',
        icon: '🎯',
        category: 'sessions',
        requirement: { totalSessions: 1 },
        xpReward: 50
      },
      {
        name: 'ポモドーロ愛好家',
        description: '10回のセッションを完了',
        icon: '🍅',
        category: 'sessions',
        requirement: { totalSessions: 10 },
        xpReward: 100
      },
      {
        name: 'ポモドーロマスター',
        description: '100回のセッションを完了',
        icon: '🏆',
        category: 'sessions',
        requirement: { totalSessions: 100 },
        xpReward: 500
      },
      {
        name: '時間の守護者',
        description: '1000分の集中時間を達成',
        icon: '⏰',
        category: 'sessions',
        requirement: { totalMinutes: 1000 },
        xpReward: 300
      },
      
      // Streak achievements
      {
        name: '習慣の芽生え',
        description: '3日連続でセッションを完了',
        icon: '🌱',
        category: 'streak',
        requirement: { streak: 3 },
        xpReward: 75
      },
      {
        name: '週間戦士',
        description: '7日連続でセッションを完了',
        icon: '🔥',
        category: 'streak',
        requirement: { streak: 7 },
        xpReward: 150
      },
      {
        name: '月間チャンピオン',
        description: '30日連続でセッションを完了',
        icon: '🌟',
        category: 'streak',
        requirement: { streak: 30 },
        xpReward: 500
      },
      
      // Level achievements
      {
        name: '成長の証',
        description: 'レベル5に到達',
        icon: '📈',
        category: 'level',
        requirement: { level: 5 },
        xpReward: 100
      },
      {
        name: '経験豊富',
        description: 'レベル10に到達',
        icon: '🎖️',
        category: 'level',
        requirement: { level: 10 },
        xpReward: 200
      },
      {
        name: 'レジェンド',
        description: 'レベル20に到達',
        icon: '👑',
        category: 'level',
        requirement: { level: 20 },
        xpReward: 1000
      },
      
      // Social achievements
      {
        name: '友達の輪',
        description: '初めての友達を追加',
        icon: '🤝',
        category: 'social',
        requirement: { friends: 1 },
        xpReward: 50
      },
      {
        name: 'ソーシャルバタフライ',
        description: '10人の友達を追加',
        icon: '🦋',
        category: 'social',
        requirement: { friends: 10 },
        xpReward: 200
      },
      {
        name: 'チームプレイヤー',
        description: '初めてのチームセッションを完了',
        icon: '👥',
        category: 'social',
        requirement: { teamSessions: 1 },
        xpReward: 100
      }
    ];

    for (const achievement of achievements) {
      await prisma.achievement.upsert({
        where: { name: achievement.name },
        update: achievement,
        create: achievement
      });
    }

    logger.info(`Created ${achievements.length} achievements`);

    // Create games
    const games = [
      {
        name: 'Memory Match',
        description: 'カードをめくって同じペアを見つけよう',
        type: 'memory',
        unlockLevel: 1
      },
      {
        name: 'Math Challenge',
        description: '素早く計算問題を解こう',
        type: 'math',
        unlockLevel: 1
      },
      {
        name: 'Word Scramble',
        description: 'バラバラになった文字を並び替えよう',
        type: 'word',
        unlockLevel: 3
      },
      {
        name: 'Color Match',
        description: '色と文字が一致するものを選ぼう',
        type: 'color',
        unlockLevel: 5
      },
      {
        name: 'Pattern Memory',
        description: 'パターンを覚えて再現しよう',
        type: 'pattern',
        unlockLevel: 7
      },
      {
        name: 'Number Puzzle',
        description: '数字を正しい順番に並べよう',
        type: 'puzzle',
        unlockLevel: 10
      },
      {
        name: 'Tap Target',
        description: '動くターゲットを素早くタップしよう',
        type: 'reaction',
        unlockLevel: 15
      }
    ];

    for (const game of games) {
      await prisma.game.upsert({
        where: { name: game.name },
        update: game,
        create: game
      });
    }

    logger.info(`Created ${games.length} games`);

    // Create demo users (optional)
    if (process.env.CREATE_DEMO_USERS === 'true') {
      const demoUsers = [
        {
          email: 'demo@example.com',
          password: await bcrypt.hash('demo123', 10),
          displayName: 'デモユーザー',
          level: 5,
          xp: 450,
          totalSessions: 25,
          totalMinutes: 625,
          currentStreak: 3
        },
        {
          email: 'test@example.com',
          password: await bcrypt.hash('test123', 10),
          displayName: 'テストユーザー',
          level: 3,
          xp: 200,
          totalSessions: 10,
          totalMinutes: 250,
          currentStreak: 1
        }
      ];

      for (const user of demoUsers) {
        await prisma.user.upsert({
          where: { email: user.email },
          update: user,
          create: user
        });
      }

      logger.info(`Created ${demoUsers.length} demo users`);
    }

    logger.info('Database seed completed successfully');
  } catch (error) {
    logger.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed
seed().catch(console.error);