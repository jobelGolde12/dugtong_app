import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, ScrollView, Modal, FlatList } from 'react-native';

// Mock data for testing
const MOCK_DONORS = [
  { id: '1', name: 'Juan Dela Cruz', bloodType: 'O+', municipality: 'Sorsogon City', availabilityStatus: 'Available', contactNumber: '09123456789' },
  { id: '2', name: 'Maria Santos', bloodType: 'A+', municipality: 'Gubat', availabilityStatus: 'Available', contactNumber: '09234567890' },
  { id: '3', name: 'Pedro Garcia', bloodType: 'B+', municipality: 'Irosin', availabilityStatus: 'Temporarily Unavailable', contactNumber: '09345678901' },
  { id: '4', name: 'Ana Reyes', bloodType: 'AB+', municipality: 'Bulan', availabilityStatus: 'Available', contactNumber: '09456789012' },
  { id: '5', name: 'Jose Lim', bloodType: 'O-', municipality: 'Castilla', availabilityStatus: 'Available', contactNumber: '09567890123' },
];

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const MUNICIPALITIES = [
  'Sorsogon City',
  'Bulan',
  'Matnog',
  'Irosin',
  'Gubat',
  'Castilla',
  'Magallanes',
  'Pilar',
  'Donsol',
  'Juban',
  'Casiguran',
  'Bulusan',
  'Santa Magdalena',
  'Barcelona'
];

export default function SearchScreen() {
  const [bloodType, setBloodType] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('Available');
  const [results, setResults] = useState([]);
  const [showBloodTypeModal, setShowBloodTypeModal] = useState(false);
  const [showMunicipalityModal, setShowMunicipalityModal] = useState(false);
  
  const handleSearch = () => {
    if (!bloodType) {
      Alert.alert('Validation Error', 'Please select a blood type');
      return;
    }

    // Filter donors based on selected criteria
    const filtered = MOCK_DONORS.filter(donor => {
      const matchesBloodType = donor.bloodType === bloodType;
      const matchesMunicipality = !municipality || donor.municipality === municipality;
      const matchesAvailability = donor.availabilityStatus === availabilityStatus;
      
      return matchesBloodType && matchesMunicipality && matchesAvailability;
    });

    setResults(filtered);
  };

  const handleRequestContact = (donor) => {
    Alert.alert(
      'Contact Request',
      `Request sent to ${donor.name}. They will be notified to contact you.`,
      [{ text: 'OK' }]
    );
  };

  const renderDonorCard = ({ item }) => (
    <View style={styles.donorCard}>
      <View style={styles.donorHeader}>
        <Text style={styles.donorName}>{item.name}</Text>
        <Text style={styles.bloodTypeBadge}>{item.bloodType}</Text>
      </View>
      <View style={styles.donorDetails}>
        <Text style={styles.detailText}>Municipality: {item.municipality}</Text>
        <Text style={[styles.detailText, item.availabilityStatus === 'Available' ? styles.available : styles.unavailable]}>
          Status: {item.availabilityStatus}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.contactButton} 
        onPress={() => handleRequestContact(item)}
      >
        <Text style={styles.contactButtonText}>Request Contact</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Find a Donor</Text>
      
      <View style={styles.filtersContainer}>
        <Text style={styles.sectionTitle}>Search Filters</Text>
        
        <TouchableOpacity 
          style={[styles.dropdown, !bloodType && styles.placeholder]}
          onPress={() => setShowBloodTypeModal(true)}
        >
          <Text style={styles.dropdownText}>
            {bloodType || 'Select Blood Type *'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.dropdown, !municipality && styles.placeholder]}
          onPress={() => setShowMunicipalityModal(true)}
        >
          <Text style={styles.dropdownText}>
            {municipality || 'Select Municipality'}
          </Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
        
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={[styles.radioButton, availabilityStatus === 'Available' && styles.radioButtonSelected]}
            onPress={() => setAvailabilityStatus('Available')}
          >
            <Text style={[styles.radioText, availabilityStatus === 'Available' && styles.radioTextSelected]}>
              Available Only
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.radioButton, availabilityStatus === 'Any' && styles.radioButtonSelected]}
            onPress={() => setAvailabilityStatus('Any')}
          >
            <Text style={[styles.radioText, availabilityStatus === 'Any' && styles.radioTextSelected]}>
              Any Status
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search Donors</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.resultsContainer}>
        <Text style={styles.sectionTitle}>Search Results</Text>
        {results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderDonorCard}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>No donors found. Try adjusting your filters.</Text>
          </View>
        )}
      </View>
      
      {/* Blood Type Modal */}
      <Modal
        visible={showBloodTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBloodTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Blood Type</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {BLOOD_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={styles.modalItem}
                  onPress={() => {
                    setBloodType(type);
                    setShowBloodTypeModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowBloodTypeModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* Municipality Modal */}
      <Modal
        visible={showMunicipalityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMunicipalityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Municipality</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {MUNICIPALITIES.map(muni => (
                <TouchableOpacity
                  key={muni}
                  style={styles.modalItem}
                  onPress={() => {
                    setMunicipality(muni);
                    setShowMunicipalityModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{muni}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowMunicipalityModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  filtersContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
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
  dropdown: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholder: {
    color: '#999',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownArrow: {
    color: '#666',
    fontSize: 14,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  radioButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  radioButtonSelected: {
    backgroundColor: '#e7f1ff',
    borderColor: '#0d6efd',
  },
  radioText: {
    fontSize: 14,
    color: '#666',
  },
  radioTextSelected: {
    color: '#0d6efd',
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#0d6efd',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  donorCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  donorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  donorName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  bloodTypeBadge: {
    backgroundColor: '#dc3545',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  donorDetails: {
    marginBottom: 15,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  available: {
    color: '#28a745',
    fontWeight: '600',
  },
  unavailable: {
    color: '#dc3545',
    fontWeight: '600',
  },
  contactButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noResults: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  noResultsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  modalCloseButton: {
    marginTop: 15,
    paddingVertical: 15,
    backgroundColor: '#6c757d',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});