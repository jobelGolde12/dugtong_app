import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ReportCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({ 
  title, 
  value, 
  subtitle, 
  color = '#0d6efd' 
}) => {
  return (
    <View style={[styles.container, { borderColor: color }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    margin: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
    color: '#888',
  },
});
export default ReportCard;
