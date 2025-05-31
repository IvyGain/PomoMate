import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('シードデータの投入を開始...');

  // テストユーザーを作成
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'テストユーザー',
      profile: {
        create: {
          level: 5,
          xp: 250,
          totalSessions: 42,
          currentStreak: 7,
          longestStreak: 15,
          totalMinutes: 1050,
          selectedCharacterId: 'balanced_1',
        }
      }
    }
  });

  console.log('テストユーザーを作成:', testUser.email);

  // 実績を作成
  const achievements = [
    { id: 'first_session', name: '初めてのセッション', description: '最初のポモドーロセッションを完了', points: 10, icon: '🎯' },
    { id: 'early_bird', name: '早起き鳥', description: '午前6時前にセッションを完了', points: 20, icon: '🌅' },
    { id: 'night_owl', name: '夜のフクロウ', description: '午後10時以降にセッションを完了', points: 20, icon: '🦉' },
    { id: 'week_warrior', name: '週間戦士', description: '7日連続でセッションを完了', points: 50, icon: '🗓️' },
    { id: 'focus_master', name: 'フォーカスマスター', description: '100回のフォーカスセッションを完了', points: 100, icon: '🧘' },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { id: achievement.id },
      update: {},
      create: achievement
    });
  }

  console.log('実績を作成:', achievements.length);

  // キャラクターを作成
  const characters = [
    { id: 'balanced_1', name: 'ポモ', type: 'balanced', level: 1, requiredLevel: 1 },
    { id: 'balanced_2', name: 'ポモリン', type: 'balanced', level: 2, requiredLevel: 5 },
    { id: 'focused_1', name: 'フォーカ', type: 'focused', level: 1, requiredLevel: 1 },
    { id: 'focused_2', name: 'フォーカス', type: 'focused', level: 2, requiredLevel: 5 },
    { id: 'consistent_1', name: 'コンシス', type: 'consistent', level: 1, requiredLevel: 1 },
    { id: 'consistent_2', name: 'コンスタ', type: 'consistent', level: 2, requiredLevel: 5 },
  ];

  for (const character of characters) {
    await prisma.character.upsert({
      where: { id: character.id },
      update: {},
      create: character
    });
  }

  console.log('キャラクターを作成:', characters.length);

  // ゲームを作成
  const games = [
    { id: 'memory_match', name: 'メモリーマッチ', description: '記憶力を鍛えるカードマッチングゲーム', requiredLevel: 1 },
    { id: 'word_chain', name: 'しりとり', description: '語彙力を鍛える言葉遊び', requiredLevel: 3 },
    { id: 'math_puzzle', name: '数学パズル', description: '計算力を鍛える数学ゲーム', requiredLevel: 5 },
  ];

  for (const game of games) {
    await prisma.game.upsert({
      where: { id: game.id },
      update: {},
      create: game
    });
  }

  console.log('ゲームを作成:', games.length);

  // テストユーザーにいくつかの実績を解除
  await prisma.userAchievement.create({
    data: {
      userId: testUser.id,
      achievementId: 'first_session',
      unlockedAt: new Date()
    }
  });

  console.log('シードデータの投入が完了しました！');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });