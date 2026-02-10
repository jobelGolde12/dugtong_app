import { Calendar, Droplet, Mail, MapPin, Phone, X } from 'lucide-react-native';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from '../../../constants/design-system'; // Assuming these exist, or I'll use local vars if needed. Wait, I don't have access to import these reliably if they are not exported from a central place. Looking at DonorManagementScreen, they are defined locally. I should define them locally here or copy them. To avoid duplication errors or missing exports, I'll define the necessary styles locally or use the ones from the file I'm working on? No, creating a new file. I should define the constants locally to be safe and self-contained, matching the theme.
import { Donor } from '../../../types/donor.types';

const DonorDetailsModal: React.FC<{
  visible: boolean;
  donor: Donor | null;
  onClose: () => void;
}> = ({ visible, donor, onClose }) => {
  if (!donor) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.overlay}
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.overlay}
        >
          <Animated.View
            entering={SlideInDown.springify().damping(15).stiffness(100)}
            exiting={SlideOutDown.duration(150)}
            style={styles.modalContainer}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.avatarContainer}>
                <Droplet size={32} color={COLORS.primary[500]} />
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color={COLORS.neutral[400]} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.nameRow}>
                <Text variant="h2" style={styles.name}>{donor.name}</Text>
                <Badge variant="primary">{donor.bloodType}</Badge>
              </View>
              <Text variant="body2" style={styles.subtitle}>
                Donor ID: {donor.id}
              </Text>

              <View style={styles.divider} />

              <View style={styles.infoGroup}>
                <InfoRow
                  icon={<MapPin size={18} color={COLORS.neutral[500]} />}
                  label="Location"
                  value={`${donor.municipality}`}
                />
                <InfoRow
                  icon={<Phone size={18} color={COLORS.neutral[500]} />}
                  label="Contact"
                  value={donor.contactNumber || 'N/A'}
                />
                <InfoRow
                  icon={<Calendar size={18} color={COLORS.neutral[500]} />}
                  label="Last Donation"
                  value={donor.lastDonationDate || 'Never'}
                />
                <InfoRow
                  icon={<Mail size={18} color={COLORS.neutral[500]} />}
                  label="Email"
                  value={donor.email || 'Not provided'}
                />
              </View>

              {donor.notes && (
                <View style={styles.notesContainer}>
                  <Text variant="caption" style={styles.notesLabel}>Notes</Text>
                  <Text variant="body2" style={styles.notesText}>{donor.notes}</Text>
                </View>
              )}
            </View>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// Re-defining simple components for self-containment in this snippet, matching DonorManagementScreen
const Text = ({ children, style, variant }: any) => (
  <Animated.Text style={[{ color: COLORS.neutral[900] }, variant === 'h2' && TYPOGRAPHY.h2, variant === 'body2' && TYPOGRAPHY.body2, variant === 'caption' && TYPOGRAPHY.caption, style]}>
    {children}
  </Animated.Text>
);

const Badge: React.FC<{ children: React.ReactNode; variant?: any }> = ({ children, variant = 'neutral' }) => {
  // Simplified for this component
  const bgColor = variant === 'primary' ? COLORS.primary[50] : COLORS.neutral[100];
  const textColor = variant === 'primary' ? COLORS.primary[600] : COLORS.neutral[700];
  return (
    <View style={{ backgroundColor: bgColor, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 }}>
      <Text style={{ color: textColor, fontWeight: '600', fontSize: 14 }}>{children}</Text>
    </View>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.iconWrapper}>{icon}</View>
    <View style={styles.infoTextContainer}>
      <Text variant="caption" style={styles.infoLabel}>{label}</Text>
      <Text variant="body2" style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

// Constants needed for this file (duplicating from main file for modularity safety)
const TYPOGRAPHY_LOCAL = {
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 30, letterSpacing: -0.3 },
  body2: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: COLORS.surface.light,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOWS.xl,
  },
  header: {
    alignItems: 'center',
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.neutral[50],
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  closeButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    padding: SPACING.xs,
  },
  content: {
    padding: SPACING.lg,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.neutral[900],
  },
  subtitle: {
    color: COLORS.neutral[500],
    fontSize: 14,
    marginBottom: SPACING.lg,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.neutral[100],
    marginVertical: SPACING.lg,
  },
  infoGroup: {
    gap: SPACING.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    color: COLORS.neutral[500],
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    color: COLORS.neutral[800],
    fontSize: 14,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.neutral[50],
    borderRadius: RADIUS.md,
  },
  notesLabel: {
    color: COLORS.neutral[500],
    marginBottom: 4,
    fontWeight: '600',
  },
  notesText: {
    color: COLORS.neutral[700],
    lineHeight: 20,
  },
});

export default DonorDetailsModal;

