import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Slider from '@react-native-community/slider';

interface CustomSliderProps {
  style?: any;
  minimumValue: number;
  maximumValue: number;
  step: number;
  value: number;
  onValueChange: (value: number) => void;
  minimumTrackTintColor: string;
  maximumTrackTintColor: string;
  thumbTintColor: string;
}

export const CustomSlider: React.FC<CustomSliderProps> = (props) => {
  if (Platform.OS === 'web') {
    const { style, value, minimumValue, maximumValue, step, onValueChange, minimumTrackTintColor, maximumTrackTintColor, thumbTintColor } = props;
    
    const percentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;
    
    return (
      <View style={[styles.webSliderContainer, style]}>
        <input
          type="range"
          min={minimumValue}
          max={maximumValue}
          step={step}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          style={{
            width: '100%',
            height: 40,
            WebkitAppearance: 'none',
            appearance: 'none',
            background: `linear-gradient(to right, ${minimumTrackTintColor} 0%, ${minimumTrackTintColor} ${percentage}%, ${maximumTrackTintColor} ${percentage}%, ${maximumTrackTintColor} 100%)`,
            outline: 'none',
            borderRadius: 8,
            cursor: 'pointer',
          } as React.CSSProperties}
          className="custom-slider-web"
        />
        <style>
          {`
            .custom-slider-web::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${thumbTintColor};
              cursor: pointer;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            
            .custom-slider-web::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: ${thumbTintColor};
              cursor: pointer;
              border: none;
              box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
          `}
        </style>
      </View>
    );
  }
  
  return <Slider {...props} />;
};

const styles = StyleSheet.create({
  webSliderContainer: {
    width: '100%',
  },
});
