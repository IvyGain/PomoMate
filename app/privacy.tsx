import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import {
  Shield,
  Eye,
  Users,
  MapPin,
  Database,
  Lock,
  Globe,
  ChevronRight,
  AlertCircle,
  Info,
} from 'lucide-react-native';
import { spacing, fontSizes } from '@/constants/theme';

export default function PrivacyScreen() {
  const { theme } = useThemeStore();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;
  
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'friends' | 'private'>('friends');
  const [showStats, setShowStats] = useState(true);
  const [showStreak, setShowStreak] = useState(true);
  const [showLevel, setShowLevel] = useState(true);
  const [showAchievements, setShowAchievements] = useState(true);
  const [allowFriendRequests, setAllowFriendRequests] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowDataAnalytics, setAllowDataAnalytics] = useState(true);
  const [allowCrashReporting, setAllowCrashReporting] = useState(true);
  
  const handleSaveSettings = () => {
    Alert.alert('設定を保存', 'プライバシー設定が保存されました。');
  };
  
  const handleDeleteData = () => {
    Alert.alert(
      'データ削除',
      'すべてのデータを削除しますか？この操作は元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            Alert.alert('データ削除', 'この機能は実装中です。');
          },
        },
      ]
    );
  };
  
  const renderSettingItem = (
    icon: React.ReactNode,
    title: string,
    description: string,
    rightElement?: React.ReactNode,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.card }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIconContainer}>{icon}</View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
        <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
          {description}
        </Text>
      </View>
      {rightElement}
    </TouchableOpacity>
  );
  
  const renderVisibilityButton = (
    label: string,
    value: 'public' | 'friends' | 'private',
    currentValue: 'public' | 'friends' | 'private'
  ) => (
    <TouchableOpacity
      style={[
        styles.visibilityButton,
        {
          backgroundColor: currentValue === value ? theme.primary : 'rgba(255, 255, 255, 0.05)',
          borderColor: currentValue === value ? theme.primary : 'rgba(255, 255, 255, 0.1)',
        },
      ]}
      onPress={() => setProfileVisibility(value)}
    >
      <Text
        style={[
          styles.visibilityButtonText,
          { color: currentValue === value ? theme.text : theme.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'プライバシー設定',
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTitleStyle: {
            color: theme.text,
            fontWeight: 'bold',
          },
          headerTintColor: theme.text,
        }}
      />
      
      <ResponsiveContainer maxWidth={isDesktop ? 900 : 800}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isDesktop && styles.desktopScrollContent,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.infoCard, { backgroundColor: 'rgba(147, 51, 234, 0.1)' }]}>
            <Info size={20} color={theme.primary} />
            <Text style={[styles.infoText, { color: theme.text }]}>
              プライバシー設定を変更することで、他のユーザーとの情報共有をコントロールできます。
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              プロフィール公開設定
            </Text>
            
            <View style={[styles.visibilityCard, { backgroundColor: theme.card }]}>
              <View style={styles.visibilityHeader}>
                <Shield size={24} color={theme.primary} />
                <View style={styles.visibilityHeaderText}>
                  <Text style={[styles.visibilityTitle, { color: theme.text }]}>
                    プロフィールの公開範囲
                  </Text>
                  <Text style={[styles.visibilityDescription, { color: theme.textSecondary }]}>
                    あなたのプロフィールを誰に表示するかを選択してください
                  </Text>
                </View>
              </View>
              
              <View style={styles.visibilityButtons}>
                {renderVisibilityButton('公開', 'public', profileVisibility)}
                {renderVisibilityButton('フレンドのみ', 'friends', profileVisibility)}
                {renderVisibilityButton('非公開', 'private', profileVisibility)}
              </View>
              
              <View style={[styles.visibilityInfo, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
                <AlertCircle size={16} color={theme.textSecondary} />
                <Text style={[styles.visibilityInfoText, { color: theme.textSecondary }]}>
                  {profileVisibility === 'public' && '誰でもあなたのプロフィールを見ることができます'}
                  {profileVisibility === 'friends' && 'フレンドだけがあなたのプロフィールを見ることができます'}
                  {profileVisibility === 'private' && 'あなたのプロフィールは非公開です'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              統計情報の公開
            </Text>
            
            {renderSettingItem(
              <Eye size={22} color={theme.text} />,
              '統計情報を表示',
              'セッション数、合計時間などの統計を他のユーザーに表示',
              <Switch
                value={showStats}
                onValueChange={setShowStats}
                trackColor={{ false: '#767577', true: theme.primary }}
                thumbColor="#f4f3f4"
              />
            )}
            
            {renderSettingItem(
              <Eye size={22} color={theme.text} />,
              '連続記録を表示',
              'あなたの連続記録を他のユーザーに表示',
              <Switch
                value={showStreak}
                onValueChange={setShowStreak}
                trackColor={{ false: '#767577', true: theme.primary }}
                thumbColor="#f4f3f4"
              />
            )}
            
            {renderSettingItem(
              <Eye size={22} color={theme.text} />,
              'レベルを表示',
              'あなたのレベルを他のユーザーに表示',
              <Switch
                value={showLevel}
                onValueChange={setShowLevel}
                trackColor={{ false: '#767577', true: theme.primary }}
                thumbColor="#f4f3f4"
              />
            )}
            
            {renderSettingItem(
              <Eye size={22} color={theme.text} />,
              '実績を表示',
              '解除した実績を他のユーザーに表示',
              <Switch
                value={showAchievements}
                onValueChange={setShowAchievements}
                trackColor={{ false: '#767577', true: theme.primary }}
                thumbColor="#f4f3f4"
              />
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              ソーシャル設定
            </Text>
            
            {renderSettingItem(
              <Users size={22} color={theme.text} />,
              'フレンドリクエストを許可',
              '他のユーザーからフレンドリクエストを受け取る',
              <Switch
                value={allowFriendRequests}
                onValueChange={setAllowFriendRequests}
                trackColor={{ false: '#767577', true: theme.primary }}
                thumbColor="#f4f3f4"
              />
            )}
            
            {renderSettingItem(
              <Globe size={22} color={theme.text} />,
              'オンライン状態を表示',
              'フレンドにあなたのオンライン状態を表示',
              <Switch
                value={showOnlineStatus}
                onValueChange={setShowOnlineStatus}
                trackColor={{ false: '#767577', true: theme.primary }}
                thumbColor="#f4f3f4"
              />
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              データとプライバシー
            </Text>
            
            {renderSettingItem(
              <Database size={22} color={theme.text} />,
              '分析データの送信を許可',
              'アプリの改善のため匿名の使用データを送信',
              <Switch
                value={allowDataAnalytics}
                onValueChange={setAllowDataAnalytics}
                trackColor={{ false: '#767577', true: theme.primary }}
                thumbColor="#f4f3f4"
              />
            )}
            
            {renderSettingItem(
              <AlertCircle size={22} color={theme.text} />,
              'クラッシュレポートの送信を許可',
              'アプリのクラッシュ情報を送信してバグ修正に貢献',
              <Switch
                value={allowCrashReporting}
                onValueChange={setAllowCrashReporting}
                trackColor={{ false: '#767577', true: theme.primary }}
                thumbColor="#f4f3f4"
              />
            )}
            
            {renderSettingItem(
              <Lock size={22} color={theme.text} />,
              'データポリシー',
              'プライバシーポリシーと利用規約を確認',
              <ChevronRight size={20} color={theme.textSecondary} />,
              () => Alert.alert('データポリシー', 'プライバシーポリシーページは準備中です。')
            )}
            
            {renderSettingItem(
              <MapPin size={22} color={theme.text} />,
              'データのエクスポート',
              'あなたのデータをエクスポートしてダウンロード',
              <ChevronRight size={20} color={theme.textSecondary} />,
              () => Alert.alert('データのエクスポート', 'この機能は準備中です。')
            )}
          </View>
          
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: theme.primary }]}
              onPress={handleSaveSettings}
            >
              <Text style={[styles.saveButtonText, { color: theme.text }]}>
                設定を保存
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.deleteButton, { borderColor: theme.error }]}
              onPress={handleDeleteData}
            >
              <Text style={[styles.deleteButtonText, { color: theme.error }]}>
                すべてのデータを削除
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  desktopScrollContent: {
    paddingVertical: 24,
  },
  infoCard: {
    flexDirection: 'row',
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: fontSizes.sm,
    marginLeft: spacing.sm,
    lineHeight: 20,
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingIconContainer: {
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  visibilityCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  visibilityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  visibilityHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  visibilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  visibilityDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  visibilityButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  visibilityButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  visibilityButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  visibilityInfo: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  visibilityInfoText: {
    flex: 1,
    fontSize: 12,
    marginLeft: 8,
    lineHeight: 16,
  },
  saveButton: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    marginHorizontal: 16,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
