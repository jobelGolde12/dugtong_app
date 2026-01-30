import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Donor } from '../../types/donor.types';

interface DonorCardProps {
  donor: Donor;
  onPress: (donor: Donor) => void;
}

export const DonorCard: React.FC<DonorCardProps> = ({ donor, onPress }) => {
  return (
    <TouchableOpacity style={styles.donorCard} onPress={() => onPress(donor)}>
      <View style={styles.donorHeader}>
        <Text style={styles.donorName}>{donor.name}</Text>
        <Text style={styles.bloodTypeBadge}>{donor.bloodType}</Text>
      </View>
      <View style={styles.donorDetails}>
        <Text style={styles.detailText}>Municipality: {donor.municipality}</Text>
        <Text style={[styles.detailText, donor.availabilityStatus === 'Available' ? styles.available : styles.unavailable]}>
          Status: {donor.availabilityStatus}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.contactButton}
        onPress={() => onPress(donor)}
      >
        <Text style={styles.contactButtonText}>View Details</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: '#0d6efd',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});