import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
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
import BloodTypeChart from '../../components/charts/BloodTypeChart';
import MonthlyDonationsChart from '../../components/charts/MonthlyDonationsChart';
import AvailabilityChart from '../../components/charts/AvailabilityChart';

// ========== TypeScript Interfaces ==========

interface FilterState {
  bloodType: string | null;
  municipality: string | null;
  dateRange: { start: string; end: string } | null;
  searchQuery: string;
}

interface ExportReportData {
  summary: ReportSummary;
  bloodTypes: BloodTypeDistribution[];
  monthlyDonations: MonthlyDonationData[];
  availabilityTrend: AvailabilityTrend[];
}

interface AvailabilityOption {
  label: string;
  value: string;
}

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
  const [bloodTypeData, setBloodTypeData] = useState<BloodTypeDistribution[]>([]);
  const [monthlyDonations, setMonthlyDonations] = useState<MonthlyDonationData[]>([]);
  const [availabilityTrend, setAvailabilityTrend] = useState<AvailabilityTrend[]>([]);
  const [isExporting, setIsExporting] = useState(false);

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

  const exportData = useMemo<ExportReportData | null>(() => {
    if (!reportSummary) {
      return null;
    }
    return {
      summary: reportSummary,
      bloodTypes: bloodTypeData,
      monthlyDonations,
      availabilityTrend,
    };
  }, [availabilityTrend, bloodTypeData, monthlyDonations, reportSummary]);

  const formatDateForFilename = (date: Date): string => {
    return date.toISOString().slice(0, 10);
  };

  const buildReportHtml = (data: ExportReportData, generatedAt: Date): string => {
    const formatNumber = (value: number): string => new Intl.NumberFormat().format(value);
    const dateLabel = generatedAt.toLocaleString();

    const summaryRows = [
      { label: 'Total Donors', value: formatNumber(data.summary.totalDonors) },
      { label: 'Available Donors', value: formatNumber(data.summary.availableDonors) },
      { label: 'Requests This Month', value: formatNumber(data.summary.requestsThisMonth) },
      { label: 'Successful Donations', value: formatNumber(data.summary.successfulDonations) },
    ];

    const bloodTypeRows = data.bloodTypes
      .map((item) => `<tr><td>${item.bloodType}</td><td>${formatNumber(item.count)}</td></tr>`)
      .join('');

    const monthlyRows = data.monthlyDonations
      .map((item) => `<tr><td>${item.month}</td><td>${formatNumber(item.donations)}</td></tr>`)
      .join('');

    const availabilityRows = data.availabilityTrend
      .map(
        (item) =>
          `<tr><td>${item.date}</td><td>${formatNumber(item.availableCount)}</td><td>${formatNumber(item.unavailableCount)}</td></tr>`
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            :root {
              color-scheme: light;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1f2937;
              margin: 24px;
            }
            h1 {
              font-size: 24px;
              margin: 0 0 8px;
            }
            .muted {
              color: #6b7280;
              font-size: 12px;
            }
            .section {
              margin-top: 24px;
            }
            .section h2 {
              font-size: 16px;
              margin: 0 0 12px;
              color: #111827;
            }
            .summary-grid {
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              gap: 12px;
            }
            .summary-card {
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 12px;
              background: #f9fafb;
            }
            .summary-card .label {
              font-size: 12px;
              color: #6b7280;
            }
            .summary-card .value {
              font-size: 18px;
              font-weight: 600;
              margin-top: 4px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }
            th, td {
              text-align: left;
              padding: 8px 6px;
              border-bottom: 1px solid #e5e7eb;
            }
            th {
              background: #f3f4f6;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <h1>Donation Reports</h1>
          <div class="muted">Generated: ${dateLabel}</div>

          <div class="section">
            <h2>Summary</h2>
            <div class="summary-grid">
              ${summaryRows
                .map(
                  (row) => `
                    <div class="summary-card">
                      <div class="label">${row.label}</div>
                      <div class="value">${row.value}</div>
                    </div>
                  `
                )
                .join('')}
            </div>
          </div>

          <div class="section">
            <h2>Blood Type Distribution</h2>
            <table>
              <thead>
                <tr>
                  <th>Blood Type</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                ${bloodTypeRows || '<tr><td colspan="2">No data available</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Monthly Donations</h2>
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Donations</th>
                </tr>
              </thead>
              <tbody>
                ${monthlyRows || '<tr><td colspan="2">No data available</td></tr>'}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Availability Trend</h2>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Available Donors</th>
                  <th>Unavailable Donors</th>
                </tr>
              </thead>
              <tbody>
                ${availabilityRows || '<tr><td colspan="3">No data available</td></tr>'}
              </tbody>
            </table>
          </div>
        </body>
      </html>
    `;
  };

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);

      // Load all report data
      const [summary, bloodTypes, donations, availability] = await Promise.all([
        reportsApi.getSummary(),
        reportsApi.getBloodTypeDistribution(),
        reportsApi.getMonthlyDonations(),
        reportsApi.getAvailabilityTrend(),
      ]);

      setReportSummary(summary);
      setBloodTypeData(bloodTypes);
      setMonthlyDonations(donations);
      setAvailabilityTrend(availability);
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

  const handleExportReport = async (): Promise<void> => {
    if (!exportData) {
      Alert.alert('Export not available', 'Report data is still loading.');
      return;
    }

    try {
      setIsExporting(true);
      const generatedAt = new Date();
      const fileName = `reports_${formatDateForFilename(generatedAt)}.pdf`;
      const html = buildReportHtml(exportData, generatedAt);

      const { uri } = await Print.printToFileAsync({ html, base64: false });

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (Platform.OS === 'android') {
        const permission = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Export cancelled', 'Permission to save the file was not granted.');
          return;
        }

        const destinationUri = await FileSystem.StorageAccessFramework.createFileAsync(
          permission.directoryUri,
          fileName,
          'application/pdf'
        );

        await FileSystem.writeAsStringAsync(destinationUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert('Export complete', 'Saved to selected folder.');
      } else {
        const targetUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(targetUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        Alert.alert('Export complete', `Saved to ${targetUri}`);
      }
    } catch (error) {
      console.error('Export report error:', error);
      Alert.alert('Export failed', 'We could not generate the PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
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
            
            <BloodTypeChart data={bloodTypeData} />
            
            <MonthlyDonationsChart data={monthlyDonations} />
            
            <AvailabilityChart data={availabilityTrend} />
          </View>

           {/* Quick Actions */}
                <View style={styles.quickActions}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[styles.actionButton, { 
              backgroundColor: colors.surface,
              shadowColor: colors.primary,
              opacity: isExporting ? 0.6 : 1,
            }]} 
            activeOpacity={0.8}
            disabled={isExporting}
            onPress={handleExportReport}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              {isExporting ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="download" size={22} color={colors.primary} />
              )}
            </View>
            <Text style={[styles.actionText, { color: colors.text }]}>
              {isExporting ? 'Exporting...' : 'Export Report'}
            </Text>
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
