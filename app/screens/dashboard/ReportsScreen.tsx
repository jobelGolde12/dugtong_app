import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { reportsApi } from '../../../api/reports';
import type {
  AvailabilityTrend,
  BloodTypeDistribution,
  MonthlyDonationData,
  ReportSummary
} from '../../../types/report.types';
import LoadingIndicator from '../../components/dashboard/LoadingIndicator';
import StatsGrid from '../../components/dashboard/StatsGrid';

// ========== TypeScript Interfaces ==========

interface FilterState {
  bloodType: string | null;
  municipality: string | null;
  dateRange: { start: string; end: string } | null;
  searchQuery: string;
}



interface AvailabilityOption {
  label: string;
  value: string;
}



const ChartPlaceholder: React.FC<{ title: string; dataPoints: number }> = ({ title, dataPoints }) => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.chartTitle, { color: colors.text }]}>{title}</Text>
      <View style={styles.chartVisual}>
        {Array.from({ length: dataPoints }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.chartBar,
              { height: `${20 + Math.random() * 60}%`, backgroundColor: colors.primary }
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const FilterSelect: React.FC<{
  label: string;
  value: string | null;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  placeholder?: string;
}> = ({ label, value, options, onSelect, placeholder = "Select..." }) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

  return (
    <>
      <TouchableOpacity
        style={[styles.filterSelect, { backgroundColor: colors.surface }]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View>
          <Text style={[styles.filterSelectLabel, { color: colors.textSecondary }]}>{label}</Text>
          <Text style={[styles.filterSelectValue, { color: colors.text }]}>{selectedLabel}</Text>
        </View>
        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

       <Modal
         animationType="slide"
         transparent={true}
         visible={modalVisible}
         onRequestClose={() => setModalVisible(false)}
       >
         <View style={styles.modalOverlay}>
           <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
             <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
               <Text style={[styles.modalTitle, { color: colors.text }]}>{label}</Text>
               <TouchableOpacity onPress={() => setModalVisible(false)}>
                 <Ionicons name="close" size={24} color={colors.text} />
               </TouchableOpacity>
             </View>
             <ScrollView style={styles.modalOptions}>
               {options.map((option) => (
                 <TouchableOpacity
                   key={option.value}
                   style={[
                     styles.modalOption,
                     { borderBottomColor: colors.border },
                     value === option.value && [styles.modalOptionSelected, { backgroundColor: colors.primary + '20' }]
                   ]}
                   onPress={() => {
                     onSelect(option.value);
                     setModalVisible(false);
                   }}
                   activeOpacity={0.7}
                 >
                   <Text style={[
                     styles.modalOptionText,
                     { color: colors.text },
                     value === option.value && [styles.modalOptionTextSelected, { color: colors.primary }]
                   ]}>
                     {option.label}
                   </Text>
                   {value === option.value && (
                     <Ionicons name="checkmark" size={20} color={colors.primary} />
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
const ReportsScreen: React.FC = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [reportSummary, setReportSummary] = useState<ReportSummary | null>(null);

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
      const [summary] = await Promise.all([
        reportsApi.getSummary(),
      ]);

      setReportSummary(summary);
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
       <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
         <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
         <Text style={[styles.errorTitle, { color: colors.text }]}>Unable to Load Data</Text>
         <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>Please check your connection and try again.</Text>
         <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={loadData}>
           <Text style={styles.retryButtonText}>Retry</Text>
         </TouchableOpacity>
       </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        keyboardDismissMode="on-drag"
        bounces={true}
        overScrollMode="always"
      >
        {/* Header */}
        {/* <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Dashboard</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Real-time donation insights</Text>
          </View>
           <TouchableOpacity style={[styles.refreshButton, { backgroundColor: colors.primary + '20' }]} onPress={loadData}>
             <Ionicons name="refresh" size={24} color={colors.primary} />
           </TouchableOpacity>
        </View> */}

        <View style={styles.scrollContent}>
          {/* Search Bar */}
          <View style={[
            styles.searchContainer,
            { backgroundColor: colors.surface, borderColor: colors.surface },
            searchFocused && [styles.searchContainerFocused, { borderColor: colors.primary, backgroundColor: colors.background }]
          ]}>
            <Ionicons 
              name="search" 
              size={20} 
              color={searchFocused ? colors.primary : colors.textSecondary} 
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search donors, locations..."
              placeholderTextColor={colors.textSecondary}
              value={filters.searchQuery}
              onChangeText={(text) => handleFilterChange('searchQuery', text)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {filters.searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleFilterChange('searchQuery', '')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
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
          <StatsGrid
            totalDonors={reportSummary.totalDonors}
            availableDonors={reportSummary.availableDonors}
            requestsThisMonth={reportSummary.requestsThisMonth}
            successfulDonations={reportSummary.successfulDonations}
          />

           {/* Charts Section */}
           <View style={styles.chartsSection}>
             <Text style={[styles.sectionTitle, { color: colors.text }]}>Analytics Overview</Text>
            
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[styles.actionButton, { 
              backgroundColor: colors.surface,
              shadowColor: colors.primary 
            }]} 
            activeOpacity={0.8}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="download" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Export Report</Text>
            <View style={[styles.actionSubtext, { backgroundColor: colors.primary }]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { 
              backgroundColor: colors.surface,
              shadowColor: colors.primary 
            }]} 
            activeOpacity={0.8}
            onPress={() => router.push('/send-alerts')}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="notifications" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Create Notification</Text>
            <View style={[styles.actionSubtext, { backgroundColor: colors.primary }]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { 
              backgroundColor: colors.surface,
              shadowColor: colors.primary 
            }]} 
            activeOpacity={0.8}
            onPress={() => router.push('/AddDonorPage')}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="person-add" size={22} color={colors.primary} />
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>Add Donor</Text>
            <View style={[styles.actionSubtext, { backgroundColor: colors.primary }]} />
          </TouchableOpacity>
        </View>
      </View>
        </View>

         {/* Clear Filters Button */}
         {(filters.bloodType || filters.municipality || filters.searchQuery) && (
           <TouchableOpacity 
             style={[styles.clearFiltersButton, { backgroundColor: colors.primary }]}
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
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 12,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  searchContainerFocused: {
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
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
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  filterSelectLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  filterSelectValue: {
    fontSize: 16,
    fontWeight: '500',
  },

  chartsSection: {
    marginBottom: 32,
  },
  chartContainer: {
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
    borderRadius: 8,
    opacity: 0.8,
  },
  clearFiltersButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
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
  },
  modalOptionSelected: {
    backgroundColor: '#F5F7FF',
  },
  modalOptionText: {
    fontSize: 16,
  },
  modalOptionTextSelected: {
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  retryButton: {
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Updated Quick Actions Styles for Row Display
  quickActions: {
    marginTop: 32,
    paddingHorizontal: 0, // Adjusted to align better with other sections
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  actionsGrid: {
    flexDirection: 'row', // Force items into a row
    justifyContent: 'space-between', // Space them evenly
    gap: 10,
  },
  actionButton: {
    flex: 1, // Let buttons grow to fill equal space
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 44, // Slightly smaller to ensure fit in a row
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 11, // Smaller text to prevent wrapping on small screens
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  actionSubtext: {
    width: 20,
    height: 3,
    borderRadius: 2,
    opacity: 0.6,
  },
});
export default ReportsScreen;
