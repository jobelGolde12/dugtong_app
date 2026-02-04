import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import SafeScrollView from '../lib/SafeScrollView';
import { Donor } from '../types/donor.types';
import DashboardLayout from './components/DashboardLayout';
import DonorCard from './components/DonorCard';
import EmptyState from './components/EmptyState';

// Mock donor data - realistic for UI testing
const MOCK_DONORS: Donor[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    bloodType: 'A+',
    municipality: 'New York',
    availabilityStatus: 'Available',
    lastDonation: '2024-01-15',
    contactNumber: '+1 (555) 123-4567',
    email: 'sarah.j@example.com',
  },
  {
    id: '2',
    name: 'Michael Chen',
    bloodType: 'O-',
    municipality: 'Los Angeles',
    availabilityStatus: 'Available',
    lastDonation: '2024-02-01',
    contactNumber: '+1 (555) 987-6543',
    email: 'michael.c@example.com',
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    bloodType: 'B+',
    municipality: 'Chicago',
    availabilityStatus: 'Unavailable',
    lastDonation: '2023-12-20',
    contactNumber: '+1 (555) 456-7890',
    email: 'emma.r@example.com',
  },
  {
    id: '4',
    name: 'James Wilson',
    bloodType: 'AB-',
    municipality: 'Miami',
    availabilityStatus: 'Available',
    lastDonation: '2024-01-30',
    contactNumber: '+1 (555) 234-5678',
    email: 'james.w@example.com',
  },
  {
    id: '5',
    name: 'Lisa Park',
    bloodType: 'O+',
    municipality: 'Seattle',
    availabilityStatus: 'Available',
    lastDonation: '2024-02-10',
    contactNumber: '+1 (555) 876-5432',
    email: 'lisa.p@example.com',
  },
  {
    id: '6',
    name: 'Robert Davis',
    bloodType: 'A-',
    municipality: 'New York',
    availabilityStatus: 'Available',
    lastDonation: '2024-01-25',
    contactNumber: '+1 (555) 345-6789',
    email: 'robert.d@example.com',
  },
  {
    id: '7',
    name: 'Maria Garcia',
    bloodType: 'B-',
    municipality: 'Los Angeles',
    availabilityStatus: 'Unavailable',
    lastDonation: '2023-11-15',
    contactNumber: '+1 (555) 765-4321',
    email: 'maria.g@example.com',
  },
  {
    id: '8',
    name: 'David Kim',
    bloodType: 'AB+',
    municipality: 'Chicago',
    availabilityStatus: 'Available',
    lastDonation: '2024-02-05',
    contactNumber: '+1 (555) 543-2167',
    email: 'david.k@example.com',
  },
];

// Available blood types for filtering
const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Available municipalities extracted from mock data
const MUNICIPALITIES = ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Seattle'];

// Status options
const STATUS_OPTIONS = ['All', 'Available', 'Unavailable'];

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  title,
  options,
  selectedValue,
  onSelect,
}) => {
  const { colors, isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[
              styles.modalContent,
              { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }
            ]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {title}
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={options}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.modalOption,
                      { borderBottomColor: colors.border }
                    ]}
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    <Text style={[styles.modalOptionText, { color: colors.text }]}>
                      {item}
                    </Text>
                    {selectedValue === item && (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default function FindDonorScreen() {
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    bloodType: '',
    municipality: '',
    status: 'All',
  });
  
  const [showBloodTypeModal, setShowBloodTypeModal] = useState(false);
  const [showMunicipalityModal, setShowMunicipalityModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Debounced search function
  useEffect(() => {
    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  // Filter donors based on search query and filters
  const filteredDonors = useMemo(() => {
    return MOCK_DONORS.filter(donor => {
      // Search query filter
      const matchesSearch = searchQuery === '' || 
        donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.municipality.toLowerCase().includes(searchQuery.toLowerCase());

      // Blood type filter
      const matchesBloodType = !filters.bloodType || donor.bloodType === filters.bloodType;

      // Municipality filter
      const matchesMunicipality = !filters.municipality || donor.municipality === filters.municipality;

      // Status filter
      const matchesStatus = filters.status === 'All' || 
        donor.availabilityStatus === filters.status;

      return matchesSearch && matchesBloodType && matchesMunicipality && matchesStatus;
    });
  }, [searchQuery, filters]);

  const handleDonorPress = useCallback((donor: Donor) => {
    Alert.alert(
      'Donor Details',
      `Name: ${donor.name}\nBlood Type: ${donor.bloodType}\nLocation: ${donor.municipality}\nStatus: ${donor.availabilityStatus}\nLast Donation: ${donor.lastDonation}`,
      [{ text: 'OK' }]
    );
  }, []);

  const renderDonorItem = useCallback(({ item }: { item: Donor }) => (
    <DonorCard donor={item} onPress={handleDonorPress} />
  ), [handleDonorPress]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilters({
      bloodType: '',
      municipality: '',
      status: 'All',
    });
  }, []);

  const hasActiveFilters = filters.bloodType || filters.municipality || filters.status !== 'All';

  return (
    <DashboardLayout>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeScrollView
          style={[styles.scrollView, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Find a Donor</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Search for available blood donors in your area
            </Text>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search by name, blood type, or location..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Chips */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: colors.card }]}
              onPress={() => setShowBloodTypeModal(true)}
            >
              <Text style={[styles.filterChipText, { color: colors.text }]}>
                {filters.bloodType || 'Blood Type'}
              </Text>
              <MaterialIcons 
                name="arrow-drop-down" 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: colors.card }]}
              onPress={() => setShowMunicipalityModal(true)}
            >
              <Text style={[styles.filterChipText, { color: colors.text }]}>
                {filters.municipality || 'Location'}
              </Text>
              <MaterialIcons 
                name="arrow-drop-down" 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, { backgroundColor: colors.card }]}
              onPress={() => setShowStatusModal(true)}
            >
              <Text style={[styles.filterChipText, { color: colors.text }]}>
                {filters.status}
              </Text>
              <MaterialIcons 
                name="arrow-drop-down" 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>

            {hasActiveFilters && (
              <TouchableOpacity
                style={[styles.clearFilterChip, { backgroundColor: colors.primary + '20' }]}
                onPress={clearFilters}
              >
                <Ionicons name="close" size={16} color={colors.primary} />
                <Text style={[styles.clearFilterText, { color: colors.primary }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Results Header */}
          <View style={styles.resultsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Available Donors
            </Text>
            <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
              {filteredDonors.length} {filteredDonors.length === 1 ? 'donor' : 'donors'} found
            </Text>
          </View>

          {/* Loading Indicator */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            /* Results List */
            <FlatList
              data={filteredDonors}
              renderItem={renderDonorItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
              ListEmptyComponent={
                <EmptyState
                  icon="search"
                  title="No donors found"
                  message="Try adjusting your search or filters"
                />
              }
              contentContainerStyle={styles.listContent}
            />
          )}

          {/* Filter Modals */}
          <FilterModal
            visible={showBloodTypeModal}
            onClose={() => setShowBloodTypeModal(false)}
            title="Select Blood Type"
            options={BLOOD_TYPES}
            selectedValue={filters.bloodType}
            onSelect={(value) => setFilters(prev => ({ ...prev, bloodType: value }))}
          />

          <FilterModal
            visible={showMunicipalityModal}
            onClose={() => setShowMunicipalityModal(false)}
            title="Select Location"
            options={MUNICIPALITIES}
            selectedValue={filters.municipality}
            onSelect={(value) => setFilters(prev => ({ ...prev, municipality: value }))}
          />

          <FilterModal
            visible={showStatusModal}
            onClose={() => setShowStatusModal(false)}
            title="Select Availability"
            options={STATUS_OPTIONS}
            selectedValue={filters.status}
            onSelect={(value) => setFilters(prev => ({ ...prev, status: value }))}
          />
        </SafeScrollView>
      </KeyboardAvoidingView>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    marginTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    opacity: 0.7,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    marginRight: 8,
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  clearFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
  },
  clearFilterText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  resultCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  listContent: {
    gap: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 16,
  },
});