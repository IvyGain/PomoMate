import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 600,
}) => {
  const { width } = useWindowDimensions();
  
  const isWeb = Platform.OS === 'web';
  const shouldCenterContent = isWeb && width > maxWidth;
  
  if (!shouldCenterContent) {
    return <>{children}</>;
  }
  
  return (
    <View style={styles.container}>
      <View style={[styles.content, { maxWidth }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
  },
});
