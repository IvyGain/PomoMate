import React, { useState, useCallback } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';

interface CustomSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue: number;
  maximumValue: number;
  step?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
}

export const CustomSlider: React.FC<CustomSliderProps> = ({
  value,
  onValueChange,
  minimumValue,
  maximumValue,
  step = 1,
  minimumTrackTintColor = '#4A90E2',
  maximumTrackTintColor = '#D1D5DB',
  thumbTintColor = '#4A90E2',
}) => {
  const [sliderWidth, setSliderWidth] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const getValueFromPosition = useCallback(
    (x: number) => {
      const percentage = Math.max(0, Math.min(1, x / sliderWidth));
      const rawValue = minimumValue + percentage * (maximumValue - minimumValue);
      const steppedValue = Math.round(rawValue / step) * step;
      return Math.max(minimumValue, Math.min(maximumValue, steppedValue));
    },
    [sliderWidth, minimumValue, maximumValue, step]
  );

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      setIsDragging(true);
      const newValue = getValueFromPosition(gestureState.x0 - gestureState.dx);
      onValueChange(newValue);
    },
    onPanResponderMove: (evt, gestureState) => {
      const newValue = getValueFromPosition(gestureState.moveX);
      onValueChange(newValue);
    },
    onPanResponderRelease: () => {
      setIsDragging(false);
    },
  });

  const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

  return (
    <View
      style={styles.container}
      onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
      {...panResponder.panHandlers}
    >
      <View style={styles.track}>
        <View
          style={[
            styles.minimumTrack,
            {
              width: `${percentage}%`,
              backgroundColor: minimumTrackTintColor,
            },
          ]}
        />
        <View
          style={[
            styles.maximumTrack,
            {
              width: `${100 - percentage}%`,
              backgroundColor: maximumTrackTintColor,
            },
          ]}
        />
      </View>
      <View
        style={[
          styles.thumb,
          {
            left: `${percentage}%`,
            backgroundColor: thumbTintColor,
            transform: [{ scale: isDragging ? 1.2 : 1 }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    flex: 1,
  },
  track: {
    height: 4,
    flexDirection: 'row',
    borderRadius: 2,
    overflow: 'hidden',
  },
  minimumTrack: {
    height: 4,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  maximumTrack: {
    height: 4,
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
});
