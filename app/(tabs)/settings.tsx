import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { useTimerStore } from '@/store/timerStore';
import ProfileHeader from '@/components/ProfileHeader';
import { CustomSlider } from '@/components/CustomSlider';
import { 
  Moon, 
  Sun, 
  Bell, 
  Volume2, 
  Shield, 
  HelpCircle, 
  Info, 
  Trash2,
  ChevronRight,
  Clock,
  Coffee,
  Zap,
  Vibrate,
  PlayCircle,
  RotateCcw
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { theme, toggleTheme, themeType } = useThemeStore();
  const { resetProgress } = useUserStore();
  const { logout } = useAuthStore();
  const { 
    focusDuration, 
    shortBreakDuration, 
    longBreakDuration, 
    sessionsUntilLongBreak,
    autoStartBreaks,
    autoStartFocus,
    soundEnabled,
    vibrationEnabled,
    updateSettings
  } = useTimerStore();
  
  const isDarkMode = themeType === 'dark';
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [appSoundEnabled, setAppSoundEnabled] = useState(true);
  
  // Local state for timer settings
  const [focusMinutes, setFocusMinutes] = useState(focusDuration);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(shortBreakDuration);
  const [longBreakMinutes, setLongBreakMinutes] = useState(longBreakDuration);
  const [sessionsCount, setSessionsCount] = useState(sessionsUntilLongBreak);
  
  // Default timer settings
  const DEFAULT_FOCUS_DURATION = 25;
  const DEFAULT_SHORT_BREAK_DURATION = 5;
  const DEFAULT_LONG_BREAK_DURATION = 15;
  const DEFAULT_SESSIONS_UNTIL_LONG_BREAK = 4;
  
  const handleResetProgress = () => {
    Alert.alert(
      'データをリセット',
      'すべての進捗データがリセットされます。この操作は元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'リセット', 
          style: 'destructive',
          onPress: () => {
            resetProgress();
            Alert.alert('リセット完了', 'すべてのデータがリセットされました。');
          }
        }
      ]
    );
  };
  
  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'ログアウト', 
          onPress: logout
        }
      ]
    );
  };
  
  const handleUpdateTimerSettings = () => {
    // Validate inputs
    if (focusMinutes < 1 || shortBreakMinutes < 1 || longBreakMinutes < 1 || sessionsCount < 1) {
      Alert.alert('入力エラー', '1以上の数値を入力してください');
      return;
    }
    
    // Update timer settings
    updateSettings({
      focusDuration: focusMinutes,
      shortBreakDuration: shortBreakMinutes,
      longBreakDuration: longBreakMinutes,
      sessionsUntilLongBreak: sessionsCount
    });
    
    Alert.alert('設定を保存しました', 'タイマー設定が更新されました');
  };
  
  const handleResetToDefaults = () => {
    // Reset to default values
    setFocusMinutes(DEFAULT_FOCUS_DURATION);
    setShortBreakMinutes(DEFAULT_SHORT_BREAK_DURATION);
    setLongBreakMinutes(DEFAULT_LONG_BREAK_DURATION);
    setSessionsCount(DEFAULT_SESSIONS_UNTIL_LONG_BREAK);
    
    Alert.alert('デフォルト設定', 'デフォルト値がセットされました。保存するには「タイマー設定を保存」ボタンを押してください。');
  };
  
  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    rightElement?: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity 
      style={[styles.settingItem, { backgroundColor: theme.card }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIconTitle}>
        {icon}
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
      </View>
      {rightElement}
    </TouchableOpacity>
  );
  
  const renderTimerSlider = (
    icon: React.ReactNode,
    title: string,
    value: number,
    onValueChange: (value: number) => void,
    min: number = 1,
    max: number = 60,
    step: number = 1,
    suffix: string = '分'
  ) => (
    <View style={[styles.settingItem, { backgroundColor: theme.card }]}>
      <View style={styles.settingIconTitle}>
        {icon}
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
      </View>
      <View style={styles.sliderContainer}>
        <CustomSlider
          style={styles.slider}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor={theme.primary}
          maximumTrackTintColor={theme.inactive}
          thumbTintColor={theme.primary}
        />
        <Text style={[styles.sliderValue, { color: theme.text }]}>
          {value} {suffix}
        </Text>
      </View>
    </View>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView>
        <ProfileHeader showSettings={false} />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            アプリ設定
          </Text>
          
          {renderSettingItem(
            isDarkMode ? 
              <Moon size={22} color={theme.text} style={styles.settingIcon} /> : 
              <Sun size={22} color={theme.text} style={styles.settingIcon} />,
            'ダークモード',
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor="#f4f3f4"
            />
          )}
          
          {renderSettingItem(
            <Bell size={22} color={theme.text} style={styles.settingIcon} />,
            '通知',
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor="#f4f3f4"
            />
          )}
          
          {renderSettingItem(
            <Volume2 size={22} color={theme.text} style={styles.settingIcon} />,
            'アプリサウンド',
            <Switch
              value={appSoundEnabled}
              onValueChange={setAppSoundEnabled}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor="#f4f3f4"
            />
          )}
        </View>
        
        {/* Timer Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            タイマー設定
          </Text>
          
          {renderTimerSlider(
            <Clock size={22} color={theme.text} style={styles.settingIcon} />,
            'フォーカス時間',
            focusMinutes,
            setFocusMinutes,
            1,
            60
          )}
          
          {renderTimerSlider(
            <Coffee size={22} color={theme.text} style={styles.settingIcon} />,
            '小休憩時間',
            shortBreakMinutes,
            setShortBreakMinutes,
            1,
            30
          )}
          
          {renderTimerSlider(
            <Coffee size={22} color={theme.text} style={styles.settingIcon} />,
            '長休憩時間',
            longBreakMinutes,
            setLongBreakMinutes,
            5,
            60
          )}
          
          {renderTimerSlider(
            <Zap size={22} color={theme.text} style={styles.settingIcon} />,
            '長休憩までのセッション数',
            sessionsCount,
            setSessionsCount,
            1,
            10,
            1,
            '回'
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={handleUpdateTimerSettings}
            >
              <Text style={styles.saveButtonText}>タイマー設定を保存</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.defaultButton, { borderColor: theme.primary }]}
              onPress={handleResetToDefaults}
            >
              <RotateCcw size={16} color={theme.primary} style={styles.defaultButtonIcon} />
              <Text style={[styles.defaultButtonText, { color: theme.primary }]}>デフォルト設定</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Automation Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            自動化設定
          </Text>
          
          {renderSettingItem(
            <PlayCircle size={22} color={theme.text} style={styles.settingIcon} />,
            '休憩の自動開始',
            <Switch
              value={autoStartBreaks}
              onValueChange={(value) => updateSettings({ autoStartBreaks: value })}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor="#f4f3f4"
            />
          )}
          
          {renderSettingItem(
            <PlayCircle size={22} color={theme.text} style={styles.settingIcon} />,
            'フォーカスの自動開始',
            <Switch
              value={autoStartFocus}
              onValueChange={(value) => updateSettings({ autoStartFocus: value })}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor="#f4f3f4"
            />
          )}
        </View>
        
        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            通知設定
          </Text>
          
          {renderSettingItem(
            <Volume2 size={22} color={theme.text} style={styles.settingIcon} />,
            'タイマー完了音',
            <Switch
              value={soundEnabled}
              onValueChange={(value) => updateSettings({ soundEnabled: value })}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor="#f4f3f4"
            />
          )}
          
          {renderSettingItem(
            <Vibrate size={22} color={theme.text} style={styles.settingIcon} />,
            'バイブレーション',
            <Switch
              value={vibrationEnabled}
              onValueChange={(value) => updateSettings({ vibrationEnabled: value })}
              trackColor={{ false: '#767577', true: theme.primary }}
              thumbColor="#f4f3f4"
            />
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            アカウント
          </Text>
          
          {renderSettingItem(
            <Shield size={22} color={theme.text} style={styles.settingIcon} />,
            'プライバシー設定',
            <ChevronRight size={20} color={theme.textSecondary} />,
            () => Alert.alert('プライバシー設定', '準備中です')
          )}
          
          {renderSettingItem(
            <Trash2 size={22} color={theme.error} style={styles.settingIcon} />,
            'データをリセット',
            <ChevronRight size={20} color={theme.textSecondary} />,
            handleResetProgress
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            サポート
          </Text>
          
          {renderSettingItem(
            <HelpCircle size={22} color={theme.text} style={styles.settingIcon} />,
            'ヘルプ',
            <ChevronRight size={20} color={theme.textSecondary} />,
            () => Alert.alert('ヘルプ', '準備中です')
          )}
          
          {renderSettingItem(
            <Info size={22} color={theme.text} style={styles.settingIcon} />,
            'アプリについて',
            <ChevronRight size={20} color={theme.textSecondary} />,
            () => Alert.alert('PomoMate', 'バージョン 1.0.0\n© 2023 PomoMate Team')
          )}
        </View>
        
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.logoutButton, { borderColor: theme.error }]}
            onPress={handleLogout}
          >
            <Text style={[styles.logoutText, { color: theme.error }]}>
              ログアウト
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  settingIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
  },
  sliderContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  slider: {
    flex: 1,
  },
  sliderValue: {
    width: 50,
    textAlign: 'right',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  defaultButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  defaultButtonIcon: {
    marginRight: 6,
  },
  defaultButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});