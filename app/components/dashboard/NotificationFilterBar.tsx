import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';

interface NotificationFilterBarProps<T> {
  filters: T;
  onFilterChange: (filterName: keyof T, value: any) => void;
  onClearFilters: () => void;
  searchPlaceholder?: string;
}

const NotificationFilterBar: React.FC<NotificationFilterBarProps<any>> = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  searchPlaceholder = 'Search...'
}) => {
  const [showTypeModal, setShowTypeModal] = useState(false);

  const notificationTypes = ['All', 'Emergency', 'Update', 'System'];

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
          <Text style={styles.filterLabel}>Type</Text>
          <TouchableOpacity 
            style={styles.pickerButton} 
            onPress={() => setShowTypeModal(true)}
          >
            <Text style={styles.pickerText}>
              {filters.type || 'All Types'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Status</Text>
          <View style={styles.statusOptions}>
            <TouchableOpacity 
              style={[
                styles.statusOption, 
                filters.isRead === true && styles.selectedStatusOption
              ]}
              onPress={() => onFilterChange('isRead', true)}
            >
              <Text style={[
                styles.statusOptionText,
                filters.isRead === true && styles.selectedStatusOptionText
              ]}>
                Read
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.statusOption, 
                filters.isRead === false && styles.selectedStatusOption
              ]}
              onPress={() => onFilterChange('isRead', false)}
            >
              <Text style={[
                styles.statusOptionText,
                filters.isRead === false && styles.selectedStatusOptionText
              ]}>
                Unread
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.statusOption, 
                filters.isRead === null && styles.selectedStatusOption
              ]}
              onPress={() => onFilterChange('isRead', null)}
            >
              <Text style={[
                styles.statusOptionText,
                filters.isRead === null && styles.selectedStatusOptionText
              ]}>
                All
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.clearButton} onPress={onClearFilters}>
          <Text style={styles.clearButtonText}>Clear Filters</Text>
        </TouchableOpacity>
      </View>
      
      {/* Type Modal */}
      <Modal
        visible={showTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Notification Type</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {notificationTypes.map(type => (
                <TouchableOpacity
                  key={type}
                  style={styles.modalItem}
                  onPress={() => {
                    onFilterChange('type', type === 'All' ? null : type);
                    setShowTypeModal(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTypeModal(false)}
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
  statusOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusOption: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginRight: 5,
  },
  statusOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedStatusOption: {
    backgroundColor: '#e7f1ff',
    borderColor: '#0d6efd',
  },
  selectedStatusOptionText: {
    color: '#0d6efd',
    fontWeight: '600',
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
});
export default NotificationFilterBar;
