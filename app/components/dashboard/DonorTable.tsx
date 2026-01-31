import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Donor } from '../../types/donor.types';

interface DonorTableProps {
  donors: Donor[];
  onViewDetails: (donor: Donor) => void;
  onToggleAvailability: (donor: Donor) => void;
  onEdit: (donor: Donor) => void;
}

export const DonorTable: React.FC<DonorTableProps> = ({ 
  donors, 
  onViewDetails, 
  onToggleAvailability, 
  onEdit 
}) => {
  return (
    <View style={styles.container}>
      {donors.map(donor => (
        <View key={donor.id} style={styles.row}>
          <View style={styles.cell}>
            <Text style={styles.name}>{donor.name}</Text>
            <Text style={styles.bloodType}>{donor.bloodType}</Text>
          </View>
          
          <View style={styles.cell}>
            <Text style={styles.text}>{donor.municipality}</Text>
            <Text style={styles.text}>{donor.contactNumber}</Text>
          </View>
          
          <View style={styles.statusCell}>
            <View style={[
              styles.statusBadge, 
              donor.availabilityStatus === 'Available' 
                ? styles.available 
                : styles.unavailable
            ]}>
              <Text style={styles.statusText}>
                {donor.availabilityStatus}
              </Text>
            </View>
            <Text style={styles.date}>
              {donor.lastDonationDate ? `Last: ${donor.lastDonationDate}` : 'Never donated'}
            </Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.viewButton]} 
              onPress={() => onViewDetails(donor)}
            >
              <Text style={styles.actionButtonText}>View</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, donor.availabilityStatus === 'Available' ? styles.deactivateButton : styles.activateButton]} 
              onPress={() => onToggleAvailability(donor)}
            >
              <Text style={styles.actionButtonText}>
                {donor.availabilityStatus === 'Available' ? 'Deactivate' : 'Activate'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]} 
              onPress={() => onEdit(donor)}
            >
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
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
  row: {
    flexDirection: 'row',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cell: {
    flex: 1,
    justifyContent: 'center',
  },
  statusCell: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  bloodType: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: '600',
    marginTop: 4,
  },
  text: {
    fontSize: 14,
    color: '#666',
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  available: {
    backgroundColor: '#d4edda',
  },
  unavailable: {
    backgroundColor: '#f8d7da',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
  },
  viewButton: {
    backgroundColor: '#0d6efd',
  },
  activateButton: {
    backgroundColor: '#28a745',
  },
  deactivateButton: {
    backgroundColor: '#ffc107',
  },
  editButton: {
    backgroundColor: '#6c757d',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});