import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  level: number;
  streak: number;
  lastActive: string;
  status: 'オンライン' | 'オフライン';
}

export interface FriendRequest {
  id: string;
  name: string;
  username: string;
  avatar: string;
  level: number;
  time: string;
}

export interface Notification {
  id: string;
  type: 'friendRequest' | 'friendAccepted' | 'jointSession' | 'achievement' | 'message';
  message: string;
  time: string;
  read: boolean;
}

interface SocialState {
  friendCode: string | null;
  friends: Friend[];
  pendingRequests: FriendRequest[];
  notifications: Notification[];
  
  // Actions
  generateFriendCode: () => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (friendId: string) => void;
  sendFriendRequest: (friendCode: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  rejectFriendRequest: (requestId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'time' | 'read'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
}

// Generate a random friend code
const generateRandomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Generate a random avatar URL
const getRandomAvatar = () => {
  const avatars = [
    'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=400&auto=format&fit=crop',
  ];
  
  return avatars[Math.floor(Math.random() * avatars.length)];
};

// Generate a random Japanese name
const getRandomJapaneseName = () => {
  const firstNames = ['健太', '直樹', '大輔', '真理', '花子', '美咲', '裕子', '拓也', '翔太', '陽子'];
  const lastNames = ['田中', '佐藤', '鈴木', '高橋', '伊藤', '渡辺', '山田', '中村', '小林', '加藤'];
  
  return `${lastNames[Math.floor(Math.random() * lastNames.length)]} ${firstNames[Math.floor(Math.random() * firstNames.length)]}`;
};

// Generate a random username
const getRandomUsername = (name: string) => {
  const nameParts = name.split(' ');
  const initial = nameParts[0].charAt(0).toLowerCase();
  const lastName = nameParts[1].toLowerCase();
  return `${lastName}_${initial}${Math.floor(Math.random() * 100)}`;
};

// Generate a random time string
const getRandomTimeString = () => {
  const times = ['今', '5分前', '10分前', '30分前', '1時間前', '3時間前', '昨日', '2日前'];
  return times[Math.floor(Math.random() * times.length)];
};

export const useSocialStore = create<SocialState>()(
  persist(
    (set, get) => ({
      friendCode: null,
      friends: [],
      pendingRequests: [],
      notifications: [],
      
      generateFriendCode: () => {
        const code = generateRandomCode();
        set({ friendCode: code });
        
        // Add a notification about the new friend code
        get().addNotification({
          type: 'message',
          message: 'フレンドコードが生成されました。友達に共有しましょう！',
        });
      },
      
      addFriend: (friend: Friend) => {
        const { friends } = get();
        
        // Check if friend already exists
        if (friends.some(f => f.id === friend.id)) {
          return;
        }
        
        set({ friends: [...friends, friend] });
        
        // Add a notification
        get().addNotification({
          type: 'friendAccepted',
          message: `${friend.name}さんがフレンドになりました！`,
        });
      },
      
      removeFriend: (friendId: string) => {
        const { friends } = get();
        set({ friends: friends.filter(friend => friend.id !== friendId) });
      },
      
      sendFriendRequest: (friendCode: string) => {
        // In a real app, this would send a request to a server
        // For this demo, we'll simulate receiving a friend request after a delay
        setTimeout(() => {
          const name = getRandomJapaneseName();
          const newRequest: FriendRequest = {
            id: Date.now().toString(),
            name,
            username: getRandomUsername(name),
            avatar: getRandomAvatar(),
            level: Math.floor(Math.random() * 20) + 1,
            time: '今',
          };
          
          set(state => ({
            pendingRequests: [...state.pendingRequests, newRequest]
          }));
          
          // Add a notification
          get().addNotification({
            type: 'friendRequest',
            message: `${newRequest.name}さんからフレンドリクエストが届きました`,
          });
        }, 2000);
      },
      
      acceptFriendRequest: (requestId: string) => {
        const { pendingRequests } = get();
        const request = pendingRequests.find(req => req.id === requestId);
        
        if (request) {
          // Add as friend
          const newFriend: Friend = {
            id: request.id,
            name: request.name,
            username: request.username,
            avatar: request.avatar,
            level: request.level,
            streak: Math.floor(Math.random() * 20) + 1,
            lastActive: '今',
            status: Math.random() > 0.5 ? 'オンライン' : 'オフライン',
          };
          
          get().addFriend(newFriend);
          
          // Remove from pending requests
          set({
            pendingRequests: pendingRequests.filter(req => req.id !== requestId)
          });
          
          // Add a notification
          get().addNotification({
            type: 'friendAccepted',
            message: `${request.name}さんのフレンドリクエストを承認しました`,
          });
        }
      },
      
      rejectFriendRequest: (requestId: string) => {
        const { pendingRequests } = get();
        set({
          pendingRequests: pendingRequests.filter(req => req.id !== requestId)
        });
      },
      
      addNotification: (notification) => {
        const newNotification: Notification = {
          id: Date.now().toString(),
          ...notification,
          time: getRandomTimeString(),
          read: false,
        };
        
        set(state => ({
          notifications: [newNotification, ...state.notifications]
        }));
      },
      
      markNotificationAsRead: (notificationId: string) => {
        set(state => ({
          notifications: state.notifications.map(notification => 
            notification.id === notificationId 
              ? { ...notification, read: true } 
              : notification
          )
        }));
      },
      
      markAllNotificationsAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(notification => ({ ...notification, read: true }))
        }));
      },
    }),
    {
      name: 'social-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);