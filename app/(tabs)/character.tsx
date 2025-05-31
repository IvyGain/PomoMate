import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '@/store/themeStore';
import { useUserStore } from '@/store/userStore';
import { CharacterDisplay } from '@/components/CharacterDisplay';
import ProfileHeader from '@/components/ProfileHeader';
import { getCharacterByEvolutionPath } from '@/constants/characters';

export default function CharacterScreen() {
  const { theme } = useThemeStore();
  const userStats = useUserStore();
  
  const character = getCharacterByEvolutionPath(
    userStats.characterEvolutionPath,
    userStats.characterLevel
  );
  
  // Calculate progress to next evolution
  const evolutionProgress = character.nextEvolutionExp 
    ? (userStats.characterExp / character.nextEvolutionExp) * 100
    : 100;
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView>
        <ProfileHeader />
        
        <View style={styles.characterContainer}>
          <CharacterDisplay />
          
          <View style={styles.statsContainer}>
            <Text style={[styles.characterName, { color: theme.text }]}>
              {character.name}
            </Text>
            
            <Text style={[styles.characterType, { color: theme.primary }]}>
              {character.personality === 'balanced' ? 'バランス型' : 
               character.personality === 'focused' ? '集中型' : '継続型'}
            </Text>
            
            <Text style={[styles.characterDescription, { color: theme.textSecondary }]}>
              {character.description}
            </Text>
            
            {character.nextEvolutionExp && (
              <View style={styles.evolutionContainer}>
                <View style={styles.evolutionLabelContainer}>
                  <Text style={[styles.evolutionLabel, { color: theme.text }]}>
                    次の進化まで
                  </Text>
                  <Text style={[styles.evolutionValue, { color: theme.text }]}>
                    {userStats.characterExp} / {character.nextEvolutionExp}
                  </Text>
                </View>
                
                <View style={[styles.progressBarBackground, { backgroundColor: theme.card }]}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { 
                        backgroundColor: theme.primary,
                        width: `${evolutionProgress}%` 
                      }
                    ]} 
                  />
                </View>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.abilitiesSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            特殊能力
          </Text>
          
          {character.abilities.map((ability, index) => (
            <View 
              key={index} 
              style={[styles.abilityCard, { backgroundColor: theme.card }]}
            >
              <View style={styles.abilityHeader}>
                <Text style={[styles.abilityName, { color: theme.text }]}>
                  {ability.name}
                </Text>
                <View 
                  style={[
                    styles.abilityBadge, 
                    { 
                      backgroundColor: ability.isActive ? theme.success : theme.inactive,
                      opacity: ability.isActive ? 1 : 0.7
                    }
                  ]}
                >
                  <Text style={styles.abilityBadgeText}>
                    {ability.isActive ? '有効' : '未開放'}
                  </Text>
                </View>
              </View>
              
              <Text style={[styles.abilityDescription, { color: theme.textSecondary }]}>
                {ability.description}
              </Text>
              
              {ability.value && (
                <Text style={[styles.abilityBonus, { color: theme.primary }]}>
                  ボーナス: +{ability.value}%
                </Text>
              )}
            </View>
          ))}
        </View>
        
        <View style={styles.evolutionHistorySection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            進化の履歴
          </Text>
          
          <View style={[styles.evolutionHistoryCard, { backgroundColor: theme.card }]}>
            {userStats.characterEvolutionPath.map((type, index) => {
              const evolutionCharacter = getCharacterByEvolutionPath(
                userStats.characterEvolutionPath.slice(0, index + 1),
                index + 1
              );
              
              return (
                <View key={index} style={styles.evolutionHistoryItem}>
                  <View 
                    style={[
                      styles.evolutionHistoryDot, 
                      { 
                        backgroundColor: index === userStats.characterLevel - 1 ? 
                          theme.primary : theme.inactive 
                      }
                    ]} 
                  />
                  <View style={styles.evolutionHistoryContent}>
                    <Text style={[styles.evolutionHistoryName, { color: theme.text }]}>
                      {evolutionCharacter.name}
                    </Text>
                    <Text style={[styles.evolutionHistoryType, { color: theme.textSecondary }]}>
                      {type === 'balanced' ? 'バランス型' : 
                       type === 'focused' ? '集中型' : '継続型'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  characterContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  characterName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  characterType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  characterDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  evolutionContainer: {
    width: '100%',
  },
  evolutionLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  evolutionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  evolutionValue: {
    fontSize: 14,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  abilitiesSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  abilityCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  abilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  abilityName: {
    fontSize: 16,
    fontWeight: '600',
  },
  abilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  abilityBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  abilityDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  abilityBonus: {
    fontSize: 14,
    fontWeight: '600',
  },
  evolutionHistorySection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  evolutionHistoryCard: {
    borderRadius: 12,
    padding: 16,
  },
  evolutionHistoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  evolutionHistoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  evolutionHistoryContent: {
    flex: 1,
  },
  evolutionHistoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  evolutionHistoryType: {
    fontSize: 14,
  },
});