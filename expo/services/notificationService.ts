import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationPermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

export interface ScheduleNotificationParams {
  title: string;
  body: string;
  data?: any;
  trigger?: Notifications.NotificationTriggerInput | null;
}

class NotificationService {
  private permissionsGranted: boolean = false;
  
  async initialize(): Promise<NotificationPermissionStatus> {
    if (Platform.OS === 'web') {
      return { granted: false, canAskAgain: false, status: 'undetermined' };
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    this.permissionsGranted = finalStatus === 'granted';
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#9333EA',
      });
      
      await Notifications.setNotificationChannelAsync('timer', {
        name: 'タイマー通知',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#9333EA',
        sound: 'complete.mp3',
        description: 'ポモドーロタイマーの完了通知',
      });
      
      await Notifications.setNotificationChannelAsync('achievement', {
        name: '実績通知',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 200, 200, 200],
        lightColor: '#03DAC6',
        sound: 'complete.mp3',
        description: '実績解除の通知',
      });
    }
    
    return {
      granted: this.permissionsGranted,
      canAskAgain: existingStatus !== 'denied',
      status: finalStatus,
    };
  }
  
  async scheduleNotification(params: ScheduleNotificationParams): Promise<string | null> {
    if (Platform.OS === 'web' || !this.permissionsGranted) {
      return null;
    }
    
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: params.title,
          body: params.body,
          data: params.data || {},
          sound: 'complete.mp3',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: params.trigger || null,
      });
      
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }
  
  async showNotification(title: string, body: string, data?: any, channelId?: string): Promise<string | null> {
    return this.scheduleNotification({
      title,
      body,
      data: { ...data, channelId: channelId || 'default' },
      trigger: null,
    });
  }
  
  async scheduleTimerNotification(seconds: number, title: string, body: string): Promise<string | null> {
    if (Platform.OS === 'web' || !this.permissionsGranted) {
      return null;
    }
    
    return this.scheduleNotification({
      title,
      body,
      data: { type: 'timer', channelId: 'timer' },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds },
    });
  }
  
  async cancelNotification(notificationId: string): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }
  
  async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }
  
  async showAchievementNotification(achievementTitle: string, xpReward: number): Promise<void> {
    await this.showNotification(
      '🏆 実績解除！',
      `「${achievementTitle}」を解除しました！ (+${xpReward} XP)`,
      { type: 'achievement', channelId: 'achievement' },
      'achievement'
    );
  }
  
  async showTimerCompleteNotification(mode: 'focus' | 'shortBreak' | 'longBreak'): Promise<void> {
    const modeEmojis = {
      focus: '⏰',
      shortBreak: '☕',
      longBreak: '🌟',
    };
    
    const titles = {
      focus: 'お疲れ様です！',
      shortBreak: '休憩時間終了！',
      longBreak: '長休憩終了！',
    };
    
    const bodies = {
      focus: 'フォーカスセッションが完了しました。休憩を取りましょう！',
      shortBreak: '小休憩が終わりました。次のセッションを始めましょう！',
      longBreak: '長休憩が終わりました。リフレッシュして次のセッションへ！',
    };
    
    await this.showNotification(
      `${modeEmojis[mode]} ${titles[mode]}`,
      bodies[mode],
      { type: 'timerComplete', mode, channelId: 'timer' },
      'timer'
    );
  }
  
  async showLevelUpNotification(newLevel: number): Promise<void> {
    await this.showNotification(
      '🎉 レベルアップ！',
      `レベル${newLevel}に到達しました！おめでとうございます！`,
      { type: 'levelUp', level: newLevel },
      'achievement'
    );
  }
  
  addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
  }
  
  addNotificationReceivedListener(
    callback: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
  }
}

export const notificationService = new NotificationService();
