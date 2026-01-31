import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, FlatList } from 'react-native';
import { DonorCard } from './components/DonorCard';
import { SearchFilters } from './components/SearchFilters';
import { EmptyState } from './components/EmptyState';
import { LoadingIndicator } from './components/LoadingIndicator';
import { donorService } from '../lib/services/donorService';
import { Donor, SearchParams } from '../types/donor.types';
import DashboardLayout from './components/DashboardLayout';
import { useTheme } from '../contexts/ThemeContext';

export default function SearchScreen() {
  const { colors } = useTheme();
  const [filters, setFilters] = useState({
    bloodType: '',
    municipality: '',
    availabilityStatus: 'Available',
  });

  const [results, setResults] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBloodTypeModal, setShowBloodTypeModal] = useState(false);
  const [showMunicipalityModal, setShowMunicipalityModal] = useState(false);

  const handleSearch = async () => {
    if (!filters.bloodType) {
      Alert.alert('Validation Error', 'Please select a blood type');
      return;
    }

    setLoading(true);

    try {
      // Prepare search parameters
      const searchParams: SearchParams = {
        bloodType: filters.bloodType,
        municipality: filters.municipality || undefined,
        available: filters.availabilityStatus === 'Available' ? true : undefined,
      };

      // Call the service to search for donors
      const searchResults = await donorService.searchDonors(searchParams);
      setResults(searchResults);
    } catch (error) {
      Alert.alert('Error', 'Failed to search for donors. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonorPress = (donor: Donor) => {
    // Navigate to donor details screen
    // For now, showing an alert as placeholder
    Alert.alert(
      'Donor Details',
      `Name: ${donor.name}\nBlood Type: ${donor.bloodType}\nMunicipality: ${donor.municipality}\nStatus: ${donor.availabilityStatus}`,
      [{ text: 'OK' }]
    );
  };

  const renderResultItem = ({ item }: { item: Donor }) => (
    <DonorCard donor={item} onPress={handleDonorPress} />
  );

  const styles = createStyles(colors);

  return (
    <DashboardLayout>
      <View style={styles.container}>
        <Text style={styles.title}>Find a Donor</Text>

        <SearchFilters
          filters={filters}
          setFilters={setFilters}
          showBloodTypeModal={showBloodTypeModal}
          setShowBloodTypeModal={setShowBloodTypeModal}
          showMunicipalityModal={showMunicipalityModal}
          setShowMunicipalityModal={setShowMunicipalityModal}
        />

        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search Donors</Text>
        </TouchableOpacity>

        <View style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Search Results</Text>

          {loading ? (
            <LoadingIndicator />
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              renderItem={renderResultItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <EmptyState message="No donors found. Try adjusting your filters." />
          )}
        </View>
      </View>
    </DashboardLayout>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
});