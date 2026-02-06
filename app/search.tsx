import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { donorApi } from '../api/donors';
import { useTheme } from '../contexts/ThemeContext';
import { Donor } from '../types/donor.types';
import DashboardLayout from './components/DashboardLayout';
import DonorCard from './components/DonorCard';
import EmptyState from './components/EmptyState';
import ErrorToast from './components/ErrorToast';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const MUNICIPALITIES = ['Manila', 'Quezon City', 'Cebu City', 'Davao City', 'Makati', 'Taguig', 'Pasig', 'Mandaluyong', 'Sorsogon City'];
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
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.modalBackdrop, {
            opacity: slideAnim.interpolate({
              inputRange: [0, SCREEN_HEIGHT],
              outputRange: [1, 0]
            })
          }]} />
        </TouchableWithoutFeedback>

        <Animated.View style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
            backgroundColor: isDark ? colors.card : '#fff',
          }
        ]}>
          <View style={styles.modalHandleContainer}>
            <View style={[styles.modalHandle, { backgroundColor: isDark ? '#444' : '#ddd' }]} />
          </View>

          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
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
                  {
                    backgroundColor: selectedValue === item
                      ? colors.primary + '15'
                      : 'transparent',
                  }
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <View style={[
                    styles.optionIcon,
                    { backgroundColor: selectedValue === item ? colors.primary + '20' : colors.border }
                  ]}>
                    <Text style={[
                      styles.optionIconText,
                      { color: selectedValue === item ? colors.primary : colors.textSecondary }
                    ]}>
                      {item.charAt(0)}
                    </Text>
                  </View>
                  <Text style={[styles.modalOptionText, {
                    color: colors.text,
                    fontWeight: selectedValue === item ? '600' : '400'
                  }]}>
                    {item}
                  </Text>
                </View>
                {selectedValue === item && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalOptionsContainer}
          />
        </Animated.View>
      </View>
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

  const [donors, setDonors] = useState<Donor[]>([]);
  const [showBloodTypeModal, setShowBloodTypeModal] = useState(false);
  const [showMunicipalityModal, setShowMunicipalityModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchInputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerScale = useRef(new Animated.Value(0.95)).current;
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(headerScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchDonors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await donorApi.getDonors({
        bloodType: filters.bloodType || null,
        municipality: filters.municipality || null,
        availability: filters.status === 'All' ? null : filters.status === 'Available',
        searchQuery: searchQuery,
      });
      setDonors(result.items);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch donors');
      console.error('Error fetching donors:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [filters, searchQuery]);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Immediate fetch if empty (clear filters) or filters changed
    // Otherwise debounce
    debounceTimer.current = setTimeout(() => {
      fetchDonors();
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [filters, searchQuery]);


  const handleDonorPress = useCallback((donor: Donor) => {
    const contactNum = donor.contactNumber || 'N/A';
    Alert.alert(
      'Contact Donor',
      `Would you like to contact ${donor.name}?\n\n📞 ${contactNum}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => Alert.alert('Call', `Would call ${contactNum}`)
        },
        {
          text: 'Message',
          onPress: () => Alert.alert('Message', `Would message ${contactNum}`)
        },
      ]
    );
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDonors();
  }, [fetchDonors]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilters({
      bloodType: '',
      municipality: '',
      status: 'All',
    });
    searchInputRef.current?.blur();
  }, []);

  const hasActiveFilters = filters.bloodType || filters.municipality || filters.status !== 'All';

  const renderDonorItem = useCallback(({ item }: { item: Donor }) => (
    <DonorCard donor={item} onPress={handleDonorPress} />
  ), [handleDonorPress]);

  return (
    <DashboardLayout>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.background,
              opacity: fadeAnim,
            }
          ]}
        >
          {/* Fallback Error Toast - ideally this would be global */}
          {error && (
            <View style={{ position: 'absolute', top: 10, left: 20, right: 20, zIndex: 100 }}>
              <ErrorToast message={error} onDismiss={() => setError(null)} visible={!!error} />
            </View>
          )}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <ScrollView
                refreshControl={
                  <Animated.View />
                }
              />
            }
          >
            {/* Header */}
            <Animated.View
              style={[
                styles.header,
                {
                  transform: [{ scale: headerScale }],
                }
              ]}
            >
              <View>
                <Text style={[styles.title, { color: colors.text }]}>
                  Find Donors
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Connect with available blood donors in your area
                </Text>
              </View>

              {hasActiveFilters && (
                <TouchableOpacity
                  style={[styles.clearAllButton, {
                    backgroundColor: colors.primary + '15',
                  }]}
                  onPress={clearFilters}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={18} color={colors.primary} />
                  <Text style={[styles.clearAllText, { color: colors.primary }]}>
                    Clear All
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Search Bar */}
            <View style={[
              styles.searchContainer,
              {
                backgroundColor: isDark ? colors.card : '#fff',
              }
            ]}>
              <Ionicons
                name="search"
                size={20}
                color={colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                ref={searchInputRef}
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search donors..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
                autoCapitalize="words"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearSearchButton}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filters.bloodType
                      ? colors.primary + '20'
                      : isDark ? colors.card : '#f8f9fa',
                    borderColor: filters.bloodType
                      ? colors.primary
                      : colors.border,
                  }
                ]}
                onPress={() => setShowBloodTypeModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="water"
                  size={16}
                  color={filters.bloodType ? colors.primary : colors.textSecondary}
                />
                <Text style={[
                  styles.filterChipText,
                  {
                    color: filters.bloodType ? colors.primary : colors.text,
                    fontSize: IS_SMALL_DEVICE ? 13 : 14,
                  }
                ]}>
                  {filters.bloodType || 'Blood Type'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filters.municipality
                      ? colors.primary + '20'
                      : isDark ? colors.card : '#f8f9fa',
                    borderColor: filters.municipality
                      ? colors.primary
                      : colors.border,
                  }
                ]}
                onPress={() => setShowMunicipalityModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="location"
                  size={16}
                  color={filters.municipality ? colors.primary : colors.textSecondary}
                />
                <Text style={[
                  styles.filterChipText,
                  {
                    color: filters.municipality ? colors.primary : colors.text,
                    fontSize: IS_SMALL_DEVICE ? 13 : 14,
                  }
                ]}>
                  {filters.municipality || 'Location'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filters.status !== 'All'
                      ? colors.primary + '20'
                      : isDark ? colors.card : '#f8f9fa',
                    borderColor: filters.status !== 'All'
                      ? colors.primary
                      : colors.border,
                  }
                ]}
                onPress={() => setShowStatusModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="time"
                  size={16}
                  color={filters.status !== 'All' ? colors.primary : colors.textSecondary}
                />
                <Text style={[
                  styles.filterChipText,
                  {
                    color: filters.status !== 'All' ? colors.primary : colors.text,
                    fontSize: IS_SMALL_DEVICE ? 13 : 14,
                  }
                ]}>
                  {filters.status}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Results Header */}
            <View style={styles.resultsHeader}>
              <View>
                <Text style={[styles.resultsTitle, { color: colors.text }]}>
                  Available Donors
                </Text>
                <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
                  {donors.length} {donors.length === 1 ? 'donor' : 'donors'} found
                </Text>
              </View>
              <TouchableOpacity style={styles.sortButton}>
                <Ionicons name="filter" size={18} color={colors.textSecondary} />
                <Text style={[styles.sortText, { color: colors.textSecondary }]}>
                  Filter
                </Text>
              </TouchableOpacity>
            </View>

            {/* Loading State */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Searching...
                </Text>
              </View>
            ) : (
              /* Results List */
              <FlatList
                data={donors}
                renderItem={renderDonorItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ListEmptyComponent={
                  <EmptyState
                    icon="search-outline"
                    title="No donors found"
                    message="Try adjusting your search criteria"
                    actionText="Clear Filters"
                    onAction={clearFilters}
                  />
                }
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </ScrollView>

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
        </Animated.View>
      </KeyboardAvoidingView>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Math.max(16, SCREEN_WIDTH * 0.04),
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 100,
    minHeight: SCREEN_HEIGHT,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: IS_SMALL_DEVICE ? 28 : 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: IS_SMALL_DEVICE ? 34 : 38,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: IS_SMALL_DEVICE ? 14 : 15,
    fontWeight: '400',
    lineHeight: 20,
    maxWidth: '90%',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: IS_SMALL_DEVICE ? 15 : 16,
    fontWeight: '400',
    padding: 0,
    includeFontPadding: false,
  },
  clearSearchButton: {
    padding: 4,
  },
  filterScrollContent: {
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    minHeight: 44,
  },
  filterChipText: {
    fontWeight: '500',
    marginLeft: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: IS_SMALL_DEVICE ? 18 : 20,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '400',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: SCREEN_HEIGHT * 0.3,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modalOptionsContainer: {
    padding: 20,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionIconText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOptionText: {
    fontSize: 16,
  },
});

import { useMemo } from 'react';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_SMALL_DEVICE = SCREEN_WIDTH < 375;

// Mock donor data
const MOCK_DONORS = [
  {
    id: '1',
    name: 'Sarah Johnson',
    bloodType: 'A+',
    municipality: 'Manila',
    availabilityStatus: 'Available',
    lastDonationDate: '2024-01-15',
    contactNumber: '+63 912 345 6789',
    email: 'sarah.j@example.com',
    age: 28,
    sex: 'Female',
    donationCount: 5
  },
  {
    id: '2',
    name: 'Michael Chen',
    bloodType: 'O-',
    municipality: 'Quezon City',
    availabilityStatus: 'Available',
    lastDonationDate: '2024-02-01',
    contactNumber: '+63 917 654 3210',
    email: 'michael.c@example.com',
    age: 32,
    sex: 'Male',
    donationCount: 8
  },
  {
    id: '3',
    name: 'Emma Rodriguez',
    bloodType: 'B+',
    municipality: 'Cebu City',
    availabilityStatus: 'Unavailable',
    lastDonationDate: '2023-12-20',
    contactNumber: '+63 918 765 4321',
    email: 'emma.r@example.com',
    age: 25,
    sex: 'Female',
    donationCount: 3
  },
  {
    id: '4',
    name: 'James Wilson',
    bloodType: 'AB-',
    municipality: 'Davao City',
    availabilityStatus: 'Available',
    lastDonationDate: '2024-01-30',
    contactNumber: '+63 919 876 5432',
    email: 'james.w@example.com',
    age: 35,
    sex: 'Male',
    donationCount: 6
  },
  {
    id: '5',
    name: 'Lisa Park',
    bloodType: 'O+',
    municipality: 'Makati',
    availabilityStatus: 'Available',
    lastDonationDate: '2024-02-10',
    contactNumber: '+63 920 987 6543',
    email: 'lisa.p@example.com',
    age: 29,
    sex: 'Female',
    donationCount: 4
  },
  {
    id: '6',
    name: 'Robert Davis',
    bloodType: 'A-',
    municipality: 'Manila',
    availabilityStatus: 'Available',
    lastDonationDate: '2024-01-25',
    contactNumber: '+63 921 234 5678',
    email: 'robert.d@example.com',
    age: 31,
    sex: 'Male',
    donationCount: 7
  },
  {
    id: '7',
    name: 'Maria Garcia',
    bloodType: 'B-',
    municipality: 'Quezon City',
    availabilityStatus: 'Unavailable',
    lastDonationDate: '2023-11-15',
    contactNumber: '+63 922 345 6789',
    email: 'maria.g@example.com',
    age: 27,
    sex: 'Female',
    donationCount: 2
  },
  {
    id: '8',
    name: 'David Kim',
    bloodType: 'AB+',
    municipality: 'Cebu City',
    availabilityStatus: 'Available',
    lastDonationDate: '2024-02-05',
    contactNumber: '+63 923 456 7890',
    email: 'david.k@example.com',
    age: 33,
    sex: 'Male',
    donationCount: 9
  },
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const MUNICIPALITIES = ['Manila', 'Quezon City', 'Cebu City', 'Davao City', 'Makati', 'Taguig', 'Pasig', 'Mandaluyong'];
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
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.cubic),
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.modalBackdrop, {
            opacity: slideAnim.interpolate({
              inputRange: [0, SCREEN_HEIGHT],
              outputRange: [1, 0]
            })
          }]} />
        </TouchableWithoutFeedback>

        <Animated.View style={[
          styles.modalContainer,
          {
            transform: [{ translateY: slideAnim }],
            backgroundColor: isDark ? colors.card : '#fff',
          }
        ]}>
          <View style={styles.modalHandleContainer}>
            <View style={[styles.modalHandle, { backgroundColor: isDark ? '#444' : '#ddd' }]} />
          </View>

          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {title}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
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
                  {
                    backgroundColor: selectedValue === item
                      ? colors.primary + '15'
                      : 'transparent',
                  }
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.optionLeft}>
                  <View style={[
                    styles.optionIcon,
                    { backgroundColor: selectedValue === item ? colors.primary + '20' : colors.border }
                  ]}>
                    <Text style={[
                      styles.optionIconText,
                      { color: selectedValue === item ? colors.primary : colors.textSecondary }
                    ]}>
                      {item.charAt(0)}
                    </Text>
                  </View>
                  <Text style={[styles.modalOptionText, {
                    color: colors.text,
                    fontWeight: selectedValue === item ? '600' : '400'
                  }]}>
                    {item}
                  </Text>
                </View>
                {selectedValue === item && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalOptionsContainer}
          />
        </Animated.View>
      </View>
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
  const [refreshing, setRefreshing] = useState(false);

  const searchInputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.spring(headerScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters]);

  const filteredDonors = useMemo(() => {
    return MOCK_DONORS.filter(donor => {
      const matchesSearch = searchQuery === '' ||
        donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.bloodType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.municipality.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBloodType = !filters.bloodType || donor.bloodType === filters.bloodType;
      const matchesMunicipality = !filters.municipality || donor.municipality === filters.municipality;
      const matchesStatus = filters.status === 'All' || donor.availabilityStatus === filters.status;

      return matchesSearch && matchesBloodType && matchesMunicipality && matchesStatus;
    });
  }, [searchQuery, filters]);

  const handleDonorPress = useCallback((donor: typeof MOCK_DONORS[0]) => {
    Alert.alert(
      'Contact Donor',
      `Would you like to contact ${donor.name}?\n\n📞 ${donor.contactNumber}\n✉️ ${donor.email}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => Alert.alert('Call', `Would call ${donor.contactNumber}`)
        },
        {
          text: 'Message',
          onPress: () => Alert.alert('Message', `Would message ${donor.contactNumber}`)
        },
      ]
    );
  }, []);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilters({
      bloodType: '',
      municipality: '',
      status: 'All',
    });
    searchInputRef.current?.blur();
  }, []);

  const hasActiveFilters = filters.bloodType || filters.municipality || filters.status !== 'All';

  const renderDonorItem = useCallback(({ item }: { item: typeof MOCK_DONORS[0] }) => (
    <DonorCard donor={item} onPress={handleDonorPress} />
  ), [handleDonorPress]);

  return (
    <DashboardLayout>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.background,
              opacity: fadeAnim,
            }
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <ScrollView
                refreshControl={
                  <Animated.View />
                }
              />
            }
          >
            {/* Header */}
            <Animated.View
              style={[
                styles.header,
                {
                  transform: [{ scale: headerScale }],
                }
              ]}
            >
              <View>
                <Text style={[styles.title, { color: colors.text }]}>
                  Find Donors
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Connect with available blood donors in your area
                </Text>
              </View>

              {hasActiveFilters && (
                <TouchableOpacity
                  style={[styles.clearAllButton, {
                    backgroundColor: colors.primary + '15',
                  }]}
                  onPress={clearFilters}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={18} color={colors.primary} />
                  <Text style={[styles.clearAllText, { color: colors.primary }]}>
                    Clear All
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Search Bar */}
            <View style={[
              styles.searchContainer,
              {
                backgroundColor: isDark ? colors.card : '#fff',
              }
            ]}>
              <Ionicons
                name="search"
                size={20}
                color={colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                ref={searchInputRef}
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search donors..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                clearButtonMode="while-editing"
                autoCapitalize="words"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearSearchButton}
                >
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Filter Chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterScrollContent}
            >
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filters.bloodType
                      ? colors.primary + '20'
                      : isDark ? colors.card : '#f8f9fa',
                    borderColor: filters.bloodType
                      ? colors.primary
                      : colors.border,
                  }
                ]}
                onPress={() => setShowBloodTypeModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="water"
                  size={16}
                  color={filters.bloodType ? colors.primary : colors.textSecondary}
                />
                <Text style={[
                  styles.filterChipText,
                  {
                    color: filters.bloodType ? colors.primary : colors.text,
                    fontSize: IS_SMALL_DEVICE ? 13 : 14,
                  }
                ]}>
                  {filters.bloodType || 'Blood Type'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filters.municipality
                      ? colors.primary + '20'
                      : isDark ? colors.card : '#f8f9fa',
                    borderColor: filters.municipality
                      ? colors.primary
                      : colors.border,
                  }
                ]}
                onPress={() => setShowMunicipalityModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="location"
                  size={16}
                  color={filters.municipality ? colors.primary : colors.textSecondary}
                />
                <Text style={[
                  styles.filterChipText,
                  {
                    color: filters.municipality ? colors.primary : colors.text,
                    fontSize: IS_SMALL_DEVICE ? 13 : 14,
                  }
                ]}>
                  {filters.municipality || 'Location'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filters.status !== 'All'
                      ? colors.primary + '20'
                      : isDark ? colors.card : '#f8f9fa',
                    borderColor: filters.status !== 'All'
                      ? colors.primary
                      : colors.border,
                  }
                ]}
                onPress={() => setShowStatusModal(true)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="time"
                  size={16}
                  color={filters.status !== 'All' ? colors.primary : colors.textSecondary}
                />
                <Text style={[
                  styles.filterChipText,
                  {
                    color: filters.status !== 'All' ? colors.primary : colors.text,
                    fontSize: IS_SMALL_DEVICE ? 13 : 14,
                  }
                ]}>
                  {filters.status}
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Results Header */}
            <View style={styles.resultsHeader}>
              <View>
                <Text style={[styles.resultsTitle, { color: colors.text }]}>
                  Available Donors
                </Text>
                <Text style={[styles.resultCount, { color: colors.textSecondary }]}>
                  {filteredDonors.length} {filteredDonors.length === 1 ? 'donor' : 'donors'} found
                </Text>
              </View>
              <TouchableOpacity style={styles.sortButton}>
                <Ionicons name="filter" size={18} color={colors.textSecondary} />
                <Text style={[styles.sortText, { color: colors.textSecondary }]}>
                  Filter
                </Text>
              </TouchableOpacity>
            </View>

            {/* Loading State */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Searching...
                </Text>
              </View>
            ) : (
              /* Results List */
              <FlatList
                data={filteredDonors}
                renderItem={renderDonorItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                ListEmptyComponent={
                  <EmptyState
                    icon="search-outline"
                    title="No donors found"
                    message="Try adjusting your search criteria"
                    actionText="Clear Filters"
                    onAction={clearFilters}
                  />
                }
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </ScrollView>

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
        </Animated.View>
      </KeyboardAvoidingView>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Math.max(16, SCREEN_WIDTH * 0.04),
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 100,
    minHeight: SCREEN_HEIGHT,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: IS_SMALL_DEVICE ? 28 : 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: IS_SMALL_DEVICE ? 34 : 38,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: IS_SMALL_DEVICE ? 14 : 15,
    fontWeight: '400',
    lineHeight: 20,
    maxWidth: '90%',
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: IS_SMALL_DEVICE ? 15 : 16,
    fontWeight: '400',
    padding: 0,
    includeFontPadding: false,
  },
  clearSearchButton: {
    padding: 4,
  },
  filterScrollContent: {
    paddingBottom: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
    minHeight: 44,
  },
  filterChipText: {
    fontWeight: '500',
    marginLeft: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: IS_SMALL_DEVICE ? 18 : 20,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 4,
  },
  resultCount: {
    fontSize: 13,
    fontWeight: '400',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  sortText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: SCREEN_HEIGHT * 0.3,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  separator: {
    height: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHandleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
    borderRadius: 12,
  },
  modalOptionsContainer: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 12,
    marginVertical: 2,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionIconText: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalOptionText: {
    fontSize: 16,
    flex: 1,
  },
});