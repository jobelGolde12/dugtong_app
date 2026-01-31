import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { reportService } from '../../../lib/services/reportService';
import type {
  AvailabilityTrend,
  BloodTypeDistribution,
  MonthlyDonationData,
  ReportSummary
} from '../../../types/report.types';
import { LoadingIndicator } from '../../components/dashboard/LoadingIndicator';

// ========== TypeScript Interfaces ==========

interface FilterState {
  bloodType: string | null;
  municipality: string | null;
  dateRange: { start: string; end: string } | null;
  searchQuery: string;
}

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  color: string;
  icon: string;
}

interface AvailabilityOption {
  label: string;
  value: string;
}

// ========== Reusable Components ==========
const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, color, icon }) => (
  <TouchableOpacity 
    style={styles.statCard}
    activeOpacity={0.7}
  >
    <View style={styles.statIconContainer}>
      <Ionicons name={icon as any} size={24} color={color} />
    </View>
    <View style={styles.statContent}>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
    <View style={[styles.statIndicator, { backgroundColor: color + '20' }]} />
  </TouchableOpacity>
);

const ChartPlaceholder: React.FC<{ title: string; dataPoints: number }> = ({ title, dataPoints }) => (
  <View style={styles.chartContainer}>
    <Text style={styles.chartTitle}>{title}</Text>
    <View style={styles.chartVisual}>
      {Array.from({ length: dataPoints }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.chartBar,
            { height: `${20 + Math.random() * 60}%` }
          ]}
        />
      ))}
    </View>
  </View>
);

const FilterSelect: React.FC<{
  label: string;
  value: string | null;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  placeholder?: string;
}> = ({ label, value, options, onSelect, placeholder = "Select..." }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <>
      <TouchableOpacity
        style={styles.filterSelect}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View>
          <Text style={styles.filterSelectLabel}>{label}</Text>
          <Text style={styles.filterSelectValue}>{selectedLabel}</Text>
        </View>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalOptions}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    value === option.value && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    onSelect(option.value);
                    setModalVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.modalOptionText,
                    value === option.value && styles.modalOptionTextSelected
                  ]}>
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <Ionicons name="checkmark" size={20} color="#4A6FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

// ========== Main Component ==========
export const ReportsScreen: React.FC = () => {
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);
  const [bloodTypeData, setBloodTypeData] = useState<BloodTypeDistribution[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyDonationData[]>([]);
  const [availabilityTrend, setAvailabilityTrend] = useState<AvailabilityTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    bloodType: null,
    municipality: null,
    dateRange: null,
    searchQuery: '',
  });
  const [searchFocused, setSearchFocused] = useState(false);

  // Mock data for availability options
  const availabilityOptions: AvailabilityOption[] = [
    { label: 'All', value: 'all' },
    { label: 'Available Now', value: 'available' },
    { label: 'Unavailable', value: 'unavailable' },
    { label: 'On Vacation', value: 'vacation' },
    { label: 'Recently Donated', value: 'recent' },
  ];

  // Mock data for blood types
  const bloodTypeOptions = [
    { label: 'All Blood Types', value: 'all' },
    { label: 'A+', value: 'A+' },
    { label: 'A-', value: 'A-' },
    { label: 'B+', value: 'B+' },
    { label: 'B-', value: 'B-' },
    { label: 'O+', value: 'O+' },
    { label: 'O-', value: 'O-' },
    { label: 'AB+', value: 'AB+' },
    { label: 'AB-', value: 'AB-' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (): Promise<void> => {
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

  const handleFilterChange = (filterName: keyof FilterState, value: any): void => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleClearFilters = (): void => {
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
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorTitle}>Unable to Load Data</Text>
        <Text style={styles.errorMessage}>Please check your connection and try again.</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        bounces={true}
        overScrollMode="always"
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Dashboard</Text>
            <Text style={styles.headerSubtitle}>Real-time donation insights</Text>
          </View>
          <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
            <Ionicons name="refresh" size={24} color="#4A6FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.scrollContent}>
          {/* Search Bar */}
          <View style={[
            styles.searchContainer,
            searchFocused && styles.searchContainerFocused
          ]}>
            <Ionicons 
              name="search" 
              size={20} 
              color={searchFocused ? "#4A6FFF" : "#999"} 
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search donors, locations..."
              placeholderTextColor="#999"
              value={filters.searchQuery}
              onChangeText={(text) => handleFilterChange('searchQuery', text)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {filters.searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleFilterChange('searchQuery', '')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Row */}
          <View style={styles.filterRow}>
            <FilterSelect
              label="Blood Type"
              value={filters.bloodType}
              options={bloodTypeOptions}
              onSelect={(value) => handleFilterChange('bloodType', value)}
              placeholder="All Types"
            />
            <FilterSelect
              label="Availability"
              value={filters.municipality}
              options={availabilityOptions}
              onSelect={(value) => handleFilterChange('municipality', value)}
              placeholder="All Status"
            />
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              title="Total Donors"
              value={reportSummary.totalDonors}
              subtitle="Registered in system"
              color="#4A6FFF"
              icon="people-outline"
            />
            <StatCard
              title="Available Now"
              value={reportSummary.availableDonors}
              subtitle="Ready to donate"
              color="#00C896"
              icon="checkmark-circle-outline"
            />
            <StatCard
              title="This Month"
              value={reportSummary.requestsThisMonth}
              subtitle="Blood requests"
              color="#FF9F43"
              icon="calendar-outline"
            />
            <StatCard
              title="Successful"
              value={reportSummary.successfulDonations}
              subtitle="Completed donations"
              color="#9B51E0"
              icon="trophy-outline"
            />
          </View>

          {/* Charts Section */}
          <View style={styles.chartsSection}>
            <Text style={styles.sectionTitle}>Analytics Overview</Text>
            
            <ChartPlaceholder 
              title="Donor Distribution by Blood Type" 
              dataPoints={8}
            />
            
            <ChartPlaceholder 
              title="Monthly Donation Trends" 
              dataPoints={12}
            />
            
            <ChartPlaceholder 
              title="Availability Overview" 
              dataPoints={7}
            />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <Ionicons name="download-outline" size={24} color="#4A6FFF" />
                <Text style={styles.actionText}>Export Report</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <Ionicons name="notifications-outline" size={24} color="#4A6FFF" />
                <Text style={styles.actionText}>Send Alerts</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <Ionicons name="add-circle-outline" size={24} color="#4A6FFF" />
                <Text style={styles.actionText}>Add Donor</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Clear Filters Button */}
        {(filters.bloodType || filters.municipality || filters.searchQuery) && (
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={handleClearFilters}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color="#fff" />
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

// ========== Styles ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: '#F5F7FF',
    borderRadius: 12,
  },

  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F5F7FF',
  },
  searchContainerFocused: {
    borderColor: '#4A6FFF',
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1A1A1A',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  filterSelect: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  filterSelectLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  filterSelectValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: Dimensions.get('window').width / 2 - 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 150,
    maxHeight: 150,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F5F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 11,
    color: '#666',
  },
  statIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    borderBottomLeftRadius: 30,
  },
  chartsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  chartVisual: {
    flexDirection: 'row',
    height: 180,
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    gap: 8,
  },
  chartBar: {
    flex: 1,
    backgroundColor: '#4A6FFF',
    borderRadius: 8,
    opacity: 0.8,
  },
  quickActions: {
    marginBottom: 32,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F7FF',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A6FFF',
  },
  clearFiltersButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A6FFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#4A6FFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    gap: 8,
  },
  clearFiltersText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalOptions: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalOptionSelected: {
    backgroundColor: '#F5F7FF',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  modalOptionTextSelected: {
    color: '#4A6FFF',
    fontWeight: '600',
  },
  // Error State Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1A1A1A',
    marginTop: 24,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#4A6FFF',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});