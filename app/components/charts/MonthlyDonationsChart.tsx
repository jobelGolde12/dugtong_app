import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../../contexts/ThemeContext';
import type { MonthlyDonationData } from '../../../types/report.types';

interface MonthlyDonationsChartProps {
  data: MonthlyDonationData[];
}

const MonthlyDonationsChart: React.FC<MonthlyDonationsChartProps> = ({ data }) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width - 60;

  const chartData = {
    labels: data.map(d => d.month.substring(5)),
    datasets: [{
      data: data.length > 0 ? data.map(d => d.donations) : [0],
      color: (opacity = 1) => colors.primary,
      strokeWidth: 3
    }]
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Monthly Donation Trends</Text>
      {data.length > 0 ? (
        <LineChart
          data={chartData}
          width={screenWidth}
          height={220}
          chartConfig={{
            backgroundColor: colors.surface,
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => colors.primary,
            labelColor: (opacity = 1) => colors.textSecondary,
            style: { borderRadius: 16 },
            propsForDots: {
              r: '5',
              strokeWidth: '2',
              stroke: colors.primary
            },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: colors.border,
              strokeWidth: 1,
            },
          }}
          bezier
          style={styles.chart}
          fromZero
        />
      ) : (
        <Text style={[styles.noData, { color: colors.textSecondary }]}>No data available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noData: {
    textAlign: 'center',
    padding: 40,
  },
});

export default MonthlyDonationsChart;
