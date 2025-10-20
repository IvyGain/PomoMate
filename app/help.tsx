import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { useThemeStore } from '@/store/themeStore';
import { ResponsiveContainer } from '@/components/ResponsiveContainer';
import {
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Mail,
  MessageCircle,
  Book,
  Video,
  ExternalLink,
  Clock,
  Coffee,
  Zap,
  Users,
  Award,
  Settings,
} from 'lucide-react-native';
import { spacing, fontSizes } from '@/constants/theme';

interface FAQItem {
  question: string;
  answer: string;
  icon: any;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: 'ポモドーロテクニックとは何ですか？',
    answer:
      'ポモドーロテクニックは、25分の集中作業と5分の休憩を繰り返すタイムマネジメント手法です。4回の集中セッション後には、15-30分の長い休憩を取ります。',
    icon: Clock,
  },
  {
    question: 'タイマー設定をカスタマイズできますか？',
    answer:
      'はい、設定画面からフォーカス時間、小休憩時間、長休憩時間を自由にカスタマイズできます。デフォルトは25分/5分/15分ですが、自分に合った時間設定に変更できます。',
    icon: Settings,
  },
  {
    question: 'XPとレベルシステムについて教えてください',
    answer:
      'セッションを完了するとXP（経験値）を獲得できます。XPが一定量に達するとレベルアップします。レベルが上がると、新しい実績が解除されやすくなります。',
    icon: Zap,
  },
  {
    question: '実績はどうやって解除しますか？',
    answer:
      '実績は特定の条件を満たすと自動的に解除されます。セッション数、連続日数、合計時間など、様々な条件があります。一部の実績は隠し実績で、解除するまで条件が表示されません。',
    icon: Award,
  },
  {
    question: 'チームセッションとは何ですか？',
    answer:
      'チームセッションは友達と一緒にポモドーロセッションを行える機能です。他のユーザーと同時にタイマーを開始し、一緒に集中作業を行えます。チームセッションではXPにボーナスが付きます。',
    icon: Users,
  },
  {
    question: '休憩中のミニゲームについて',
    answer:
      '休憩時間中は、脳をリフレッシュするためのミニゲームをプレイできます。ゲームをプレイすることで特別な実績も解除できます。',
    icon: Coffee,
  },
  {
    question: '通知が来ないのですが',
    answer:
      '設定画面で通知がオンになっているか確認してください。また、端末の設定でアプリの通知権限が許可されているか確認が必要です。',
    icon: HelpCircle,
  },
  {
    question: 'データのバックアップはできますか？',
    answer:
      '現在、データは端末内に保存されています。アカウント登録機能とクラウド同期機能は今後のアップデートで追加予定です。',
    icon: HelpCircle,
  },
];

export default function HelpScreen() {
  const { theme } = useThemeStore();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1024;
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  
  const toggleItem = (index: number) => {
    setExpandedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };
  
  const handleContactSupport = () => {
    Linking.openURL('mailto:support@pomomate.app');
  };
  
  const handleOpenDocs = () => {
    Linking.openURL('https://pomomate.app/docs');
  };
  
  const handleOpenTutorial = () => {
    Linking.openURL('https://pomomate.app/tutorial');
  };
  
  const renderFAQItem = (item: FAQItem, index: number) => {
    const isExpanded = expandedItems.includes(index);
    const Icon = item.icon;
    
    return (
      <TouchableOpacity
        key={index}
        style={[styles.faqItem, { backgroundColor: theme.card }]}
        onPress={() => toggleItem(index)}
      >
        <View style={styles.faqHeader}>
          <View style={styles.faqIconContainer}>
            <Icon size={20} color={theme.primary} />
          </View>
          <Text style={[styles.faqQuestion, { color: theme.text }]}>{item.question}</Text>
          <View style={styles.faqChevron}>
            {isExpanded ? (
              <ChevronDown size={20} color={theme.textSecondary} />
            ) : (
              <ChevronRight size={20} color={theme.textSecondary} />
            )}
          </View>
        </View>
        
        {isExpanded && (
          <Text style={[styles.faqAnswer, { color: theme.textSecondary }]}>
            {item.answer}
          </Text>
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'ヘルプ',
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
          <View style={[styles.headerCard, { backgroundColor: theme.card }]}>
            <HelpCircle size={48} color={theme.primary} />
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              PomoMate へようこそ
            </Text>
            <Text style={[styles.headerDescription, { color: theme.textSecondary }]}>
              ポモドーロテクニックで生産性を向上させましょう。
              {'\n'}よくある質問と使い方をご確認ください。
            </Text>
          </View>
          
          <View style={styles.quickLinks}>
            <TouchableOpacity
              style={[styles.quickLinkCard, { backgroundColor: theme.card }]}
              onPress={handleOpenTutorial}
            >
              <Video size={32} color={theme.primary} />
              <Text style={[styles.quickLinkTitle, { color: theme.text }]}>
                チュートリアル
              </Text>
              <Text style={[styles.quickLinkDescription, { color: theme.textSecondary }]}>
                動画で使い方を学ぶ
              </Text>
              <ExternalLink size={16} color={theme.textSecondary} style={styles.quickLinkIcon} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.quickLinkCard, { backgroundColor: theme.card }]}
              onPress={handleOpenDocs}
            >
              <Book size={32} color={theme.secondary} />
              <Text style={[styles.quickLinkTitle, { color: theme.text }]}>
                ドキュメント
              </Text>
              <Text style={[styles.quickLinkDescription, { color: theme.textSecondary }]}>
                詳細なガイドを読む
              </Text>
              <ExternalLink size={16} color={theme.textSecondary} style={styles.quickLinkIcon} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              よくある質問
            </Text>
            
            {FAQ_DATA.map((item, index) => renderFAQItem(item, index))}
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              サポート
            </Text>
            
            <TouchableOpacity
              style={[styles.supportCard, { backgroundColor: theme.card }]}
              onPress={handleContactSupport}
            >
              <View style={styles.supportIconContainer}>
                <Mail size={24} color={theme.text} />
              </View>
              <View style={styles.supportContent}>
                <Text style={[styles.supportTitle, { color: theme.text }]}>
                  メールでお問い合わせ
                </Text>
                <Text style={[styles.supportDescription, { color: theme.textSecondary }]}>
                  support@pomomate.app
                </Text>
              </View>
              <ExternalLink size={20} color={theme.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.supportCard, { backgroundColor: theme.card }]}
              onPress={() => Linking.openURL('https://twitter.com/pomomate')}
            >
              <View style={styles.supportIconContainer}>
                <MessageCircle size={24} color={theme.text} />
              </View>
              <View style={styles.supportContent}>
                <Text style={[styles.supportTitle, { color: theme.text }]}>
                  コミュニティに参加
                </Text>
                <Text style={[styles.supportDescription, { color: theme.textSecondary }]}>
                  他のユーザーと交流
                </Text>
              </View>
              <ExternalLink size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.versionCard, { backgroundColor: 'rgba(255, 255, 255, 0.05)' }]}>
            <Text style={[styles.versionText, { color: theme.textSecondary }]}>
              PomoMate v1.0.0
            </Text>
            <Text style={[styles.versionDescription, { color: theme.textSecondary }]}>
              © 2023 PomoMate Team. All rights reserved.
            </Text>
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
  headerCard: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  headerDescription: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  quickLinks: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  quickLinkCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    position: 'relative',
  },
  quickLinkTitle: {
    fontSize: fontSizes.md,
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  quickLinkDescription: {
    fontSize: fontSizes.sm,
  },
  quickLinkIcon: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
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
  faqItem: {
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqIconContainer: {
    marginRight: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  faqChevron: {
    marginLeft: 8,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
    paddingLeft: 44,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  supportIconContainer: {
    marginRight: 12,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  supportDescription: {
    fontSize: 13,
  },
  versionCard: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  versionText: {
    fontSize: fontSizes.sm,
    fontWeight: '600',
    marginBottom: 4,
  },
  versionDescription: {
    fontSize: fontSizes.xs,
  },
});
