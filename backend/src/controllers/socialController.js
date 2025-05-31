const prisma = require('@prisma/client').PrismaClient;
const db = new prisma();

// フレンド一覧の取得
exports.getFriends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const friends = await db.friendship.findMany({
      where: {
        OR: [
          { userId: userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            status: true
          }
        },
        friend: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            status: true
          }
        }
      }
    });

    const friendsList = friends.map(friendship => {
      return friendship.userId === userId ? friendship.friend : friendship.user;
    });

    res.json(friendsList);
  } catch (error) {
    next(error);
  }
};

// フレンドリクエストの送信
exports.sendFriendRequest = async (req, res, next) => {
  try {
    const { friendId } = req.body;
    const userId = req.user.id;

    if (userId === friendId) {
      return res.status(400).json({ error: '自分自身にフレンドリクエストを送ることはできません' });
    }

    // 既存のリクエストをチェック
    const existingRequest = await db.friendship.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: friendId },
          { userId: friendId, friendId: userId }
        ]
      }
    });

    if (existingRequest) {
      return res.status(400).json({ error: '既にフレンドリクエストが存在します' });
    }

    const friendRequest = await db.friendship.create({
      data: {
        userId: userId,
        friendId: friendId,
        status: 'PENDING'
      }
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    next(error);
  }
};

// フレンドリクエストの承認
exports.acceptFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await db.friendship.findUnique({
      where: { id: requestId }
    });

    if (!request || request.friendId !== userId) {
      return res.status(404).json({ error: 'フレンドリクエストが見つかりません' });
    }

    const updatedRequest = await db.friendship.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' }
    });

    res.json(updatedRequest);
  } catch (error) {
    next(error);
  }
};

// フレンドリクエストの拒否
exports.rejectFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await db.friendship.findUnique({
      where: { id: requestId }
    });

    if (!request || request.friendId !== userId) {
      return res.status(404).json({ error: 'フレンドリクエストが見つかりません' });
    }

    await db.friendship.delete({
      where: { id: requestId }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// フレンドの削除
exports.removeFriend = async (req, res, next) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    const friendship = await db.friendship.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: friendId, status: 'ACCEPTED' },
          { userId: friendId, friendId: userId, status: 'ACCEPTED' }
        ]
      }
    });

    if (!friendship) {
      return res.status(404).json({ error: 'フレンド関係が見つかりません' });
    }

    await db.friendship.delete({
      where: { id: friendship.id }
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// ペンディング中のフレンドリクエスト一覧
exports.getPendingRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const pendingRequests = await db.friendship.findMany({
      where: {
        friendId: userId,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    res.json(pendingRequests);
  } catch (error) {
    next(error);
  }
};