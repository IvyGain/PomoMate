import React from 'react';
import { View, ViewStyle, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

export interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  safe?: boolean;
  scroll?: boolean;
  center?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
  flex?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  style,
  safe = false,
  scroll = false,
  center = false,
  padding = 'medium',
  flex = true,
}) => {
  const paddingKey = `padding${padding.charAt(0).toUpperCase() + padding.slice(1)}` as keyof typeof styles;
  const containerStyles = [
    flex && styles.flex,
    center && styles.center,
    styles[paddingKey],
    style,
  ];

  const content = (
    <View style={containerStyles}>
      {children}
    </View>
  );

  if (scroll) {
    const scrollContent = (
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[
          center && styles.scrollCenter,
          !flex && containerStyles,
        ]}
        showsVerticalScrollIndicator={false}
      >
        {flex ? content : children}
      </ScrollView>
    );
    
    return safe ? (
      <SafeAreaView style={styles.flex}>{scrollContent}</SafeAreaView>
    ) : scrollContent;
  }

  if (safe) {
    return (
      <SafeAreaView style={[styles.flex, style]}>
        <View style={containerStyles}>
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollCenter: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: 8,
  },
  paddingMedium: {
    padding: 16,
  },
  paddingLarge: {
    padding: 24,
  },
});