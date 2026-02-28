import { Ionicons } from '@expo/vector-icons';
import { Calendar, Mail, MapPin, Phone, X } from 'lucide-react-native';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { Donor } from '../../../types/donor.types';

interface DonorDetailsModalProps {
  visible: boolean;
  donor: Donor | null;
  onClose: () => void;
}

const DonorDetailsModal: React.FC<DonorDetailsModalProps> = ({ visible, donor, onClose }) => {
  const { colors } = useTheme();

  if (!donor) return null;

  const isAvailable = donor.availabilityStatus === 'Available';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          {/* Header with Avatar */}
          <View style={styles.header}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="person" size={40} color={colors.primary} />
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.surfaceVariant }]}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Name and Blood Type */}
          <View style={styles.infoSection}>
            <Text style={[styles.name, { color: colors.text }]}>{donor.name}</Text>
            <View style={styles.bloodTypeRow}>
              <View style={[styles.bloodTypeBadge, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.bloodTypeText, { color: colors.primary }]}>{donor.bloodType}</Text>
              </View>
              <Text style={[styles.donorId, { color: colors.textSecondary }]}>ID: {donor.id}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Contact Information */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <InfoRow
              icon={<MapPin size={20} color={colors.primary} />}
              label="Location"
              value={donor.municipality}
              colors={colors}
            />
            <InfoRow
              icon={<Phone size={20} color={colors.primary} />}
              label="Contact Number"
              value={donor.contactNumber || 'Not provided'}
              colors={colors}
            />
            <InfoRow
              icon={<Calendar size={20} color={colors.primary} />}
              label="Last Donation"
              value={donor.lastDonationDate || 'Never'}
              colors={colors}
            />
            {donor.notes && (
              <InfoRow
                icon={<Mail size={20} color={colors.primary} />}
                label="Notes"
                value={donor.notes}
                colors={colors}
                isMultiline
              />
            )}

            {/* Availability Status */}
            <View style={styles.statusSection}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Availability Status</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: isAvailable ? colors.success + '20' : colors.warning + '20' }
              ]}>
                <View style={[
                  styles.statusDot,
                  { backgroundColor: isAvailable ? colors.success : colors.warning }
                ]} />
                <Text style={[
                  styles.statusText,
                  { color: isAvailable ? colors.success : colors.warning }
                ]}>
                  {donor.availabilityStatus}
                </Text>
              </View>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  colors: any;
  isMultiline?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, colors, isMultiline = false }) => (
  <View style={styles.infoRow}>
    <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '20' }]}>
      {icon}
    </View>
    <View style={styles.infoTextContainer}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={isMultiline ? 3 : 1}>
        {value}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
  },
  header: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 16,
    position: 'relative',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 8,
    borderRadius: 20,
  },
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  bloodTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bloodTypeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  bloodTypeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  donorId: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 16,
    marginHorizontal: 24,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 20,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoTextContainer: {
    flex: 1,
    paddingTop: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  statusSection: {
    marginTop: 8,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DonorDetailsModal;
