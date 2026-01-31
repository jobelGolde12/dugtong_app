import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  variant = 'info' 
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'success': return '#d4edda';
      case 'warning': return '#fff3cd';
      case 'danger': return '#f8d7da';
      case 'info': return '#d1ecf1';
      default: return '#d1ecf1';
    }
  };

  const getColor = () => {
    switch (variant) {
      case 'success': return '#155724';
      case 'warning': return '#856404';
      case 'danger': return '#721c24';
      case 'info': return '#0c5460';
      default: return '#0c5460';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <Text style={[styles.text, { color: getColor() }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});