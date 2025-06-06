import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Animated
} from 'react-native';
import { useThemeStore } from '@/store/themeStore';
import { spacing, fontSizes, borderRadius } from '@/constants/theme';
import { Award, Star, Gamepad, ChevronRight } from 'lucide-react-native';
import { useGameStore, Game } from '@/store/gameStore';

interface GameSelectorProps {
  onSelectGame: (gameId: string) => void;
}

export const GameSelector: React.FC<GameSelectorProps> = ({ onSelectGame }) => {
  const { theme } = useThemeStore();
  const { games } = useGameStore();
  
  // Animation for card press
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  
  // Render a game card
  const renderGameCard = (game: Game) => (
    <TouchableOpacity
      key={game.id}
      activeOpacity={0.7}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={() => onSelectGame(game.id)}
    >
      <Animated.View 
        style={[
          styles.gameCard,
          { backgroundColor: theme.card, transform: [{ scale: scaleAnim }] }
        ]}
      >
        <View style={styles.gameHeader}>
          <View style={styles.gameIconContainer}>
            <Text style={styles.gameIcon}>{game.icon || '🎮'}</Text>
          </View>
          <View style={styles.gameInfo}>
            <Text style={[styles.gameTitle, { color: theme.text }]}>{game.name}</Text>
            <View style={styles.gameStats}>
              <View style={styles.statItem}>
                <Star size={14} color={theme.warning} />
                <Text style={[styles.statText, { color: theme.textSecondary }]}>
                  {game.difficulty || '普通'}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Award size={14} color={theme.primary} />
                <Text style={[styles.statText, { color: theme.textSecondary }]}>
                  ハイスコア: {game.highScore}
                </Text>
              </View>
            </View>
          </View>
          <ChevronRight size={20} color={theme.textSecondary} />
        </View>
        
        <Text style={[styles.gameDescription, { color: theme.textSecondary }]}>
          {game.description}
        </Text>
        
        {game.image && (
          <Image 
            source={{ uri: game.image }} 
            style={styles.gameImage}
            resizeMode="cover"
          />
        )}
        
        <View style={styles.gameFooter}>
          <Gamepad size={16} color={theme.primary} />
          <Text style={[styles.playText, { color: theme.primary }]}>プレイする</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>ミニゲーム</Text>
      <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
        休憩時間に楽しめるミニゲームでリフレッシュしましょう
      </Text>
      
      <ScrollView 
        style={styles.gamesList}
        showsVerticalScrollIndicator={false}
      >
        {games.map(renderGameCard)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSizes.md,
    marginBottom: spacing.lg,
  },
  gamesList: {
    flex: 1,
  },
  gameCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  gameIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  gameIcon: {
    fontSize: 20,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  gameStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statText: {
    fontSize: fontSizes.xs,
    marginLeft: 4,
  },
  gameDescription: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.md,
  },
  gameImage: {
    width: '100%',
    height: 120,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  gameFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playText: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
});