import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

export const NetworkStatusBanner: React.FC = () => {
  const netInfo = useNetInfo();

  if (netInfo.isConnected === false) {
    return (
      <View style={styles.banner}>
        <Text style={styles.text}>オフラインモード</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#f39c12',
    padding: 8,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});