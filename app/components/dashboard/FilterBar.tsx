import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { BLOOD_TYPES, MUNICIPALITIES } from '../../../constants/dashboard.constants';

interface FilterBarProps<T> {
  filters: T;
  onFilterChange: (filterName: keyof T, value: any) => void;
  onClearFilters: () => void;
  searchPlaceholder?: string;
}

export const FilterBar: React.FC<FilterBarProps<any>> = ({
  filters,
  onFilterChange,
  onClearFilters,
  searchPlaceholder = 'Search...'
}) => {
  const [showBloodTypeModal, setShowBloodTypeModal] = useState(false);
  const [showMunicipalityModal, setShowMunicipalityModal] = useState(false);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder={searchPlaceholder}
        value={filters.searchQuery || ''}
        onChangeText={(text) => onFilterChange('searchQuery', text)}
      />

      <View style={styles.filterRow}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Blood Type</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowBloodTypeModal(true)}
          >
            <Text style={styles.pickerText}>
              {filters.bloodType || 'All Types'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Municipality</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowMunicipalityModal(true)}
          >
            <Text style={styles.pickerText}>
              {filters.municipality || 'All Areas'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.availabilityFilterRow}>
        <Text style={styles.filterLabel}>Availability</Text>
        <View style={styles.availabilityOptions}>
          <TouchableOpacity
            style={[
              styles.availabilityOption,
              filters.availability === true && styles.selectedAvailabilityOption
            ]}
            onPress={() => onFilterChange('availability', true)}
          >
            <Text style={[
              styles.availabilityOptionText,
              filters.availability === true && styles.selectedAvailabilityOptionText
            ]}>
              Available Only
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.availabilityOption,
              filters.availability === false && styles.selectedAvailabilityOption
            ]}
            onPress={() => onFilterChange('availability', false)}
          >
            <Text style={[
              styles.availabilityOptionText,
              filters.availability === false && styles.selectedAvailabilityOptionText
            ]}>
              Unavailable Only
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.availabilityOption,
              filters.availability === null && styles.selectedAvailabilityOption
            ]}
            onPress={() => onFilterChange('availability', null)}
          >
            <Text style={[
              styles.availabilityOptionText,
              filters.availability === null && styles.selectedAvailabilityOptionText
            ]}>
              All
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.clearButton} onPress={onClearFilters}>
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </TouchableOpacity>
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
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onFilterChange('bloodType', null);
                  setShowBloodTypeModal(false);
                }}
              >
                <Text style={styles.modalItemText}>All Types</Text>
              </TouchableOpacity>
              {BLOOD_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={styles.modalItem}
                  onPress={() => {
                    onFilterChange('bloodType', type);
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
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onFilterChange('municipality', null);
                  setShowMunicipalityModal(false);
                }}
              >
                <Text style={styles.modalItemText}>All Areas</Text>
              </TouchableOpacity>
              {MUNICIPALITIES.map(muni => (
                <TouchableOpacity
                  key={muni}
                  style={styles.modalItem}
                  onPress={() => {
                    onFilterChange('municipality', muni);
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
};

const styles = StyleSheet.create({
  container: {
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
  searchInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    marginBottom: 15,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterGroup: {
    flex: 1,
    marginRight: 10,
  },
  filterGroupRight: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    padding: 12,
  },
  pickerText: {
    fontSize: 14,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  clearButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: '600',
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
  availabilityFilterRow: {
    marginBottom: 15,
  },
  availabilityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  availabilityOption: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 5,
  },
  availabilityOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedAvailabilityOption: {
    backgroundColor: '#e7f1ff',
    borderColor: '#0d6efd',
  },
  selectedAvailabilityOptionText: {
    color: '#0d6efd',
    fontWeight: '600',
  },
});