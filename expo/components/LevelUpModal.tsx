import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Award } from 'lucide-react-native';
import { spacing } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface LevelUpModalProps {
  visible: boolean;
  level: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  visible,
  level,
  onClose,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  const lightPulse = useRef(new Animated.Value(0)).current;
  const lightRipple1 = useRef(new Animated.Value(0)).current;
  const lightRipple2 = useRef(new Animated.Value(0)).current;
  const lightRipple3 = useRef(new Animated.Value(0)).current;
  const glowIntensity = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const startLightingEffects = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(lightPulse, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(lightPulse, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const createRipple = (animValue: Animated.Value, delay: number) => {
      const validatedDelay = Math.max(0, Math.min(delay, 5000));
      if (!animValue) return;
      
      Animated.loop(
        Animated.sequence([
          Animated.delay(validatedDelay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    createRipple(lightRipple1, 0);
    createRipple(lightRipple2, 1000);
    createRipple(lightRipple3, 2000);

    Animated.timing(glowIntensity, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, [lightPulse, lightRipple1, lightRipple2, lightRipple3, glowIntensity, shimmerAnim]);

  useEffect(() => {
    if (visible) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      slideAnim.setValue(30);
      lightPulse.setValue(0);
      lightRipple1.setValue(0);
      lightRipple2.setValue(0);
      lightRipple3.setValue(0);
      glowIntensity.setValue(0);
      shimmerAnim.setValue(0);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 80,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        startLightingEffects();
      });
    }
  }, [visible, fadeAnim, scaleAnim, slideAnim, lightPulse, lightRipple1, lightRipple2, lightRipple3, glowIntensity, shimmerAnim, startLightingEffects]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={80} tint="systemUltraThinMaterialDark" style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.85)' }]} />
        )}
        
        <Animated.View style={[styles.lightingContainer, {
          opacity: glowIntensity,
        }]}>
          <Animated.View style={[
            styles.centralGlow,
            {
              opacity: lightPulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.8],
              }),
              transform: [{
                scale: lightPulse.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              }],
            },
          ]}>
            <LinearGradient
              colors={['rgba(147, 51, 234, 0.4)', 'rgba(79, 70, 229, 0.3)', 'rgba(59, 130, 246, 0.2)', 'transparent']}
              style={styles.gradientGlow}
            />
          </Animated.View>

          {[lightRipple1, lightRipple2, lightRipple3].map((ripple, index) => (
            <Animated.View
              key={`ripple-${index}`}
              style={[
                styles.ripple,
                {
                  opacity: ripple.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.6, 0],
                  }),
                  transform: [{
                    scale: ripple.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.5, 3],
                    }),
                  }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(147, 51, 234, 0.3)', 'rgba(79, 70, 229, 0.2)', 'transparent']}
                style={styles.rippleGradient}
              />
            </Animated.View>
          ))}

          <Animated.View style={[
            styles.shimmerOverlay,
            {
              opacity: shimmerAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0, 0.3, 0],
              }),
            },
          ]}>
            <LinearGradient
              colors={['transparent', 'rgba(255, 255, 255, 0.1)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.shimmerGradient}
            />
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={[
            styles.container,
            {
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim },
              ],
            },
          ]}
        >
          <View style={[styles.modalContent]}>
            <Animated.View style={[
              styles.glowBorder,
              {
                opacity: glowIntensity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.8],
                }),
              },
            ]}>
              <LinearGradient
                colors={['rgba(147, 51, 234, 0.6)', 'rgba(79, 70, 229, 0.4)', 'rgba(59, 130, 246, 0.3)']} 
                style={styles.borderGradient}
              />
            </Animated.View>

            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Award size={28} color="#FFFFFF" strokeWidth={1.5} />
                </View>
              </View>

              <Text style={styles.congratsText}>LEVEL UP</Text>
              
              <View style={styles.levelContainer}>
                <Text style={styles.levelNumber}>
                  {level}
                </Text>
              </View>

              <Text style={styles.descriptionText}>
                Excellence{"\n"}achieved
              </Text>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl * 2,
  },
  lightingContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  centralGlow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
  },
  gradientGlow: {
    flex: 1,
    borderRadius: 200,
  },
  ripple: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  rippleGradient: {
    flex: 1,
    borderRadius: 150,
  },
  shimmerOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  shimmerGradient: {
    flex: 1,
  },
  container: {
    width: '85%',
    maxWidth: 320,
  },
  modalContent: {
    padding: spacing.xl * 3,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    backgroundColor: '#3A3A42',
    position: 'relative',
  },
  glowBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
  },
  borderGradient: {
    flex: 1,
    borderRadius: 22,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#9333EA',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 20,
    elevation: 10,
  },
  congratsText: {
    fontSize: 11,
    fontWeight: '400',
    marginBottom: spacing.xl * 1.5,
    textAlign: 'center',
    letterSpacing: 2,
    color: '#9CA3AF',
  },
  levelContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl * 3,
  },
  levelNumber: {
    fontSize: 120,
    fontWeight: '200',
    lineHeight: 120,
    color: '#FFFFFF',
    letterSpacing: -4,
    textShadowColor: '#9333EA',
    textShadowOffset: {
      width: 0,
      height: 0,
    },
    textShadowRadius: 30,
  },
  descriptionText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl * 3,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  closeButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
