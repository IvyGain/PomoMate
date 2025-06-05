import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

// ゲーム一覧の取得
export const getGames = async (req, res, next) => {
  try {
    const games = await db.game.findMany({
      include: {
        _count: {
          select: { userGames: true },
        },
      },
    });

    res.json(games);
  } catch (error) {
    next(error);
  }
};

// 特定のゲームの詳細取得
export const getGameById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const game = await db.game.findUnique({
      where: { id },
      include: {
        _count: {
          select: { userGames: true },
        },
      },
    });

    if (!game) {
      return res.status(404).json({ error: 'ゲームが見つかりません' });
    }

    res.json(game);
  } catch (error) {
    next(error);
  }
};

// ユーザーのゲーム統計情報を取得
export const getUserGameStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const userGames = await db.userGame.findMany({
      where: { userId },
      include: {
        game: true,
      },
    });

    const stats = userGames.map(userGame => ({
      gameId: userGame.gameId,
      gameName: userGame.game.name,
      highScore: userGame.highScore,
      totalScore: userGame.totalScore,
      gamesPlayed: userGame.gamesPlayed,
      achievements: userGame.achievements,
    }));

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

// ゲームスコアの更新
export const updateGameScore = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { score, sessionId } = req.body;
    const userId = req.user.id;

    // ゲームの存在確認
    const game = await db.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return res.status(404).json({ error: 'ゲームが見つかりません' });
    }

    // ユーザーゲーム統計の取得または作成
    let userGame = await db.userGame.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
    });

    if (!userGame) {
      userGame = await db.userGame.create({
        data: {
          userId,
          gameId,
          highScore: score,
          totalScore: score,
          gamesPlayed: 1,
        },
      });
    } else {
      // 統計の更新
      const newHighScore = Math.max(userGame.highScore, score);
      const newTotalScore = userGame.totalScore + score;
      const newGamesPlayed = userGame.gamesPlayed + 1;

      userGame = await db.userGame.update({
        where: {
          userId_gameId: {
            userId,
            gameId,
          },
        },
        data: {
          highScore: newHighScore,
          totalScore: newTotalScore,
          gamesPlayed: newGamesPlayed,
        },
      });
    }

    // ゲームセッションの記録
    const gameSession = await db.gameSession.create({
      data: {
        userId,
        gameId,
        score,
        sessionId,
        playedAt: new Date(),
      },
    });

    res.json({
      userGame,
      gameSession,
    });
  } catch (error) {
    next(error);
  }
};

// リーダーボードの取得
export const getLeaderboard = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const { period = 'all' } = req.query; // all, daily, weekly, monthly

    let dateFilter = {};
    const now = new Date();

    switch (period) {
      case 'daily':
        dateFilter = {
          playedAt: {
            gte: new Date(now.setHours(0, 0, 0, 0)),
          },
        };
        break;
      case 'weekly':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        dateFilter = {
          playedAt: {
            gte: weekAgo,
          },
        };
        break;
      case 'monthly':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        dateFilter = {
          playedAt: {
            gte: monthAgo,
          },
        };
        break;
    }

    // 高スコアランキング
    const leaderboard = await db.gameSession.findMany({
      where: {
        gameId,
        ...dateFilter,
      },
      select: {
        userId: true,
        score: true,
        playedAt: true,
        user: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        score: 'desc',
      },
      take: 100,
      distinct: ['userId'],
    });

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
};

// アチーブメントの取得
export const getAchievements = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    const userGame = await db.userGame.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
    });

    const achievements = userGame?.achievements || [];

    // 利用可能なアチーブメント一覧
    const availableAchievements = await db.achievement.findMany({
      where: { gameId },
    });

    const achievementStatus = availableAchievements.map(achievement => ({
      ...achievement,
      unlocked: achievements.includes(achievement.id),
      unlockedAt: userGame?.updatedAt,
    }));

    res.json(achievementStatus);
  } catch (error) {
    next(error);
  }
};

// アチーブメントの解除
export const unlockAchievement = async (req, res, next) => {
  try {
    const { gameId, achievementId } = req.params;
    const userId = req.user.id;

    const userGame = await db.userGame.findUnique({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
    });

    if (!userGame) {
      return res.status(404).json({ error: 'ゲーム記録が見つかりません' });
    }

    const achievements = userGame.achievements || [];
    
    if (achievements.includes(achievementId)) {
      return res.status(400).json({ error: 'このアチーブメントは既に解除されています' });
    }

    achievements.push(achievementId);

    const updatedUserGame = await db.userGame.update({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
      data: {
        achievements,
      },
    });

    res.json(updatedUserGame);
  } catch (error) {
    next(error);
  }
};

// ゲームスコア一覧の取得（リーダーボードのエイリアス）
export const getGameScores = getLeaderboard;

// スコアの送信（updateGameScoreのエイリアス）
export const submitScore = updateGameScore;

// ゲームのアンロック
export const unlockGame = async (req, res, next) => {
  try {
    const { gameId } = req.params;
    const userId = req.user.id;

    // ゲームの存在確認
    const game = await db.game.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return res.status(404).json({ error: 'ゲームが見つかりません' });
    }

    // ユーザーゲーム記録の作成または更新
    const userGame = await db.userGame.upsert({
      where: {
        userId_gameId: {
          userId,
          gameId,
        },
      },
      update: {
        unlocked: true,
      },
      create: {
        userId,
        gameId,
        unlocked: true,
        highScore: 0,
        totalScore: 0,
        gamesPlayed: 0,
      },
    });

    res.json(userGame);
  } catch (error) {
    next(error);
  }
};