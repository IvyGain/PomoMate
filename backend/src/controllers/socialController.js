import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

// フレンド一覧の取得
export const getFriends = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const friends = await db.friendship.findMany({
      where: {
        OR: [
          { userId: userId, status: 'ACCEPTED' },
          { friendId: userId, status: 'ACCEPTED' },
        ],
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            status: true,
          },
        },
        friend: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
            status: true,
          },
        },
      },
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
export const sendFriendRequest = async (req, res, next) => {
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
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (existingRequest) {
      return res.status(400).json({ error: '既にフレンドリクエストが存在します' });
    }

    const friendRequest = await db.friendship.create({
      data: {
        userId: userId,
        friendId: friendId,
        status: 'PENDING',
      },
    });

    res.status(201).json(friendRequest);
  } catch (error) {
    next(error);
  }
};

// フレンドリクエストの承認
export const acceptFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await db.friendship.findUnique({
      where: { id: requestId },
    });

    if (!request || request.friendId !== userId) {
      return res.status(404).json({ error: 'フレンドリクエストが見つかりません' });
    }

    const updatedRequest = await db.friendship.update({
      where: { id: requestId },
      data: { status: 'ACCEPTED' },
    });

    res.json(updatedRequest);
  } catch (error) {
    next(error);
  }
};

// フレンドリクエストの拒否
export const rejectFriendRequest = async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await db.friendship.findUnique({
      where: { id: requestId },
    });

    if (!request || request.friendId !== userId) {
      return res.status(404).json({ error: 'フレンドリクエストが見つかりません' });
    }

    await db.friendship.delete({
      where: { id: requestId },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// フレンドの削除
export const removeFriend = async (req, res, next) => {
  try {
    const { friendId } = req.params;
    const userId = req.user.id;

    const friendship = await db.friendship.findFirst({
      where: {
        OR: [
          { userId: userId, friendId: friendId, status: 'ACCEPTED' },
          { userId: friendId, friendId: userId, status: 'ACCEPTED' },
        ],
      },
    });

    if (!friendship) {
      return res.status(404).json({ error: 'フレンド関係が見つかりません' });
    }

    await db.friendship.delete({
      where: { id: friendship.id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// ペンディング中のフレンドリクエスト一覧
export const getPendingRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const pendingRequests = await db.friendship.findMany({
      where: {
        friendId: userId,
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    res.json(pendingRequests);
  } catch (error) {
    next(error);
  }
};

// 通知一覧の取得
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const notifications = await db.notification.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

// 通知を既読にする
export const markNotificationRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await db.notification.findFirst({
      where: {
        id: notificationId,
        userId: userId,
      },
    });

    if (!notification) {
      return res.status(404).json({ error: '通知が見つかりません' });
    }

    const updatedNotification = await db.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    res.json(updatedNotification);
  } catch (error) {
    next(error);
  }
};

// すべての通知を既読にする
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await db.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    res.json({ message: 'すべての通知を既読にしました' });
  } catch (error) {
    next(error);
  }
};