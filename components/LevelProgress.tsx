import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LevelProgressProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

export const LevelProgress: React.FC<LevelProgressProps> = ({ 
  level = 1, 
  xp = 0, 
  xpToNextLevel = 100, 
}) => {
  const progress = Math.min((xp / xpToNextLevel) * 100, 100);
  
  return (
    <View style={styles.container}>
      <Text style={styles.levelText}>レベル {level}</Text>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.xpText}>{xp} / {xpToNextLevel} XP</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 8,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28a745',
  },
  xpText: {
    fontSize: 14,
    color: '#666',
  },
});