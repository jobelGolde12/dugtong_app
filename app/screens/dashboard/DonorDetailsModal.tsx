import { Calendar, Droplet, Mail, MapPin, Phone, X } from 'lucide-react-native';
import React from 'react';
import { Dimensions, Modal, ScrollView, StyleSheet, Text as RNText, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../../constants/design-system';
import { Donor } from '../../../types/donor.types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const DonorDetailsModal: React.FC<{
  visible: boolean;
  donor: Donor | null;
  onClose: () => void;
}> = ({ visible, donor, onClose }) => {
  if (!donor) return null;

  const handleOverlayPress = (event: any) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay} onTouchEnd={handleOverlayPress}>
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.overlayBackground}
        >
          <Animated.View
            entering={SlideInDown.springify().damping(15).stiffness(100)}
            exiting={SlideOutDown.duration(150)}
            style={styles.modalContainer}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.avatarContainer}>
                <Droplet size={40} color={COLORS.primary[500]} />
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={COLORS.neutral[400]} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.nameRow}>
                <ModalText variant="h2" style={styles.name}>{donor.name}</ModalText>
              </View>
              <View style={styles.bloodTypeRow}>
                <Badge variant="primary">{donor.bloodType}</Badge>
                <ModalText variant="body2" style={styles.donorId}>ID: {donor.id}</ModalText>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoGroup}>
                <InfoRow
                  icon={<MapPin size={20} color={COLORS.primary[500]} />}
                  label="Location"
                  value={`${donor.municipality}`}
                />
                <InfoRow
                  icon={<Phone size={20} color={COLORS.primary[500]} />}
                  label="Contact"
                  value={donor.contactNumber || 'N/A'}
                />
                <InfoRow
                  icon={<Calendar size={20} color={COLORS.primary[500]} />}
                  label="Last Donation"
                  value={donor.lastDonationDate || 'Never'}
                />
                <InfoRow
                  icon={<Mail size={20} color={COLORS.primary[500]} />}
                  label="Email / Notes"
                  value={donor.notes || 'Not provided'}
                />
              </View>

              {donor.notes && (
                <View style={styles.notesContainer}>
                  <ModalText variant="caption" style={styles.notesLabel}>Additional Notes</ModalText>
                  <ModalText variant="body2" style={styles.notesText}>{donor.notes}</ModalText>
                </View>
              )}

              <View style={styles.statusSection}>
                <ModalText variant="caption" style={styles.statusLabel}>Availability Status</ModalText>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: donor.availabilityStatus === 'Available' ? COLORS.success[50] : COLORS.warning[50] }
                ]}>
                  <View style={[
                    styles.statusDot,
                    { backgroundColor: donor.availabilityStatus === 'Available' ? COLORS.success[500] : COLORS.warning[500] }
                  ]} />
                  <ModalText style={[
                    styles.statusText,
                    { color: donor.availabilityStatus === 'Available' ? COLORS.success[600] : COLORS.warning[600] }
                  ]}>
                    {donor.availabilityStatus}
                  </ModalText>
                </View>
              </View>

              <View style={styles.bottomSpacer} />
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Re-defining simple components for self-containment in this snippet, matching DonorManagementScreen
const ModalText: React.FC<{ children: React.ReactNode; style?: any; variant?: 'h2' | 'body2' | 'caption' }> = ({ children, style, variant }) => (
  <RNText style={[{ color: COLORS.neutral[900] }, variant === 'h2' && TYPOGRAPHY.h2, variant === 'body2' && TYPOGRAPHY.body2, variant === 'caption' && TYPOGRAPHY.caption, style]}>
    {children}
  </RNText>
);

const Badge: React.FC<{ children: React.ReactNode; variant?: 'neutral' | 'primary' }> = ({ children, variant = 'neutral' }) => {
  const bgColor = variant === 'primary' ? COLORS.primary[50] : COLORS.neutral[100];
  const textColor = variant === 'primary' ? COLORS.primary[600] : COLORS.neutral[700];
  return (
    <View style={{ backgroundColor: bgColor, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 }}>
      <RNText style={{ color: textColor, fontWeight: '700', fontSize: 16 }}>{children}</RNText>
    </View>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.iconWrapper}>{icon}</View>
    <View style={styles.infoTextContainer}>
      <ModalText variant="caption" style={styles.infoLabel}>{label}</ModalText>
      <ModalText variant="body2" style={styles.infoValue}>{value}</ModalText>
    </View>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  overlayBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: '80%',
    backgroundColor: COLORS.surface.light,
    borderRadius: 24,
    overflow: 'hidden',
    ...SHADOWS.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.primary[50],
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.xs,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 20,
  },
  content: {
    padding: SPACING.lg,
  },
  nameRow: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.neutral[900],
    textAlign: 'center',
  },
  bloodTypeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  donorId: {
    color: COLORS.neutral[500],
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral[200],
    marginBottom: SPACING.lg,
  },
  infoGroup: {
    gap: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
    paddingTop: 2,
  },
  infoLabel: {
    color: COLORS.neutral[500],
    fontSize: 12,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: COLORS.neutral[800],
    fontSize: 15,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: SPACING.xl,
    padding: SPACING.lg,
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.neutral[200],
  },
  notesLabel: {
    color: COLORS.neutral[500],
    marginBottom: SPACING.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    color: COLORS.neutral[700],
    lineHeight: 22,
  },
  statusSection: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  statusLabel: {
    color: COLORS.neutral[500],
    marginBottom: SPACING.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    gap: SPACING.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: SPACING.xl,
  },
});

export default DonorDetailsModal;

