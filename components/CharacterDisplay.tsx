import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { spacing, fontSizes, borderRadius } from '@/constants/theme';
import { useUserStore } from '@/store/userStore';
import { useThemeStore } from '@/store/themeStore';
import { LinearGradient } from 'expo-linear-gradient';
import { getCharacterByEvolutionPath, CharacterAbility } from '@/constants/characters';
import { ChevronDown, ChevronUp, Zap, Award, Star } from 'lucide-react-native';

// Get screen dimensions for responsive design
const { width } = Dimensions.get('window');

export const CharacterDisplay: React.FC = () => {
  const { 
    characterLevel, 
    characterExp, 
    characterEvolutionPath,
    sessions,
    streak,
    totalMinutes,
    applyCharacterAbility,
    activeAbilities
  } = useUserStore();
  
  const { theme } = useThemeStore();
  
  const [showAbilities, setShowAbilities] = useState(false);
  const [showEvolutionHistory, setShowEvolutionHistory] = useState(false);
  
  // Get current character data
  const character = getCharacterByEvolutionPath(characterEvolutionPath, characterLevel);
  
  // Calculate progress to next evolution
  const nextEvolutionExp = character.nextEvolutionExp || 0;
  const progress = character.nextEvolutionExp ? characterExp / nextEvolutionExp : 1;
  
  // Toggle ability activation
  const toggleAbility = (abilityId: string) => {
    applyCharacterAbility(abilityId);
  };
  
  return (
    <ScrollView style={[styles.scrollContainer, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <LinearGradient
          colors={[character.color, theme.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientBackground}
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.characterName, { color: theme.text }]}>{character.name}</Text>
              <Text style={[styles.characterType, { color: theme.textSecondary }]}>{character.description}</Text>
            </View>
            <View style={[styles.levelBadge, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}>
              <Text style={[styles.characterLevel, { color: theme.text }]}>Lv.{characterLevel}</Text>
            </View>
          </View>
          
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: character.image }}
              style={[styles.characterImage, { borderColor: theme.text }]}
              resizeMode="cover"
            />
            
            <View style={[styles.characterInfoBox, { backgroundColor: 'rgba(0, 0, 0, 0.2)' }]}>
              <Text style={[styles.characterInfoTitle, { color: theme.text }]}>性格:</Text>
              <Text style={[styles.characterInfoText, { color: theme.textSecondary }]}>{character.personality}</Text>
              
              <Text style={[styles.characterInfoTitle, { color: theme.text }]}>特技:</Text>
              {character.abilities.slice(0, 2).map((ability, index) => (
                <Text key={index} style={[styles.characterInfoText, { color: theme.textSecondary }]}>・{ability.name}</Text>
              ))}
              {character.abilities.length > 2 && (
                <Text style={[styles.characterInfoText, { color: theme.textSecondary }]}>・他 {character.abilities.length - 2} 個...</Text>
              )}
            </View>
          </View>
          
          <View style={[styles.statsContainer, { backgroundColor: 'rgba(0, 0, 0, 0.3)' }]}>
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: theme.text }]}>{sessions}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>セッション</Text>
              </View>
              
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: theme.text }]}>{streak}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>連続日数</Text>
              </View>
              
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: theme.text }]}>{totalMinutes}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>合計分</Text>
              </View>
            </View>
            
            {character.nextEvolutionExp && (
              <View style={styles.evolutionContainer}>
                <Text style={[styles.evolutionText, { color: theme.text }]}>
                  次の進化まで: {characterExp}/{nextEvolutionExp} EXP
                </Text>
                <View style={[styles.progressContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                  <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: theme.text }]} />
                </View>
              </View>
            )}
          </View>
        </LinearGradient>
        
        <TouchableOpacity 
          style={[styles.sectionHeader, { backgroundColor: theme.card }]}
          onPress={() => setShowAbilities(!showAbilities)}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>特殊能力</Text>
          {showAbilities ? (
            <ChevronUp size={20} color={theme.text} />
          ) : (
            <ChevronDown size={20} color={theme.text} />
          )}
        </TouchableOpacity>
        
        {showAbilities && (
          <View style={[styles.abilitiesContainer, { backgroundColor: theme.background }]}>
            {character.abilities.map((ability, index) => (
              <View key={index} style={[styles.abilityCard, { backgroundColor: theme.card }]}>
                <View style={styles.abilityHeader}>
                  <Zap size={16} color={character.color} />
                  <Text style={[styles.abilityName, { color: theme.text }]}>{ability.name}</Text>
                </View>
                <Text style={[styles.abilityDescription, { color: theme.textSecondary }]}>{ability.description}</Text>
                <View style={styles.abilityFooter}>
                  <Text style={[styles.abilityType, { color: theme.textSecondary }]}>
                    {ability.type === 'timerBoost' && 'タイマー強化'}
                    {ability.type === 'xpBoost' && '経験値強化'}
                    {ability.type === 'streakProtection' && 'ストリーク保護'}
                    {ability.type === 'focusEnhancement' && '集中力強化'}
                    {ability.type === 'breakTimeReduction' && '休憩時間効率化'}
                    {ability.type === 'gameScoreBoost' && 'ゲームスコア強化'}
                    {ability.type === 'achievementBoost' && '実績報酬強化'}
                    {ability.type === 'specialUnlock' && '特殊能力'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => toggleAbility(ability.id)}
                    style={[
                      styles.abilityStatus, 
                      activeAbilities.includes(ability.id) ? styles.abilityActive : styles.abilityInactive
                    ]}
                  >
                    <Text style={[styles.abilityStatusText, { color: theme.text }]}>
                      {activeAbilities.includes(ability.id) ? '有効' : '無効'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.sectionHeader, { backgroundColor: theme.card }]}
          onPress={() => setShowEvolutionHistory(!showEvolutionHistory)}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>進化の歴史</Text>
          {showEvolutionHistory ? (
            <ChevronUp size={20} color={theme.text} />
          ) : (
            <ChevronDown size={20} color={theme.text} />
          )}
        </TouchableOpacity>
        
        {showEvolutionHistory && (
          <View style={[styles.evolutionHistoryContainer, { backgroundColor: theme.background }]}>
            {characterEvolutionPath.map((type, index) => {
              if (index >= characterLevel) return null;
              
              // Get the character at each evolution level
              const historyChar = getCharacterByEvolutionPath(
                characterEvolutionPath.slice(0, index + 1), 
                index + 1
              );
              
              return (
                <View key={index} style={styles.evolutionStep}>
                  <View style={styles.evolutionStepHeader}>
                    <View style={[styles.evolutionDot, { backgroundColor: historyChar.color }]} />
                    <Text style={[styles.evolutionStepLevel, { color: theme.textSecondary }]}>レベル {index + 1}</Text>
                  </View>
                  <View style={styles.evolutionStepContent}>
                    <Image 
                      source={{ uri: historyChar.image }} 
                      style={styles.evolutionStepImage} 
                    />
                    <View style={styles.evolutionStepInfo}>
                      <Text style={[styles.evolutionStepName, { color: theme.text }]}>{historyChar.name}</Text>
                      <Text style={[styles.evolutionStepDesc, { color: theme.textSecondary }]}>{historyChar.description}</Text>
                      <Text style={[styles.evolutionStepType, { color: theme.textSecondary }]}>
                        タイプ: {type === 'balanced' ? 'バランス型' : 
                                type === 'focused' ? '集中型' : '継続型'}
                      </Text>
                    </View>
                  </View>
                  {index < characterLevel - 1 && (
                    <View style={[styles.evolutionLine, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]} />
                  )}
                </View>
              );
            })}
            
            {character.nextEvolutionExp && (
              <View style={[styles.nextEvolutionContainer, { backgroundColor: theme.card }]}>
                <Text style={[styles.nextEvolutionTitle, { color: theme.text }]}>次の進化</Text>
                <Text style={[styles.nextEvolutionDesc, { color: theme.textSecondary }]}>
                  あと {nextEvolutionExp - characterExp} EXP で次のレベルに進化します！
                </Text>
                <View style={[styles.nextEvolutionProgress, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                  <View style={[styles.nextEvolutionProgressBar, { width: `${progress * 100}%`, backgroundColor: theme.primary }]} />
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  gradientBackground: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  characterName: {
    fontSize: fontSizes.xl,
    fontWeight: 'bold',
  },
  characterType: {
    fontSize: fontSizes.sm,
    marginTop: spacing.xs / 2,
  },
  levelBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  characterLevel: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  characterImage: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: borderRadius.circle,
    borderWidth: 3,
  },
  characterInfoBox: {
    flex: 1,
    marginLeft: spacing.md,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  characterInfoTitle: {
    fontSize: fontSizes.sm,
    fontWeight: 'bold',
    marginBottom: spacing.xs / 2,
  },
  characterInfoText: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.xs,
  },
  statsContainer: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: fontSizes.lg,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: fontSizes.sm,
  },
  evolutionContainer: {
    marginTop: spacing.sm,
  },
  evolutionText: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.xs,
  },
  progressContainer: {
    height: 8,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
  },
  sectionTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  abilitiesContainer: {
    padding: spacing.md,
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
  },
  abilityCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  abilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  abilityName: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginLeft: spacing.xs,
  },
  abilityDescription: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.sm,
  },
  abilityFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  abilityType: {
    fontSize: fontSizes.xs,
  },
  abilityStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
  },
  abilityActive: {
    backgroundColor: 'rgba(107, 203, 119, 0.2)',
  },
  abilityInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  abilityStatusText: {
    fontSize: fontSizes.xs,
  },
  evolutionHistoryContainer: {
    padding: spacing.md,
    borderBottomLeftRadius: borderRadius.md,
    borderBottomRightRadius: borderRadius.md,
  },
  evolutionStep: {
    marginBottom: spacing.lg,
  },
  evolutionStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  evolutionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.sm,
  },
  evolutionStepLevel: {
    fontSize: fontSizes.sm,
  },
  evolutionStepContent: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginLeft: spacing.md,
  },
  evolutionStepImage: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.circle,
  },
  evolutionStepInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  evolutionStepName: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
  },
  evolutionStepDesc: {
    fontSize: fontSizes.xs,
  },
  evolutionStepType: {
    fontSize: fontSizes.xs,
    marginTop: spacing.xs,
  },
  evolutionLine: {
    position: 'absolute',
    left: 6,
    top: 12,
    width: 2,
    height: '100%',
  },
  nextEvolutionContainer: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  nextEvolutionTitle: {
    fontSize: fontSizes.md,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  nextEvolutionDesc: {
    fontSize: fontSizes.sm,
    marginBottom: spacing.md,
  },
  nextEvolutionProgress: {
    height: 8,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  nextEvolutionProgressBar: {
    height: '100%',
  },
});