import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface ConnectionAlertProps {
  isConnected: boolean;
}

export const ConnectionAlert: React.FC<ConnectionAlertProps> = ({ isConnected }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!isConnected) {
      wasOffline.current = true;
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    } else if (wasOffline.current) {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        delay: 3000,
        useNativeDriver: true,
      }).start(() => {
        wasOffline.current = false;
      });
    }
  }, [isConnected]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isConnected ? '#10B981' : '#EF4444',
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <Ionicons
        name={isConnected ? 'cloud-done' : 'cloud-offline'}
        size={16}
        color="#FFFFFF"
      />
      <Text style={styles.text}>
        {isConnected ? 'Back online' : 'No internet connection'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingTop: 48,
    zIndex: 9999,
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
