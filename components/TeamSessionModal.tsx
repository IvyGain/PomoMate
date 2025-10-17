import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  Alert,
  Platform,
  Switch,
  KeyboardAvoidingView,
  Keyboard,
  Animated,
  Dimensions,
} from 'react-native';
import { useTimerStore, TeamSession, TeamSessionParticipant, ChatMessage } from '@/store/timerStore';
import { useUserStore } from '@/store/userStore';
import { useSocialStore } from '@/store/socialStore';
import { useThemeStore } from '@/store/themeStore';
import { spacing, fontSizes, borderRadius } from '@/constants/theme';
import {
  X,
  Users,
  UserPlus,
  Copy,
  Share2,
  Mic,
  MicOff,
  Play,
  Pause,
  Clock,
  Coffee,
  Timer,
  Check,
  AlertCircle,
  UserCheck,
  Settings,
  ChevronRight,
  MessageCircle,
  Send,
  Info,
  User,
  Clock3,
} from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TeamSessionModalProps {
  visible: boolean;
  onClose: () => void;
}

type ActiveTab = 'create' | 'join' | 'active';
type ActiveView = 'timer' | 'chat' | 'participants';

export const TeamSessionModal: React.FC<TeamSessionModalProps> = ({ visible, onClose }) => {
  const { theme } = useThemeStore();
  const insets = useSafeAreaInsets();
  const { 
    createTeamSession, 
    joinTeamSession, 
    leaveTeamSession, 
    startTeamSession, 
    pauseTeamSession,
    setTeamSessionMode,
    toggleVoiceChat,
    setParticipantReady,
    getTeamSession,
    deleteTeamSession,
    sendMessage,
    teamSessions,
    currentTeamSessionId,
    isTeamSession,
    currentMode,
    timeRemaining,
    isRunning,
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
  } = useTimerStore();
  
  const { friends } = useSocialStore();
  const { addSession } = useUserStore();
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('create');
  const [activeView, setActiveView] = useState<ActiveView>('timer');
  const [sessionName, setSessionName] = useState('');
  const [sessionCode, setSessionCode] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [micEnabled, setMicEnabled] = useState(false);
  const [activeSession, setActiveSession] = useState<TeamSession | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [messageText, setMessageText] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Refs for DOM elements
  const modalRef = useRef<View>(null);
  const chatListRef = useRef<FlatList>(null);
  const messageInputRef = useRef<TextInput>(null);
  
  // Animation values
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Load active session if exists
  useEffect(() => {
    if (isTeamSession && currentTeamSessionId) {
      const session = getTeamSession(currentTeamSessionId);
      if (session) {
        setActiveSession(session);
        setActiveTab('active');
      }
    } else {
      setActiveSession(null);
      setActiveTab('create');
    }
  }, [isTeamSession, currentTeamSessionId, teamSessions]);
  
  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        if (chatListRef.current && activeSession?.messages?.length) {
          chatListRef.current.scrollToEnd({ animated: true });
        }
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Slide animation for tab changes
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: activeView === 'timer' ? 0 : activeView === 'chat' ? 1 : 2,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [activeView, slideAnim]);
  
  // Format time to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format date to readable time
  const formatMessageTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get mode name in Japanese
  const getModeName = (mode: 'focus' | 'shortBreak' | 'longBreak'): string => {
    switch (mode) {
      case 'focus':
        return "フォーカス";
      case 'shortBreak':
        return "小休憩";
      case 'longBreak':
        return "長休憩";
      default:
        return "フォーカス";
    }
  };
  
  // Get mode color
  const getModeColor = (mode: 'focus' | 'shortBreak' | 'longBreak'): string => {
    switch (mode) {
      case 'focus':
        return theme.primary;
      case 'shortBreak':
        return theme.secondary;
      case 'longBreak':
        return theme.success;
      default:
        return theme.primary;
    }
  };
  
  // Handle create session
  const handleCreateSession = () => {
    if (!sessionName.trim()) {
      Alert.alert("エラー", "セッション名を入力してください");
      return;
    }
    
    // Create a new team session
    const sessionId = createTeamSession(
      sessionName,
      "user_id", // In a real app, this would be the user's ID
      "You", // In a real app, this would be the user's name
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop" // In a real app, this would be the user's avatar
    );
    
    // Invite selected friends (in a real app, this would send invitations)
    selectedFriends.forEach(friendId => {
      const friend = friends.find(f => f.id === friendId);
      if (friend) {
        // Simulate friend joining
        setTimeout(() => {
          joinTeamSession(sessionId, friend.id, friend.name, friend.avatar);
          
          // Simulate friend getting ready
          setTimeout(() => {
            setParticipantReady(sessionId, friend.id, true);
          }, 2000);
        }, 1000 + Math.random() * 3000);
      }
    });
    
    // Reset form
    setSessionName('');
    setSelectedFriends([]);
    
    // Switch to active tab
    setActiveTab('active');
    setActiveView('timer');
    
    // Play sound if enabled
    playSound();
    
    // Vibrate if not on web
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  // Handle join session
  const handleJoinSession = () => {
    if (!sessionCode.trim()) {
      Alert.alert("エラー", "セッションコードを入力してください");
      return;
    }
    
    // Check if session exists
    const session = teamSessions.find(s => s.id === sessionCode.trim());
    if (!session) {
      // For demo purposes, create a fake session to join
      const fakeSessionId = sessionCode.trim();
      const hostFriend = friends[Math.floor(Math.random() * friends.length)];
      
      // Create a fake session
      const fakeSession: TeamSession = {
        id: fakeSessionId,
        hostId: hostFriend.id,
        name: `${hostFriend.name}のセッション`,
        participants: [
          {
            id: hostFriend.id,
            name: hostFriend.name,
            avatar: hostFriend.avatar,
            isReady: true,
            isActive: true,
            joinedAt: new Date().toISOString()
          }
        ],
        currentMode: 'focus',
        timeRemaining: focusDuration * 60,
        isRunning: false,
        createdAt: new Date().toISOString(),
        voiceChatEnabled: false,
        messages: [
          {
            id: '1',
            senderId: 'system',
            senderName: 'システム',
            senderAvatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&auto=format&fit=crop',
            text: `${hostFriend.name}さんがセッションを作成しました。`,
            timestamp: new Date().toISOString()
          }
        ]
      };
      
      // Add fake session to store
      teamSessions.push(fakeSession);
      
      // Join the fake session
      joinTeamSession(
        fakeSessionId,
        "user_id", // In a real app, this would be the user's ID
        "You", // In a real app, this would be the user's name
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop" // In a real app, this would be the user's avatar
      );
      
      // Reset form
      setSessionCode('');
      
      // Switch to active tab
      setActiveTab('active');
      setActiveView('timer');
      
      // Play sound if enabled
      playSound();
      
      // Vibrate if not on web
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      return;
    }
    
    // Join the session
    joinTeamSession(
      sessionCode.trim(),
      "user_id", // In a real app, this would be the user's ID
      "You", // In a real app, this would be the user's name
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop" // In a real app, this would be the user's avatar
    );
    
    // Reset form
    setSessionCode('');
    
    // Switch to active tab
    setActiveTab('active');
    setActiveView('timer');
    
    // Play sound if enabled
    playSound();
    
    // Vibrate if not on web
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  // Handle leave session
  const handleLeaveSession = () => {
    if (!activeSession) return;
    
    Alert.alert(
      "セッションを退出",
      "このセッションから退出しますか？",
      [
        {
          text: "キャンセル",
          style: 'cancel'
        },
        {
          text: "退出",
          style: 'destructive',
          onPress: () => {
            leaveTeamSession(activeSession.id, "user_id"); // In a real app, this would be the user's ID
            setActiveSession(null);
            setActiveTab('create');
            onClose();
          }
        }
      ]
    );
  };
  
  // Handle start/pause session
  const handleToggleSession = () => {
    if (!activeSession) return;
    
    if (activeSession.isRunning) {
      pauseTeamSession(activeSession.id);
    } else {
      startTeamSession(activeSession.id);
    }
    
    // Vibrate if not on web
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  // Handle toggle voice chat
  const handleToggleVoiceChat = () => {
    if (!activeSession) return;
    
    toggleVoiceChat(activeSession.id);
    setMicEnabled(!micEnabled);
    
    // Vibrate if not on web
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Handle set ready
  const handleSetReady = () => {
    if (!activeSession) return;
    
    // Find current user in participants
    const currentUser = activeSession.participants.find(p => p.id === "user_id"); // In a real app, this would be the user's ID
    if (!currentUser) return;
    
    // Toggle ready state
    setParticipantReady(activeSession.id, "user_id", !currentUser.isReady); // In a real app, this would be the user's ID
    
    // Vibrate if not on web
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Handle change mode
  const handleChangeMode = (mode: 'focus' | 'shortBreak' | 'longBreak') => {
    if (!activeSession) return;
    
    setTeamSessionMode(activeSession.id, mode);
    
    // Vibrate if not on web
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };
  
  // Handle copy session code
  const handleCopySessionCode = () => {
    if (!activeSession) return;
    
    // In a real app, this would copy the session code to clipboard
    Alert.alert("コピー完了", `セッションコード「${activeSession.id}」がコピーされました`);
    
    // Vibrate if not on web
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };
  
  // Handle share session
  const handleShareSession = () => {
    if (!activeSession) return;
    
    // In a real app, this would open the share dialog
    Alert.alert("共有", `セッション「${activeSession.name}」を共有します`);
    
    // Vibrate if not on web
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };
  
  // Handle delete session
  const handleDeleteSession = () => {
    if (!activeSession) return;
    
    Alert.alert(
      "セッションを削除",
      "このセッションを削除しますか？この操作は元に戻せません。",
      [
        {
          text: "キャンセル",
          style: 'cancel'
        },
        {
          text: "削除",
          style: 'destructive',
          onPress: () => {
            deleteTeamSession(activeSession.id);
            setActiveSession(null);
            setActiveTab('create');
            onClose();
            
            // Vibrate if not on web
            if (Platform.OS !== 'web') {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
          }
        }
      ]
    );
  };
  
  // Handle send message
  const handleSendMessage = () => {
    if (!activeSession || !messageText.trim()) return;
    
    sendMessage(
      activeSession.id,
      "user_id", // In a real app, this would be the user's ID
      "You", // In a real app, this would be the user's name
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop", // In a real app, this would be the user's avatar
      messageText
    );
    
    setMessageText('');
    
    // Vibrate if not on web
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    // Scroll to bottom of chat
    if (chatListRef.current && activeSession.messages && activeSession.messages.length) {
      setTimeout(() => {
        chatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };
  
  // Play sound
  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/complete.mp3')
      );
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };
  
  // Clean up sound on unmount
  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);
  
  // Render friend item
  const renderFriendItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.friendItem,
        selectedFriends.includes(item.id) && { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
      ]}
      onPress={() => {
        if (selectedFriends.includes(item.id)) {
          setSelectedFriends(selectedFriends.filter(id => id !== item.id));
        } else {
          setSelectedFriends([...selectedFriends, item.id]);
        }
      }}
    >
      <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
      <Text style={[styles.friendName, { color: theme.text }]}>{item.name}</Text>
      {selectedFriends.includes(item.id) && (
        <Check size={20} color={theme.success} />
      )}
    </TouchableOpacity>
  );
  
  // Render participant item
  const renderParticipantItem = ({ item }: { item: TeamSessionParticipant }) => (
    <View style={styles.participantItem}>
      <Image source={{ uri: item.avatar }} style={styles.participantAvatar} />
      <View style={styles.participantInfo}>
        <Text style={[styles.participantName, { color: theme.text }]}>
          {item.name}
          {activeSession && item.id === activeSession.hostId && (
            <Text style={{ color: theme.warning }}> (ホスト)</Text>
          )}
        </Text>
        <Text style={[styles.participantStatus, { color: item.isActive ? theme.success : theme.error }]}>
          {item.isActive ? "オンライン" : "オフライン"}
        </Text>
      </View>
      {item.isReady ? (
        <UserCheck size={20} color={theme.success} />
      ) : (
        <AlertCircle size={20} color={theme.warning} />
      )}
    </View>
  );
  
  // Render chat message
  const renderChatMessage = ({ item }: { item: ChatMessage }) => {
    const isSystem = item.senderId === 'system';
    const isCurrentUser = item.senderId === 'user_id'; // In a real app, this would be the user's ID
    
    if (isSystem) {
      return (
        <View style={styles.systemMessageContainer}>
          <View style={[styles.systemMessage, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
            <Text style={[styles.systemMessageText, { color: theme.textSecondary }]}>
              {item.text}
            </Text>
            <Text style={[styles.messageTime, { color: theme.textSecondary }]}>
              {formatMessageTime(item.timestamp)}
            </Text>
          </View>
        </View>
      );
    }
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage
      ]}>
        {!isCurrentUser && (
          <Image source={{ uri: item.senderAvatar }} style={styles.messageAvatar} />
        )}
        <View style={[
          styles.messageBubble,
          { 
            backgroundColor: isCurrentUser ? theme.primary : 'rgba(255, 255, 255, 0.1)',
            borderBottomLeftRadius: isCurrentUser ? borderRadius.md : 0,
            borderBottomRightRadius: isCurrentUser ? 0 : borderRadius.md,
          }
        ]}>
          {!isCurrentUser && (
            <Text style={[styles.messageSender, { color: theme.textSecondary }]}>
              {item.senderName}
            </Text>
          )}
          <Text style={[styles.messageText, { color: isCurrentUser ? '#fff' : theme.text }]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime, 
            { color: isCurrentUser ? 'rgba(255, 255, 255, 0.7)' : theme.textSecondary }
          ]}>
            {formatMessageTime(item.timestamp)}
          </Text>
        </View>
        {isCurrentUser && (
          <Image source={{ uri: item.senderAvatar }} style={styles.messageAvatar} />
        )}
      </View>
    );
  };
  
  // Render create tab
  const renderCreateTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: theme.text }]}>
        新しいセッションを作成
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
          セッション名
        </Text>
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border
            }
          ]}
          placeholder="例: 朝の集中タイム"
          placeholderTextColor={theme.textSecondary}
          value={sessionName}
          onChangeText={setSessionName}
        />
      </View>
      
      <View style={styles.friendsContainer}>
        <Text style={[styles.friendsTitle, { color: theme.textSecondary }]}>
          友達を招待 (オプション)
        </Text>
        <FlatList
          data={friends}
          renderItem={renderFriendItem}
          keyExtractor={item => item.id}
          style={styles.friendsList}
        />
      </View>
      
      <TouchableOpacity
        style={[styles.createButton, { backgroundColor: theme.primary }]}
        onPress={handleCreateSession}
      >
        <Text style={[styles.createButtonText, { color: '#fff' }]}>
          セッションを作成
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render join tab
  const renderJoinTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: theme.text }]}>
        セッションに参加
      </Text>
      
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
          セッションコード
        </Text>
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: theme.card,
              color: theme.text,
              borderColor: theme.border
            }
          ]}
          placeholder="例: ABC123"
          placeholderTextColor={theme.textSecondary}
          value={sessionCode}
          onChangeText={setSessionCode}
        />
      </View>
      
      <TouchableOpacity
        style={[styles.joinButton, { backgroundColor: theme.secondary }]}
        onPress={handleJoinSession}
      >
        <Text style={[styles.joinButtonText, { color: '#fff' }]}>
          セッションに参加
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  // Render active tab (force refresh)
  const renderActiveTab = () => {
    if (!activeSession) return null;
    
    const isHost = activeSession.hostId === "user_id"; // In a real app, this would be the user's ID
    const currentUser = activeSession.participants.find(p => p.id === "user_id"); // In a real app, this would be the user's ID
    const isReady = currentUser?.isReady || false;
    const allReady = activeSession.participants.every(p => p.isReady);
    
    const { width } = Dimensions.get('window');
    const translateX = slideAnim.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [0, -width, -width * 2],
    });
    
    return (
      <View style={styles.activeTabContainer}>
        {/* Navigation tabs */}
        <View style={styles.viewTabs}>
          <TouchableOpacity
            style={[
              styles.viewTab,
              activeView === 'timer' && { borderBottomColor: getModeColor(activeSession.currentMode) }
            ]}
            onPress={() => setActiveView('timer')}
          >
            <Clock size={20} color={activeView === 'timer' ? getModeColor(activeSession.currentMode) : theme.textSecondary} />
            <Text style={[
              styles.viewTabText,
              { color: activeView === 'timer' ? getModeColor(activeSession.currentMode) : theme.textSecondary }
            ]}>
              タイマー
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewTab,
              activeView === 'chat' && { borderBottomColor: getModeColor(activeSession.currentMode) }
            ]}
            onPress={() => setActiveView('chat')}
          >
            <MessageCircle size={20} color={activeView === 'chat' ? getModeColor(activeSession.currentMode) : theme.textSecondary} />
            <Text style={[
              styles.viewTabText,
              { color: activeView === 'chat' ? getModeColor(activeSession.currentMode) : theme.textSecondary }
            ]}>
              チャット
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.viewTab,
              activeView === 'participants' && { borderBottomColor: getModeColor(activeSession.currentMode) }
            ]}
            onPress={() => setActiveView('participants')}
          >
            <Users size={20} color={activeView === 'participants' ? getModeColor(activeSession.currentMode) : theme.textSecondary} />
            <Text style={[
              styles.viewTabText,
              { color: activeView === 'participants' ? getModeColor(activeSession.currentMode) : theme.textSecondary }
            ]}>
              参加者
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Session header */}
        <View style={styles.sessionHeader}>
          <View>
            <Text style={[styles.sessionName, { color: theme.text }]}>
              {activeSession.name}
            </Text>
            <Text style={[styles.sessionInfo, { color: theme.textSecondary }]}>
              {activeSession.participants.length}人が参加中 • ID: {activeSession.id}
            </Text>
          </View>
          
          <View style={styles.sessionActions}>
            <TouchableOpacity
              style={styles.sessionAction}
              onPress={handleCopySessionCode}
            >
              <Copy size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.sessionAction}
              onPress={handleShareSession}
            >
              <Share2 size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Sliding content */}
        <Animated.View 
          style={[
            styles.slidingContent,
            { transform: [{ translateX }] }
          ]}
        >
          {/* Timer View */}
          <View style={styles.contentPage}>
            <View style={styles.timerContainer}>
              {/* Player Status Section (Ready Button) */}
              <View style={styles.playerStatusSection}>
                <TouchableOpacity
                  style={[
                    styles.readyButton,
                    { backgroundColor: isReady ? 'rgba(107, 203, 119, 0.2)' : 'rgba(255, 255, 255, 0.1)' }
                  ]}
                  onPress={handleSetReady}
                >
                  <Text style={[
                    styles.readyButtonText,
                    { color: isReady ? theme.success : theme.textSecondary }
                  ]}>
                    {isReady ? "準備完了" : "準備する"}
                  </Text>
                  {isReady && (
                    <Check size={16} color={theme.success} />
                  )}
                </TouchableOpacity>
              </View>
              
              {/* Tappable Timer Circle */}
              <TouchableOpacity 
                style={styles.timerCircleWrapper}
                onPress={handleToggleSession}
                disabled={!isHost && !allReady}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.timerCircle,
                  { 
                    borderColor: getModeColor(activeSession.currentMode),
                    backgroundColor: theme.card,
                  }
                ]}>
                  <View style={[
                    styles.timerCircleInner,
                    { 
                      backgroundColor: theme.background,
                      shadowColor: getModeColor(activeSession.currentMode),
                    }
                  ]}>
                    <Text style={[styles.timerText, { color: theme.text }]}>
                      {formatTime(activeSession.timeRemaining)}
                    </Text>
                    <Text style={[styles.timerMode, { color: getModeColor(activeSession.currentMode) }]}>
                      {getModeName(activeSession.currentMode)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              {/* Session Status Section (Mode Buttons) */}
              <View style={styles.sessionStatusSection}>
                {isHost && (
                  <View style={styles.modeButtons}>
                    <TouchableOpacity
                      style={[
                        styles.modeButton,
                        activeSession.currentMode === 'focus' && { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                      ]}
                      onPress={() => handleChangeMode('focus')}
                    >
                      <Timer size={16} color={theme.primary} />
                      <Text style={[styles.modeButtonText, { color: theme.primary }]}>
                        フォーカス
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.modeButton,
                        activeSession.currentMode === 'shortBreak' && { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                      ]}
                      onPress={() => handleChangeMode('shortBreak')}
                    >
                      <Coffee size={16} color={theme.secondary} />
                      <Text style={[styles.modeButtonText, { color: theme.secondary }]}>
                        小休憩
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[
                        styles.modeButton,
                        activeSession.currentMode === 'longBreak' && { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
                      ]}
                      onPress={() => handleChangeMode('longBreak')}
                    >
                      <Coffee size={16} color={theme.success} />
                      <Text style={[styles.modeButtonText, { color: theme.success }]}>
                        長休憩
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.sessionSettings}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Mic size={20} color={theme.textSecondary} />
                  <Text style={[styles.settingText, { color: theme.text }]}>
                    ボイスチャット
                  </Text>
                </View>
                <Switch
                  value={activeSession.voiceChatEnabled}
                  onValueChange={handleToggleVoiceChat}
                  trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: theme.primary }}
                  thumbColor={activeSession.voiceChatEnabled ? theme.success : theme.textSecondary}
                />
              </View>
              
              {isHost && (
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: 'rgba(239, 71, 111, 0.2)' }]}
                  onPress={handleDeleteSession}
                >
                  <Text style={[styles.deleteButtonText, { color: theme.error }]}>
                    セッションを削除
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.leaveButton, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}
                onPress={handleLeaveSession}
              >
                <Text style={[styles.leaveButtonText, { color: theme.textSecondary }]}>
                  セッションを退出
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Chat View */}
          <KeyboardAvoidingView 
            style={styles.contentPage}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
          >
            <View style={styles.chatContainer}>
              {!activeSession.messages || activeSession.messages.length === 0 ? (
                <View style={styles.emptyChatContainer}>
                  <MessageCircle size={40} color={theme.textSecondary} />
                  <Text style={[styles.emptyChatText, { color: theme.textSecondary }]}>
                    メッセージはまだありません
                  </Text>
                  <Text style={[styles.emptyChatSubtext, { color: theme.textSecondary }]}>
                    チームメンバーとチャットを始めましょう
                  </Text>
                </View>
              ) : (
                <FlatList
                  ref={chatListRef}
                  data={activeSession.messages}
                  renderItem={renderChatMessage}
                  keyExtractor={item => item.id}
                  style={styles.chatList}
                  contentContainerStyle={styles.chatListContent}
                  onContentSizeChange={() => chatListRef.current?.scrollToEnd({ animated: true })}
                />
              )}
              
              <View style={[
                styles.chatInputContainer,
                { borderTopColor: theme.border }
              ]}>
                <TextInput
                  ref={messageInputRef}
                  style={[
                    styles.chatInput,
                    { 
                      backgroundColor: theme.card,
                      color: theme.text,
                    }
                  ]}
                  placeholder="メッセージを入力..."
                  placeholderTextColor={theme.textSecondary}
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[
                    styles.sendButton,
                    { backgroundColor: messageText.trim() ? theme.primary : 'rgba(255, 255, 255, 0.1)' }
                  ]}
                  onPress={handleSendMessage}
                  disabled={!messageText.trim()}
                >
                  <Send size={20} color={messageText.trim() ? '#fff' : theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
          
          {/* Participants View */}
          <View style={styles.contentPage}>
            <View style={styles.participantsContainer}>
              <Text style={[styles.participantsTitle, { color: theme.textSecondary }]}>
                参加者 ({activeSession.participants.length}人)
              </Text>
              
              {activeSession.participants.length === 0 ? (
                <View style={styles.emptyParticipantsContainer}>
                  <Users size={40} color={theme.textSecondary} />
                  <Text style={[styles.emptyParticipantsText, { color: theme.textSecondary }]}>
                    参加者はまだいません
                  </Text>
                  <Text style={[styles.emptyParticipantsSubtext, { color: theme.textSecondary }]}>
                    友達を招待してセッションに参加しましょう
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={activeSession.participants}
                  renderItem={renderParticipantItem}
                  keyExtractor={item => item.id}
                  style={styles.participantsList}
                />
              )}
              
              <View style={styles.participantsInfo}>
                <View style={styles.infoItem}>
                  <UserCheck size={16} color={theme.success} />
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    準備完了: {activeSession.participants.filter(p => p.isReady).length}/{activeSession.participants.length}
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <User size={16} color={theme.primary} />
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    オンライン: {activeSession.participants.filter(p => p.isActive).length}/{activeSession.participants.length}
                  </Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Clock3 size={16} color={theme.secondary} />
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    セッション開始: {new Date(activeSession.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </View>
    );
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View 
        style={[
          styles.modalContainer, 
          { 
            backgroundColor: theme.background,
            paddingTop: insets.top,
            paddingBottom: insets.bottom
          }
        ]}
      >
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            チームセッション
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>
        
        {!isTeamSession && (
          <View style={styles.tabButtons}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'create' && { borderBottomColor: theme.primary }
              ]}
              onPress={() => setActiveTab('create')}
            >
              <Text style={[
                styles.tabButtonText,
                { color: activeTab === 'create' ? theme.primary : theme.textSecondary }
              ]}>
                作成
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === 'join' && { borderBottomColor: theme.primary }
              ]}
              onPress={() => setActiveTab('join')}
            >
              <Text style={[
                styles.tabButtonText,
                { color: activeTab === 'join' ? theme.primary : theme.textSecondary }
              ]}>
                参加
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.modalContent} ref={modalRef}>
          {activeTab === 'create' && renderCreateTab()}
          {activeTab === 'join' && renderJoinTab()}
          {activeTab === 'active' && renderActiveTab()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: spacing.xs,
  },
  tabButtons: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: spacing.md,
  },
  tabTitle: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.xs,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.md,
  },
  friendsContainer: {
    flex: 1,
    marginBottom: spacing.md,
  },
  friendsTitle: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.xs,
  },
  friendsList: {
    flex: 1,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  friendName: {
    flex: 1,
    fontSize: fontSizes.md,
  },
  createButton: {
    height: 50,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  joinButton: {
    height: 50,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  activeTabContainer: {
    flex: 1,
  },
  viewTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  viewTab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  viewTabText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sessionName: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  sessionInfo: {
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
  sessionActions: {
    flexDirection: 'row',
  },
  sessionAction: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
  slidingContent: {
    flex: 1,
    flexDirection: 'row',
    width: '300%', // 3 screens
  },
  contentPage: {
    width: '33.333%', // 1/3 of the total width
    flex: 1,
  },
  timerContainer: {
    alignItems: 'center',
    padding: spacing.md,
  },
  playerStatusSection: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sessionStatusSection: {
    width: '100%',
    marginTop: spacing.lg,
  },
  timerCircleWrapper: {
    marginVertical: spacing.md,
  },
  timerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  timerCircleInner: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  timerText: {
    fontSize: fontSizes.xxl,
    fontWeight: 'bold',
  },
  timerMode: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
  },

  modeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  modeButtonText: {
    fontSize: fontSizes.xs,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },

  readyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    minWidth: 200,
  },
  readyButtonText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    marginRight: spacing.xs,
  },
  participantsContainer: {
    flex: 1,
    padding: spacing.md,
  },
  participantsTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  participantsList: {
    flex: 1,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: fontSizes.md,
  },
  participantStatus: {
    fontSize: fontSizes.xs,
  },
  participantsInfo: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: fontSizes.xs,
    marginLeft: spacing.xs,
  },
  emptyParticipantsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyParticipantsText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginTop: spacing.md,
  },
  emptyParticipantsSubtext: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  chatContainer: {
    flex: 1,
  },
  chatList: {
    flex: 1,
    padding: spacing.md,
  },
  chatListContent: {
    paddingBottom: spacing.md,
  },
  emptyChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  emptyChatText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginTop: spacing.md,
  },
  emptyChatSubtext: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  currentUserMessage: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  otherUserMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    maxWidth: '100%',
  },
  messageSender: {
    fontSize: fontSizes.xs,
    marginBottom: 2,
  },
  messageText: {
    fontSize: fontSizes.sm,
  },
  messageTime: {
    fontSize: fontSizes.xs,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: spacing.xs,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  systemMessage: {
    padding: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 12,
  },
  systemMessageText: {
    fontSize: fontSizes.xs,
    textAlign: 'center',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderTopWidth: 1,
  },
  chatInput: {
    flex: 1,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    maxHeight: 100,
    fontSize: fontSizes.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  sessionSettings: {
    padding: spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: fontSizes.md,
    marginLeft: spacing.sm,
  },
  deleteButton: {
    height: 50,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  deleteButtonText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  leaveButton: {
    height: 50,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveButtonText: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
});