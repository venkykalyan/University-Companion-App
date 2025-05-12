// components/FullScreenLoader.tsx
import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

const FullScreenLoader = () => (
  <View style={styles.overlay}>
    <ActivityIndicator size="large" color="#000" />
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999
  },
});

export default FullScreenLoader;
