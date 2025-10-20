import { Audio } from 'expo-av';
import { Platform } from 'react-native';

export type SoundType = 'complete' | 'click' | 'achievement' | 'levelUp';

interface SoundAsset {
  file: any;
  volume?: number;
}

const SOUND_ASSETS: Record<SoundType, SoundAsset> = {
  complete: {
    file: require('@/assets/sounds/complete.mp3'),
    volume: 0.7,
  },
  click: {
    file: require('@/assets/sounds/complete.mp3'),
    volume: 0.3,
  },
  achievement: {
    file: require('@/assets/sounds/complete.mp3'),
    volume: 0.8,
  },
  levelUp: {
    file: require('@/assets/sounds/complete.mp3'),
    volume: 0.9,
  },
};

class SoundService {
  private sounds: Map<SoundType, Audio.Sound> = new Map();
  private enabled: boolean = true;
  private initialized: boolean = false;
  
  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      if (Platform.OS !== 'web') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      }
      
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize sound service:', error);
    }
  }
  
  private async loadSound(type: SoundType): Promise<Audio.Sound | undefined> {
    try {
      const asset = SOUND_ASSETS[type];
      if (!asset) return undefined;
      
      const { sound } = await Audio.Sound.createAsync(asset.file, {
        volume: asset.volume || 1.0,
        shouldPlay: false,
      });
      
      return sound;
    } catch (error) {
      console.error(`Failed to load sound ${type}:`, error);
      return undefined;
    }
  }
  
  async play(type: SoundType): Promise<void> {
    if (!this.enabled) return;
    
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      let sound = this.sounds.get(type);
      
      if (!sound) {
        sound = await this.loadSound(type);
        if (!sound) return;
        this.sounds.set(type, sound);
      }
      
      await sound.setPositionAsync(0);
      await sound.playAsync();
      
    } catch (error) {
      console.error(`Failed to play sound ${type}:`, error);
    }
  }
  
  async playTimerComplete(): Promise<void> {
    await this.play('complete');
  }
  
  async playClick(): Promise<void> {
    await this.play('click');
  }
  
  async playAchievement(): Promise<void> {
    await this.play('achievement');
  }
  
  async playLevelUp(): Promise<void> {
    await this.play('levelUp');
  }
  
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  isEnabled(): boolean {
    return this.enabled;
  }
  
  async unloadAll(): Promise<void> {
    for (const [type, sound] of this.sounds.entries()) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.error(`Failed to unload sound ${type}:`, error);
      }
    }
    this.sounds.clear();
  }
  
  async cleanup(): Promise<void> {
    await this.unloadAll();
    this.initialized = false;
  }
}

export const soundService = new SoundService();
