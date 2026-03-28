import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  FlatList,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';
import { spacing, fontSizes, borderRadius } from '@/constants/theme';
import {
  Users,
  Globe,
  Share2,
  MessageCircle,
  Heart,
  Award,
  Clock,
  Flame,
  Plus,
  Search,
  Send,
  X,
  User,
  UserPlus,
  Check,
  Copy,
  Bell,
  Timer,
  UserCheck,
  UserX,
  MessageSquare,
  Settings,
  Mic,
  MicOff,
  Play,
  Pause,
} from 'lucide-react-native';
import { useSocialStore } from '@/store/socialStore';
import { useTimerStore, TeamSession } from '@/store/timerStore';
import { TeamSessionModal } from './TeamSessionModal';

// Mock data for friends
const mockFriends = [
  {
    id: '1',
    name: '田中 健太',
    username: 'kenta_t',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&auto=format&fit=crop',
    level: 8,
    streak: 12,
    lastActive: '今日',
    status: 'オンライン',
  },
  {
    id: '2',
    name: '佐藤 美咲',
    username: 'misaki_s',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop',
    level: 15,
    streak: 30,
    lastActive: '3時間前',
    status: 'オフライン',
  },
  {
    id: '3',
    name: '鈴木 大輔',
    username: 'daisuke_s',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop',
    level: 5,
    streak: 7,
    lastActive: '昨日',
    status: 'オフライン',
  },
  {
    id: '4',
    name: '山田 花子',
    username: 'hanako_y',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop',
    level: 12,
    streak: 22,
    lastActive: '今日',
    status: 'オンライン',
  },
];

// Mock data for community posts
const mockPosts = [
  {
    id: '1',
    user: {
      name: '田中 健太',
      username: 'kenta_t',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&auto=format&fit=crop',
      level: 8,
    },
    content: '今日は3時間の集中作業を達成！プロジェクトがかなり進みました。',
    timestamp: '1時間前',
    likes: 12,
    comments: 3,
    achievement: {
      title: '3時間達成',
      icon: 'Clock',
    },
  },
  {
    id: '2',
    user: {
      name: '佐藤 美咲',
      username: 'misaki_s',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop',
      level: 15,
    },
    content: '30日連続でポモドーロを続けています！習慣化の力はすごい。',
    timestamp: '3時間前',
    likes: 24,
    comments: 7,
    achievement: {
      title: '30日連続達成',
      icon: 'Flame',
    },
  },
  {
    id: '3',
    user: {
      name: '鈴木 大輔',
      username: 'daisuke_s',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop',
      level: 5,
    },
    content: 'PomoMateを使い始めて1週間。集中力が明らかに上がっています！',
    timestamp: '昨日',
    likes: 8,
    comments: 2,
  },
  {
    id: '4',
    user: {
      name: '山田 花子',
      username: 'hanako_y',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop',
      level: 12,
    },
    content: '新しい実績を解除しました！「早起きの達人」',
    timestamp: '2日前',
    likes: 15,
    comments: 4,
    achievement: {
      title: '早起きの達人',
      icon: 'Award',
    },
  },
  {
    id: '5',
    user: {
      name: '伊藤 直樹',
      username: 'naoki_i',
      avatar: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&auto=format&fit=crop',
      level: 10,
    },
    content: '友達と一緒にチームポモドーロセッションを試してみました。一人よりもモチベーションが上がります！',
    timestamp: '3日前',
    likes: 28,
    comments: 9,
    achievement: {
      title: 'チームプレイヤー',
      icon: 'Users',
    },
  },
];

// Mock data for friend suggestions
const mockSuggestions = [
  {
    id: '5',
    name: '伊藤 直樹',
    username: 'naoki_i',
    avatar: 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&auto=format&fit=crop',
    level: 10,
    mutualFriends: 2,
  },
  {
    id: '6',
    name: '高橋 真理',
    username: 'mari_t',
    avatar: 'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=400&auto=format&fit=crop',
    level: 7,
    mutualFriends: 1,
  },
  {
    id: '7',
    name: '渡辺 健一',
    username: 'kenichi_w',
    avatar: 'https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=400&auto=format&fit=crop',
    level: 14,
    mutualFriends: 3,
  },
];

export const SocialFeatures: React.FC = () => {
  const { theme } = useThemeStore();
  const { level, streak, sessions, totalMinutes, teamSessionsCompleted } = useUserStore();
  const { 
    friendCode, 
    generateFriendCode, 
    friends, 
    pendingRequests, 
    addFriend, 
    acceptFriendRequest, 
    rejectFriendRequest,
    notifications,
    markNotificationAsRead,
    sendFriendRequest,
    loadFriendsFromBackend
  } = useSocialStore();
  
  const {
    teamSessions,
    createTeamSession,
    joinTeamSession,
    startTeamSession,
    pauseTeamSession,
    leaveTeamSession,
    isTeamSession,
    currentTeamSessionId,
    isRunning,
  } = useTimerStore();
  
  const [activeTab, setActiveTab] = useState<'friends' | 'community'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showFriendCodeModal, setShowFriendCodeModal] = useState(false);
  const [showJointSessionModal, setShowJointSessionModal] = useState(false);
  const [showFriendRequestsModal, setShowFriendRequestsModal] = useState(false);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showTeamSessionModal, setShowTeamSessionModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<any>(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<{[key: string]: any[]}>({});
  const [activeJointSessions, setActiveJointSessions] = useState<any[]>([]);
  const [micEnabled, setMicEnabled] = useState(false);
  
  useEffect(() => {
    console.log('[SOCIAL] Loading friends from backend...');
    loadFriendsFromBackend();
  }, []);
  
  // Handle like post
  const handleLikePost = (postId: string) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter(id => id !== postId));
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: post.likes - 1 } : post
      ));
    } else {
      setLikedPosts([...likedPosts, postId]);
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    }
  };
  
  // Handle add friend
  const handleAddFriend = (friendId: string) => {
    const newFriend = mockSuggestions.find(suggestion => suggestion.id === friendId);
    if (newFriend) {
      addFriend({
        id: newFriend.id,
        name: newFriend.name,
        username: newFriend.username,
        avatar: newFriend.avatar,
        level: newFriend.level,
        streak: Math.floor(Math.random() * 20),
        lastActive: '今',
        status: 'オフライン',
      });
    }
    setShowAddFriendModal(false);
  };
  
  // Handle create post
  const handleCreatePost = () => {
    if (postContent.trim()) {
      const newPost = {
        id: Date.now().toString(),
        user: {
          name: 'あなた',
          username: 'you',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop',
          level,
        },
        content: postContent,
        timestamp: '今',
        likes: 0,
        comments: 0,
      };
      setPosts([newPost, ...posts]);
      setPostContent('');
      setShowCreatePostModal(false);
    }
  };
  
  // Share friend code
  const handleShareFriendCode = async () => {
    if (!friendCode) {
      generateFriendCode();
      return;
    }
    
    try {
      await Share.share({
        message: `PomoMateで友達になりましょう！私のフレンドコードは ${friendCode} です。`,
      });
    } catch (error) {
      Alert.alert('エラー', '共有できませんでした');
    }
  };
  
  // Copy friend code to clipboard
  const handleCopyFriendCode = () => {
    if (!friendCode) return;
    
    try {
      // For web, we'll use a different approach since expo-clipboard might not be available
      if (Platform.OS === 'web') {
        // Create a temporary textarea element
        const textarea = document.createElement('textarea');
        textarea.value = friendCode;
        
        // Make the textarea out of viewport
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        textarea.style.top = '-999999px';
        document.body.appendChild(textarea);
        
        // Select and copy
        textarea.focus();
        textarea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (successful) {
          Alert.alert('コピー完了', 'フレンドコードをコピーしました');
        } else {
          // Fallback for when execCommand doesn't work
          Alert.alert('コピーできませんでした', `あなたのフレンドコード: ${friendCode}`);
        }
      } else {
        // For native platforms, we'll just show the code in an alert
        Alert.alert(
          'フレンドコード', 
          friendCode,
          [
            { text: 'OK', onPress: () => console.log('OK Pressed') }
          ]
        );
      }
    } catch (error) {
      // If all else fails, just show the code
      Alert.alert('フレンドコード', `あなたのフレンドコード: ${friendCode}`);
      console.error('Clipboard error:', error);
    }
  };
  
  // Send friend request
  const handleSendFriendRequest = () => {
    if (friendCodeInput.trim()) {
      sendFriendRequest(friendCodeInput.trim());
      setFriendCodeInput('');
      Alert.alert('リクエスト送信', 'フレンドリクエストを送信しました');
    }
  };
  
  // Start team session
  const handleStartTeamSession = (friend: any) => {
    setSelectedFriend(friend);
    setShowTeamSessionModal(true);
  };
  
  // Toggle microphone
  const handleToggleMic = () => {
    setMicEnabled(!micEnabled);
    
    // In a real app, this would enable/disable the microphone
    // For this demo, we'll just show an alert
    if (!micEnabled) {
      Alert.alert('マイク', 'マイクをオンにしました');
    } else {
      Alert.alert('マイク', 'マイクをオフにしました');
    }
  };
  
  // Send message
  const handleSendMessage = () => {
    if (selectedFriend && messageText.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'me',
        text: messageText,
        timestamp: new Date().toISOString(),
      };
      
      const friendId = selectedFriend.id;
      const existingMessages = messages[friendId] || [];
      
      setMessages({
        ...messages,
        [friendId]: [...existingMessages, newMessage],
      });
      
      setMessageText('');
      
      // Simulate friend reply
      setTimeout(() => {
        const replyMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'friend',
          text: '了解しました！頑張りましょう！',
          timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => ({
          ...prev,
          [friendId]: [...(prev[friendId] || []), replyMessage],
        }));
      }, 2000);
    }
  };
  
  // Filter friends by search query
  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Local state for posts
  const [posts, setPosts] = useState(mockPosts);
  
  // Render friend item
  const renderFriendItem = ({ item }: { item: any }) => (
    <View style={[styles.friendCard, { backgroundColor: theme.card }]}>
      <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
      <View style={styles.friendInfo}>
        <Text style={[styles.friendName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.friendUsername, { color: theme.textSecondary }]}>@{item.username}</Text>
        <View style={styles.friendStats}>
          <View style={styles.friendStat}>
            <Award size={14} color={theme.primary} />
            <Text style={[styles.friendStatText, { color: theme.textSecondary }]}>Lv.{item.level}</Text>
          </View>
          <View style={styles.friendStat}>
            <Flame size={14} color={theme.warning} />
            <Text style={[styles.friendStatText, { color: theme.textSecondary }]}>{item.streak}日連続</Text>
          </View>
        </View>
      </View>
      <View style={styles.friendActions}>
        <View style={[
          styles.statusIndicator, 
          { backgroundColor: item.status === 'オンライン' ? theme.success : theme.inactive }
        ]} />
        <Text style={[styles.lastActiveText, { color: theme.textSecondary }]}>{item.lastActive}</Text>
        
        <TouchableOpacity 
          style={[styles.jointSessionButton, { backgroundColor: theme.primary }]}
          onPress={() => handleStartTeamSession(item)}
        >
          <Timer size={14} color={theme.text} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.messageButton, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
          onPress={() => {
            setSelectedFriend(item);
            setShowMessagesModal(true);
          }}
        >
          <MessageSquare size={14} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render post item
  const renderPostItem = ({ item }: { item: any }) => (
    <View style={[styles.postCard, { backgroundColor: theme.card }]}>
      <View style={styles.postHeader}>
        <View style={styles.postUser}>
          <Image source={{ uri: item.user.avatar }} style={styles.postAvatar} />
          <View>
            <Text style={[styles.postUserName, { color: theme.text }]}>{item.user.name}</Text>
            <Text style={[styles.postUsername, { color: theme.textSecondary }]}>@{item.user.username} • Lv.{item.user.level}</Text>
          </View>
        </View>
        <Text style={[styles.postTimestamp, { color: theme.textSecondary }]}>{item.timestamp}</Text>
      </View>
      
      <Text style={[styles.postContent, { color: theme.text }]}>{item.content}</Text>
      
      {item.achievement && (
        <View style={[styles.achievementBadge, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
          {item.achievement.icon === 'Clock' && <Clock size={16} color={theme.primary} />}
          {item.achievement.icon === 'Flame' && <Flame size={16} color={theme.warning} />}
          {item.achievement.icon === 'Award' && <Award size={16} color={theme.secondary} />}
          {item.achievement.icon === 'Users' && <Users size={16} color={theme.primary} />}
          <Text style={[styles.achievementText, { color: theme.text }]}>{item.achievement.title}</Text>
        </View>
      )}
      
      <View style={styles.postActions}>
        <TouchableOpacity 
          style={styles.postAction}
          onPress={() => handleLikePost(item.id)}
        >
          <Heart 
            size={18} 
            color={likedPosts.includes(item.id) ? theme.error : theme.textSecondary}
            fill={likedPosts.includes(item.id) ? theme.error : 'transparent'}
          />
          <Text style={[styles.postActionText, { color: theme.textSecondary }]}>{item.likes}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.postAction}>
          <MessageCircle size={18} color={theme.textSecondary} />
          <Text style={[styles.postActionText, { color: theme.textSecondary }]}>{item.comments}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.postAction}>
          <Share2 size={18} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render suggestion item
  const renderSuggestionItem = ({ item }: { item: any }) => (
    <View style={[styles.suggestionItem, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
      <Image source={{ uri: item.avatar }} style={styles.suggestionAvatar} />
      <View style={styles.suggestionInfo}>
        <Text style={[styles.suggestionName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.suggestionUsername, { color: theme.textSecondary }]}>@{item.username} • Lv.{item.level}</Text>
        <Text style={[styles.mutualFriends, { color: theme.textSecondary }]}>
          共通の友達 {item.mutualFriends}人
        </Text>
      </View>
      <TouchableOpacity 
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => handleAddFriend(item.id)}
      >
        <UserPlus size={16} color={theme.text} />
      </TouchableOpacity>
    </View>
  );
  
  // Render notification item
  const renderNotificationItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.notificationItem, 
        { backgroundColor: item.read ? 'transparent' : 'rgba(255, 255, 255, 0.05)' }
      ]}
      onPress={() => markNotificationAsRead(item.id)}
    >
      <View style={[styles.notificationIcon, { backgroundColor: theme.primary }]}>
        {item.type === 'friendRequest' && <UserPlus size={18} color={theme.text} />}
        {item.type === 'friendAccepted' && <UserCheck size={18} color={theme.text} />}
        {item.type === 'jointSession' && <Timer size={18} color={theme.text} />}
        {item.type === 'achievement' && <Award size={18} color={theme.text} />}
        {item.type === 'message' && <MessageSquare size={18} color={theme.text} />}
      </View>
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationText, { color: theme.text }]}>{item.message}</Text>
        <Text style={[styles.notificationTime, { color: theme.textSecondary }]}>{item.time}</Text>
      </View>
      {!item.read && (
        <View style={[styles.unreadIndicator, { backgroundColor: theme.primary }]} />
      )}
    </TouchableOpacity>
  );
  
  // Render friend request item
  const renderFriendRequestItem = ({ item }: { item: any }) => (
    <View style={[styles.friendRequestItem, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
      <Image source={{ uri: item.avatar }} style={styles.friendRequestAvatar} />
      <View style={styles.friendRequestInfo}>
        <Text style={[styles.friendRequestName, { color: theme.text }]}>{item.name}</Text>
        <Text style={[styles.friendRequestUsername, { color: theme.textSecondary }]}>@{item.username} • Lv.{item.level}</Text>
        <Text style={[styles.friendRequestTime, { color: theme.textSecondary }]}>{item.time}</Text>
      </View>
      <View style={styles.friendRequestActions}>
        <TouchableOpacity 
          style={[styles.acceptButton, { backgroundColor: theme.success }]}
          onPress={() => acceptFriendRequest(item.id)}
        >
          <UserCheck size={16} color={theme.text} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.rejectButton, { backgroundColor: theme.error }]}
          onPress={() => rejectFriendRequest(item.id)}
        >
          <UserX size={16} color={theme.text} />
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // Render message item
  const renderMessageItem = ({ item }: { item: any }) => (
    <View style={[
      styles.messageItem,
      item.sender === 'me' ? styles.myMessage : styles.friendMessage,
      { backgroundColor: item.sender === 'me' ? theme.primary : 'rgba(255, 255, 255, 0.1)' }
    ]}>
      <Text style={[
        styles.messageText,
        { color: item.sender === 'me' ? theme.text : theme.text }
      ]}>
        {item.text}
      </Text>
      <Text style={[
        styles.messageTime,
        { color: item.sender === 'me' ? 'rgba(255, 255, 255, 0.7)' : theme.textSecondary }
      ]}>
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
  
  // Render team session item
  const renderTeamSessionItem = ({ item }: { item: TeamSession }) => (
    <View style={[styles.teamSessionItem, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
      <View style={styles.teamSessionHeader}>
        <Text style={[styles.teamSessionName, { color: theme.text }]}>{item.name}</Text>
        <View style={[
          styles.teamSessionStatus, 
          { backgroundColor: item.isRunning ? theme.success + '40' : theme.warning + '40' }
        ]}>
          <Text style={[
            styles.teamSessionStatusText, 
            { color: item.isRunning ? theme.success : theme.warning }
          ]}>
            {item.isRunning ? '進行中' : '一時停止'}
          </Text>
        </View>
      </View>
      
      <View style={styles.teamSessionInfo}>
        <View style={styles.teamSessionDetail}>
          <Users size={16} color={theme.textSecondary} />
          <Text style={[styles.teamSessionDetailText, { color: theme.textSecondary }]}>
            {item.participants.filter(p => p.isActive).length}人参加中
          </Text>
        </View>
        
        <View style={styles.teamSessionDetail}>
          <Clock size={16} color={theme.textSecondary} />
          <Text style={[styles.teamSessionDetailText, { color: theme.textSecondary }]}>
            {Math.floor(item.timeRemaining / 60)}:{(item.timeRemaining % 60).toString().padStart(2, '0')}
          </Text>
        </View>
        
        <View style={styles.teamSessionDetail}>
          <Award size={16} color={theme.textSecondary} />
          <Text style={[styles.teamSessionDetailText, { color: theme.textSecondary }]}>
            XP +20%
          </Text>
        </View>
      </View>
      
      <View style={styles.teamSessionControls}>
        {item.id === currentTeamSessionId ? (
          <>
            <TouchableOpacity
              style={[
                styles.teamSessionControl,
                { backgroundColor: item.isRunning ? theme.warning : theme.success }
              ]}
              onPress={() => {
                if (item.isRunning) {
                  pauseTeamSession(item.id);
                } else {
                  startTeamSession(item.id);
                }
              }}
            >
              {item.isRunning ? (
                <Pause size={16} color={theme.text} />
              ) : (
                <Play size={16} color={theme.text} />
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.teamSessionControl, { backgroundColor: theme.error }]}
              onPress={() => {
                Alert.alert(
                  'セッションを退出',
                  'このセッションから退出しますか？',
                  [
                    {
                      text: 'キャンセル',
                      style: 'cancel'
                    },
                    {
                      text: '退出',
                      style: 'destructive',
                      onPress: () => leaveTeamSession(item.id, 'user_id')
                    }
                  ]
                );
              }}
            >
              <X size={16} color={theme.text} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.teamSessionControl,
                { backgroundColor: micEnabled ? theme.primary : 'rgba(255, 255, 255, 0.1)' }
              ]}
              onPress={handleToggleMic}
            >
              {micEnabled ? (
                <Mic size={16} color={theme.text} />
              ) : (
                <MicOff size={16} color={theme.textSecondary} />
              )}
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.joinButton, { backgroundColor: theme.primary }]}
            onPress={() => {
              joinTeamSession(
                item.id,
                'user_id', // In a real app, this would be the user's ID
                'あなた', // In a real app, this would be the user's name
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop' // In a real app, this would be the user's avatar
              );
            }}
          >
            <Text style={[styles.joinButtonText, { color: theme.text }]}>参加</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header with notifications */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>ソーシャル</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={() => setShowFriendRequestsModal(true)}
          >
            <UserPlus size={24} color={theme.textSecondary} />
            {pendingRequests.length > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                <Text style={[styles.badgeText, { color: theme.text }]}>{pendingRequests.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={() => setShowNotificationsModal(true)}
          >
            <Bell size={24} color={theme.textSecondary} />
            {notifications.filter(n => !n.read).length > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                <Text style={[styles.badgeText, { color: theme.text }]}>
                  {notifications.filter(n => !n.read).length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerAction}
            onPress={() => setShowFriendCodeModal(true)}
          >
            <User size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'friends' && [styles.activeTab, { borderBottomColor: theme.primary }]
          ]}
          onPress={() => setActiveTab('friends')}
        >
          <Users size={20} color={activeTab === 'friends' ? theme.primary : theme.textSecondary} />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'friends' ? theme.primary : theme.textSecondary }
          ]}>
            フレンド
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'community' && [styles.activeTab, { borderBottomColor: theme.primary }]
          ]}
          onPress={() => setActiveTab('community')}
        >
          <Globe size={20} color={activeTab === 'community' ? theme.primary : theme.textSecondary} />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'community' ? theme.primary : theme.textSecondary }
          ]}>
            コミュニティ
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <View style={styles.tabContent}>
          <View style={[styles.searchContainer, { backgroundColor: theme.card }]}>
            <Search size={18} color={theme.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="フレンドを検索..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity
              style={[styles.addFriendButton, { backgroundColor: theme.primary }]}
              onPress={() => setShowAddFriendModal(true)}
            >
              <Plus size={18} color={theme.text} />
            </TouchableOpacity>
          </View>
          
          {/* Team Sessions Section */}
          <View style={styles.teamSessionsContainer}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                チームセッション
              </Text>
              <TouchableOpacity
                style={[styles.createTeamButton, { backgroundColor: theme.primary }]}
                onPress={() => setShowTeamSessionModal(true)}
              >
                <Plus size={16} color={theme.text} />
                <Text style={[styles.createTeamButtonText, { color: theme.text }]}>
                  作成
                </Text>
              </TouchableOpacity>
            </View>
            
            {teamSessions.length > 0 ? (
              <FlatList
                data={teamSessions}
                renderItem={renderTeamSessionItem}
                keyExtractor={item => `team-session-${item.id}`}
                horizontal={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.teamSessionsList}
              />
            ) : (
              <View style={[styles.emptyTeamSessions, { backgroundColor: theme.card }]}>
                <Users size={24} color={theme.textSecondary} />
                <Text style={[styles.emptyTeamSessionsText, { color: theme.textSecondary }]}>
                  アクティブなチームセッションはありません
                </Text>
                <TouchableOpacity
                  style={[styles.createTeamButtonLarge, { backgroundColor: theme.primary }]}
                  onPress={() => setShowTeamSessionModal(true)}
                >
                  <Text style={[styles.createTeamButtonLargeText, { color: theme.text }]}>
                    チームセッションを作成
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          <View style={styles.friendsListContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              フレンド ({friends.length})
            </Text>
            
            {filteredFriends.length > 0 ? (
              <FlatList
                data={filteredFriends}
                renderItem={renderFriendItem}
                keyExtractor={item => `friend-${item.id}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.friendsList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Users size={40} color={theme.textSecondary} />
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  {searchQuery ? '検索結果が見つかりません' : 'フレンドがいません'}
                </Text>
                <TouchableOpacity
                  style={[styles.emptyStateButton, { backgroundColor: theme.primary }]}
                  onPress={() => setShowAddFriendModal(true)}
                >
                  <Text style={[styles.emptyStateButtonText, { color: theme.text }]}>
                    フレンドを追加
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
      
      {/* Community Tab */}
      {activeTab === 'community' && (
        <View style={styles.tabContent}>
          <View style={styles.myStatsContainer}>
            <View style={[styles.myStatsCard, { backgroundColor: theme.card }]}>
              <View style={styles.myStatsHeader}>
                <Text style={[styles.myStatsTitle, { color: theme.text }]}>あなたの統計</Text>
                <TouchableOpacity
                  style={[styles.shareButton, { backgroundColor: theme.primary }]}
                  onPress={() => setShowCreatePostModal(true)}
                >
                  <Share2 size={16} color={theme.text} />
                  <Text style={[styles.shareButtonText, { color: theme.text }]}>シェア</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.myStatsList}>
                <View style={styles.myStat}>
                  <Award size={18} color={theme.primary} />
                  <Text style={[styles.myStatValue, { color: theme.text }]}>Lv.{level}</Text>
                  <Text style={[styles.myStatLabel, { color: theme.textSecondary }]}>レベル</Text>
                </View>
                
                <View style={styles.myStat}>
                  <Flame size={18} color={theme.warning} />
                  <Text style={[styles.myStatValue, { color: theme.text }]}>{streak}</Text>
                  <Text style={[styles.myStatLabel, { color: theme.textSecondary }]}>連続日数</Text>
                </View>
                
                <View style={styles.myStat}>
                  <Clock size={18} color={theme.secondary} />
                  <Text style={[styles.myStatValue, { color: theme.text }]}>{sessions}</Text>
                  <Text style={[styles.myStatLabel, { color: theme.textSecondary }]}>セッション</Text>
                </View>
                
                <View style={styles.myStat}>
                  <Users size={18} color={theme.primary} />
                  <Text style={[styles.myStatValue, { color: theme.text }]}>{teamSessionsCompleted}</Text>
                  <Text style={[styles.myStatLabel, { color: theme.textSecondary }]}>チーム</Text>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.postsContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>最近の投稿</Text>
            
            <TouchableOpacity
              style={[styles.createPostButton, { backgroundColor: theme.card }]}
              onPress={() => setShowCreatePostModal(true)}
            >
              <Text style={[styles.createPostText, { color: theme.textSecondary }]}>
                何か共有しましょう...
              </Text>
            </TouchableOpacity>
            
            <FlatList
              data={posts}
              renderItem={renderPostItem}
              keyExtractor={item => `post-${item.id}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.postsList}
            />
          </View>
        </View>
      )}
      
      {/* Add Friend Modal */}
      <Modal
        visible={showAddFriendModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddFriendModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>フレンドを追加</Text>
              <TouchableOpacity onPress={() => setShowAddFriendModal(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.modalSearchContainer, { backgroundColor: theme.card }]}>
              <Search size={18} color={theme.textSecondary} />
              <TextInput
                style={[styles.modalSearchInput, { color: theme.text }]}
                placeholder="ユーザー名で検索..."
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            
            <View style={styles.friendCodeContainer}>
              <Text style={[styles.friendCodeTitle, { color: theme.text }]}>フレンドコードで追加</Text>
              <View style={[styles.friendCodeInputContainer, { backgroundColor: theme.card }]}>
                <TextInput
                  style={[styles.friendCodeInput, { color: theme.text }]}
                  placeholder="フレンドコードを入力..."
                  placeholderTextColor={theme.textSecondary}
                  value={friendCodeInput}
                  onChangeText={setFriendCodeInput}
                />
                <TouchableOpacity
                  style={[styles.sendRequestButton, { backgroundColor: theme.primary }]}
                  onPress={handleSendFriendRequest}
                >
                  <Send size={18} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>
            
            <Text style={[styles.suggestionsTitle, { color: theme.text }]}>おすすめのユーザー</Text>
            
            <FlatList
              data={mockSuggestions}
              renderItem={renderSuggestionItem}
              keyExtractor={item => `suggestion-${item.id}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsList}
            />
          </View>
        </View>
      </Modal>
      
      {/* Create Post Modal */}
      <Modal
        visible={showCreatePostModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreatePostModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>投稿を作成</Text>
              <TouchableOpacity onPress={() => setShowCreatePostModal(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.createPostContainer}>
              <View style={styles.createPostHeader}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop' }} 
                  style={styles.createPostAvatar} 
                />
                <View>
                  <Text style={[styles.createPostName, { color: theme.text }]}>あなた</Text>
                  <Text style={[styles.createPostLevel, { color: theme.textSecondary }]}>Lv.{level}</Text>
                </View>
              </View>
              
              <TextInput
                style={[styles.createPostInput, { color: theme.text, backgroundColor: theme.card }]}
                placeholder="何を共有しますか？"
                placeholderTextColor={theme.textSecondary}
                multiline
                value={postContent}
                onChangeText={setPostContent}
              />
              
              <View style={styles.createPostStats}>
                <Text style={[styles.createPostStatsTitle, { color: theme.text }]}>統計を含める:</Text>
                
                <View style={styles.createPostStatsList}>
                  <TouchableOpacity 
                    style={[styles.createPostStat, { backgroundColor: theme.card }]}
                  >
                    <Award size={16} color={theme.primary} />
                    <Text style={[styles.createPostStatText, { color: theme.text }]}>
                      Lv.{level}
                    </Text>
                    <Check size={16} color={theme.success} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.createPostStat, { backgroundColor: theme.card }]}
                  >
                    <Flame size={16} color={theme.warning} />
                    <Text style={[styles.createPostStatText, { color: theme.text }]}>
                      {streak}日連続
                    </Text>
                    <Check size={16} color={theme.success} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.createPostStat, { backgroundColor: theme.card }]}
                  >
                    <Clock size={16} color={theme.secondary} />
                    <Text style={[styles.createPostStatText, { color: theme.text }]}>
                      {totalMinutes}分
                    </Text>
                    <Check size={16} color={theme.success} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.createPostStat, { backgroundColor: theme.card }]}
                  >
                    <Users size={16} color={theme.primary} />
                    <Text style={[styles.createPostStatText, { color: theme.text }]}>
                      チーム {teamSessionsCompleted}回
                    </Text>
                    <Check size={16} color={theme.success} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.createPostButton2,
                  { backgroundColor: postContent.trim() ? theme.primary : theme.inactive }
                ]}
                onPress={handleCreatePost}
                disabled={!postContent.trim()}
              >
                <Text style={[styles.createPostButtonText, { color: theme.text }]}>投稿する</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>通知</Text>
              <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            {notifications.length > 0 ? (
              <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={item => `notification-${item.id}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.notificationsList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Bell size={40} color={theme.textSecondary} />
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  通知はありません
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Friend Code Modal */}
      <Modal
        visible={showFriendCodeModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFriendCodeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>マイプロフィール</Text>
              <TouchableOpacity onPress={() => setShowFriendCodeModal(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileContainer}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop' }} 
                style={styles.profileAvatar} 
              />
              <Text style={[styles.profileName, { color: theme.text }]}>あなた</Text>
              <Text style={[styles.profileUsername, { color: theme.textSecondary }]}>@you • Lv.{level}</Text>
              
              <View style={styles.profileStats}>
                <View style={styles.profileStat}>
                  <Text style={[styles.profileStatValue, { color: theme.text }]}>{friends.length}</Text>
                  <Text style={[styles.profileStatLabel, { color: theme.textSecondary }]}>フレンド</Text>
                </View>
                <View style={styles.profileStat}>
                  <Text style={[styles.profileStatValue, { color: theme.text }]}>{streak}</Text>
                  <Text style={[styles.profileStatLabel, { color: theme.textSecondary }]}>連続日数</Text>
                </View>
                <View style={styles.profileStat}>
                  <Text style={[styles.profileStatValue, { color: theme.text }]}>{sessions}</Text>
                  <Text style={[styles.profileStatLabel, { color: theme.textSecondary }]}>セッション</Text>
                </View>
                <View style={styles.profileStat}>
                  <Text style={[styles.profileStatValue, { color: theme.text }]}>{teamSessionsCompleted}</Text>
                  <Text style={[styles.profileStatLabel, { color: theme.textSecondary }]}>チーム</Text>
                </View>
              </View>
              
              <View style={[styles.friendCodeDisplay, { backgroundColor: theme.card }]}>
                <Text style={[styles.friendCodeLabel, { color: theme.textSecondary }]}>
                  あなたのフレンドコード
                </Text>
                <View style={styles.friendCodeRow}>
                  <TextInput
                    style={[styles.friendCode, { color: theme.text }]}
                    value={friendCode || '生成されていません'}
                    editable={false}
                  />
                  {friendCode && (
                    <TouchableOpacity onPress={handleCopyFriendCode}>
                      <Copy size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              
              <TouchableOpacity
                style={[styles.generateCodeButton, { backgroundColor: theme.primary }]}
                onPress={handleShareFriendCode}
              >
                <Text style={[styles.generateCodeButtonText, { color: theme.text }]}>
                  {friendCode ? 'フレンドコードを共有' : 'フレンドコードを生成'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.settingsButton, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
              >
                <Settings size={16} color={theme.textSecondary} />
                <Text style={[styles.settingsButtonText, { color: theme.textSecondary }]}>
                  プロフィール設定
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Friend Requests Modal */}
      <Modal
        visible={showFriendRequestsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFriendRequestsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>フレンドリクエスト</Text>
              <TouchableOpacity onPress={() => setShowFriendRequestsModal(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            {pendingRequests.length > 0 ? (
              <FlatList
                data={pendingRequests}
                renderItem={renderFriendRequestItem}
                keyExtractor={item => `request-${item.id}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.friendRequestsList}
              />
            ) : (
              <View style={styles.emptyState}>
                <UserPlus size={40} color={theme.textSecondary} />
                <Text style={[styles.emptyStateText, { color: theme.textSecondary }]}>
                  保留中のリクエストはありません
                </Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Messages Modal */}
      <Modal
        visible={showMessagesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMessagesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {selectedFriend ? selectedFriend.name : 'メッセージ'}
              </Text>
              <TouchableOpacity onPress={() => setShowMessagesModal(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            {selectedFriend && (
              <View style={styles.messagesContainer}>
                <FlatList
                  data={messages[selectedFriend.id] || []}
                  renderItem={renderMessageItem}
                  keyExtractor={item => `message-${item.id}`}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.messagesList}
                  inverted={false}
                />
                
                <View style={[styles.messageInputContainer, { backgroundColor: theme.card }]}>
                  <TextInput
                    style={[styles.messageInput, { color: theme.text }]}
                    placeholder="メッセージを入力..."
                    placeholderTextColor={theme.textSecondary}
                    value={messageText}
                    onChangeText={setMessageText}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendMessageButton,
                      { backgroundColor: messageText.trim() ? theme.primary : theme.inactive }
                    ]}
                    onPress={handleSendMessage}
                    disabled={!messageText.trim()}
                  >
                    <Send size={18} color={theme.text} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
      
      {/* Team Session Modal */}
      <TeamSessionModal
        visible={showTeamSessionModal}
        onClose={() => setShowTeamSessionModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    marginLeft: spacing.md,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSizes.md,
  },
  addFriendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  teamSessionsContainer: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
  },
  createTeamButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  createTeamButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  teamSessionsList: {
    paddingBottom: spacing.sm,
  },
  teamSessionItem: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  teamSessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  teamSessionName: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  teamSessionStatus: {
    paddingVertical: spacing.xs / 2,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  teamSessionStatusText: {
    fontSize: fontSizes.xs,
    fontWeight: '500',
  },
  teamSessionInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  teamSessionDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  teamSessionDetailText: {
    fontSize: fontSizes.sm,
  },
  teamSessionControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  teamSessionControl: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  joinButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  emptyTeamSessions: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTeamSessionsText: {
    fontSize: fontSizes.md,
    marginVertical: spacing.md,
    textAlign: 'center',
  },
  createTeamButtonLarge: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  createTeamButtonLargeText: {
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  friendsListContainer: {
    flex: 1,
  },
  friendsList: {
    paddingBottom: spacing.xl,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  friendInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  friendName: {
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  friendUsername: {
    fontSize: fontSizes.sm,
  },
  friendStats: {
    flexDirection: 'row',
    marginTop: 4,
    gap: spacing.md,
  },
  friendStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  friendStatText: {
    fontSize: fontSizes.xs,
  },
  friendActions: {
    alignItems: 'flex-end',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  lastActiveText: {
    fontSize: fontSizes.xs,
    marginBottom: spacing.sm,
  },
  jointSessionButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  messageButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    fontSize: fontSizes.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  emptyStateButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emptyStateButtonText: {
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  myStatsContainer: {
    marginBottom: spacing.md,
  },
  myStatsCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  myStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  myStatsTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  shareButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  myStatsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  myStat: {
    alignItems: 'center',
  },
  myStatValue: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginTop: 4,
  },
  myStatLabel: {
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
  postsContainer: {
    flex: 1,
  },
  createPostButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  createPostText: {
    fontSize: fontSizes.md,
  },
  postsList: {
    paddingBottom: spacing.xl,
  },
  postCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  postUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  postUserName: {
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  postUsername: {
    fontSize: fontSizes.sm,
  },
  postTimestamp: {
    fontSize: fontSizes.xs,
  },
  postContent: {
    fontSize: fontSizes.md,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  achievementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  achievementText: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: spacing.sm,
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.sm,
  },
  postActionText: {
    fontSize: fontSizes.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  modalSearchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSizes.md,
  },
  friendCodeContainer: {
    padding: spacing.md,
  },
  friendCodeTitle: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  friendCodeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  friendCodeInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSizes.md,
  },
  sendRequestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  suggestionsTitle: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    margin: spacing.md,
  },
  suggestionsList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  suggestionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  suggestionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  suggestionName: {
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  suggestionUsername: {
    fontSize: fontSizes.sm,
  },
  mutualFriends: {
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createPostContainer: {
    padding: spacing.md,
  },
  createPostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  createPostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.md,
  },
  createPostName: {
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  createPostLevel: {
    fontSize: fontSizes.sm,
  },
  createPostInput: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
    fontSize: fontSizes.md,
  },
  createPostStats: {
    marginBottom: spacing.md,
  },
  createPostStatsTitle: {
    fontSize: fontSizes.md,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  createPostStatsList: {
    gap: spacing.sm,
  },
  createPostStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  createPostStatText: {
    flex: 1,
    fontSize: fontSizes.md,
    marginLeft: spacing.sm,
  },
  createPostButton2: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  createPostButtonText: {
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  notificationsList: {
    padding: spacing.md,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: fontSizes.md,
  },
  notificationTime: {
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: spacing.sm,
  },
  profileContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: spacing.md,
  },
  profileName: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  profileUsername: {
    fontSize: fontSizes.md,
    marginBottom: spacing.md,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: spacing.lg,
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  profileStatLabel: {
    fontSize: fontSizes.sm,
  },
  friendCodeDisplay: {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  friendCodeLabel: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.sm,
  },
  friendCodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  friendCode: {
    fontSize: fontSizes.lg,
    fontWeight: '500',
  },
  generateCodeButton: {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  generateCodeButtonText: {
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  settingsButtonText: {
    fontSize: fontSizes.md,
  },
  friendRequestsList: {
    padding: spacing.md,
  },
  friendRequestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  friendRequestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  friendRequestInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  friendRequestName: {
    fontSize: fontSizes.md,
    fontWeight: '500',
  },
  friendRequestUsername: {
    fontSize: fontSizes.sm,
  },
  friendRequestTime: {
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
  friendRequestActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
    padding: spacing.md,
  },
  messagesList: {
    flexGrow: 1,
    paddingVertical: spacing.md,
  },
  messageItem: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  myMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 0,
  },
  friendMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: fontSizes.md,
  },
  messageTime: {
    fontSize: fontSizes.xs,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  messageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  messageInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: fontSizes.md,
  },
  sendMessageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
});