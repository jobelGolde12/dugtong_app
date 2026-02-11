import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useTheme } from '../../../contexts/ThemeContext';
import type { BloodTypeDistribution } from '../../../types/report.types';

interface BloodTypeChartProps {
  data: BloodTypeDistribution[];
}

const BloodTypeChart: React.FC<BloodTypeChartProps> = ({ data }) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width - 60;

  const chartData = {
    labels: data.map(d => d.bloodType),
    datasets: [{
      data: data.map(d => d.count)
    }]
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Donor Distribution by Blood Type</Text>
      {data.length > 0 ? (
        <BarChart
          data={chartData}
          width={screenWidth}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundColor: colors.surface,
            backgroundGradientFrom: colors.surface,
            backgroundGradientTo: colors.surface,
            decimalPlaces: 0,
            color: (opacity = 1) => colors.primary,
            labelColor: (opacity = 1) => colors.textSecondary,
            style: { borderRadius: 16 },
            propsForBackgroundLines: {
              strokeDasharray: '',
              stroke: colors.border,
              strokeWidth: 1,
            },
          }}
          style={styles.chart}
          showValuesOnTopOfBars
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

export default BloodTypeChart;
