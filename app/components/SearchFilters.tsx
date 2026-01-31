import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AVAILABILITY_OPTIONS, BLOOD_TYPES, MUNICIPALITIES } from '../../constants/filters.constants';
import { useTheme } from '../../contexts/ThemeContext';

interface SearchFiltersProps {
  filters: {
    bloodType: string;
    municipality: string;
    availabilityStatus: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    bloodType: string;
    municipality: string;
    availabilityStatus: string;
  }>>;
  showBloodTypeModal: boolean;
  setShowBloodTypeModal: React.Dispatch<React.SetStateAction<boolean>>;
  showMunicipalityModal: boolean;
  setShowMunicipalityModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  setFilters,
  showBloodTypeModal,
  setShowBloodTypeModal,
  showMunicipalityModal,
  setShowMunicipalityModal
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  return (
    <View style={styles.filtersContainer}>
      <Text style={styles.sectionTitle}>Search Filters</Text>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowBloodTypeModal(true)}
      >
        <Text style={[styles.dropdownText, !filters.bloodType && styles.placeholder]}>
          {filters.bloodType || 'Select Blood Type *'}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowMunicipalityModal(true)}
      >
        <Text style={[styles.dropdownText, !filters.municipality && styles.placeholder]}>
          {filters.municipality || 'Select Municipality'}
        </Text>
        <Text style={styles.dropdownArrow}>▼</Text>
      </TouchableOpacity>

      <View style={styles.radioGroup}>
        {AVAILABILITY_OPTIONS.map(option => (
          <TouchableOpacity
            key={option.value}
            style={[styles.radioButton, filters.availabilityStatus === option.value && styles.radioButtonSelected]}
            onPress={() => setFilters(prev => ({ ...prev, availabilityStatus: option.value }))}
          >
            <Text style={[styles.radioText, filters.availabilityStatus === option.value && styles.radioTextSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
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
                    setFilters(prev => ({ ...prev, bloodType: type }));
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
                    setFilters(prev => ({ ...prev, municipality: muni }));
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

const createStyles = (colors: any) => StyleSheet.create({
  filtersContainer: {
    backgroundColor: colors.card,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: colors.text,
  },
  dropdown: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  placeholder: {
    color: colors.text, // Changed from colors.placeholder to colors.text for dark theme
  },
  dropdownText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownArrow: {
    color: colors.text, // Changed from colors.secondaryText to colors.text for dark theme
    fontSize: 14,
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  radioButton: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 10,
  },
  radioButtonSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  radioText: {
    fontSize: 14,
    color: colors.text,
  },
  radioTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
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
    color: colors.text,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  modalCloseButton: {
    marginTop: 15,
    paddingVertical: 15,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: colors.text, // Changed from '#fff' to colors.text for dark theme
    fontSize: 16,
    fontWeight: '600',
  },
});