import React, { useMemo } from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
  variant?: 'default' | 'wide' | 'narrow';
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 800,
  variant = 'default',
}) => {
  const { width } = useWindowDimensions();
  
  const isWeb = Platform.OS === 'web';
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  
  const containerMaxWidth = useMemo(() => {
    if (variant === 'narrow') return Math.min(maxWidth * 0.7, 600);
    if (variant === 'wide') return Math.min(maxWidth * 1.3, 1200);
    return maxWidth;
  }, [maxWidth, variant]);
  
  const shouldCenterContent = isWeb && width > containerMaxWidth;
  const horizontalPadding = useMemo(() => {
    if (!isWeb) return 0;
    if (isDesktop) return 40;
    if (isTablet) return 24;
    return 16;
  }, [isWeb, isDesktop, isTablet]);
  
  if (!shouldCenterContent) {
    return <>{children}</>;
  }
  
  return (
    <View style={styles.container}>
      <View style={[
        styles.content,
        {
          maxWidth: containerMaxWidth,
          paddingHorizontal: horizontalPadding,
        }
      ]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
  },
});
