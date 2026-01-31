import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, ScrollView, Alert, Text, TouchableOpacity } from 'react-native';
import { ReportCard } from '../../components/dashboard/ReportCard';
import { FilterBar } from '../../components/dashboard/FilterBar';
import { LoadingIndicator } from '../../components/dashboard/LoadingIndicator';
import { reportService } from '../../../lib/services/reportService';
import { ReportSummary, BloodTypeDistribution, MonthlyDonationData, AvailabilityTrend } from '../../../types/report.types';

export const ReportsScreen: React.FC = () => {
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [bloodTypeData, setBloodTypeData] = useState<BloodTypeDistribution[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyDonationData[]>([]);
  const [availabilityTrend, setAvailabilityTrend] = useState<AvailabilityTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    bloodType: null,
    municipality: null,
    dateRange: null,
    searchQuery: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all report data
      const [summary, bloodType, monthly, trend] = await Promise.all([
        reportService.getReportSummary(),
        reportService.getBloodTypeDistribution(),
        reportService.getMonthlyDonationData(),
        reportService.getAvailabilityTrend()
      ]);

      setReportSummary(summary);
      setBloodTypeData(bloodType);
      setMonthlyData(monthly);
      setAvailabilityTrend(trend);
    } catch (error) {
      Alert.alert('Error', 'Failed to load report data');
      console.error('Load reports error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterName: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      bloodType: null,
      municipality: null,
      dateRange: null,
      searchQuery: '',
    });
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!reportSummary) {
    return (
      <View style={styles.container}>
        <Alert alertType="error" title="Error" message="Failed to load report data" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        searchPlaceholder="Search reports..."
      />

      <View style={styles.summaryContainer}>
        <ReportCard
          title="Total Donors"
          value={reportSummary.totalDonors}
          subtitle="Registered in system"
          color="#0d6efd"
        />
        <ReportCard
          title="Available Donors"
          value={reportSummary.availableDonors}
          subtitle="Currently available"
          color="#28a745"
        />
        <ReportCard
          title="Requests This Month"
          value={reportSummary.requestsThisMonth}
          subtitle="Pending requests"
          color="#ffc107"
        />
        <ReportCard
          title="Successful Donations"
          value={reportSummary.successfulDonations}
          subtitle="Completed this month"
          color="#17a2b8"
        />
      </View>

      {/* Charts Section */}
      <View style={styles.chartsContainer}>
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Donor Distribution by Blood Type</Text>
          </View>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>Blood Type Distribution Chart</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Donations per Month</Text>
          </View>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>Monthly Donations Chart</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Availability Trends</Text>
          </View>
          <View style={styles.chartPlaceholder}>
            <Text style={styles.chartPlaceholderText}>Availability Trend Chart</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartsContainer: {
    flex: 1,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartHeader: {
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  chartPlaceholder: {
    height: 200,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    fontSize: 16,
    color: '#666',
  },
});