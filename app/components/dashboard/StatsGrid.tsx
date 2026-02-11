import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useTheme } from '../../../contexts/ThemeContext';
import { queryRows } from '../../../src/lib/turso';
import LoadingIndicator from './LoadingIndicator';

// ========== Modern Animated Action Button ==========
interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  variant: 'call' | 'message';
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onPress, variant }) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
      tension: 100,
    }).start();
  };

  const buttonColors = variant === 'call'
    ? { bg: '#10B981', shadow: '#059669' }
    : { bg: '#3B82F6', shadow: '#2563EB' };

  return (
    <Animated.View style={[actionButtonStyles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          actionButtonStyles.button,
          {
            backgroundColor: buttonColors.bg,
            shadowColor: buttonColors.shadow,
          }
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
      >
        <View style={actionButtonStyles.iconContainer}>
          <Ionicons name={icon as any} size={20} color="#fff" />
        </View>
        <Text style={actionButtonStyles.label}>{label}</Text>
        <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const actionButtonStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

// ========== TypeScript Interfaces ==========
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  color: string;
  icon: string;
  statType: 'totalDonors' | 'availableDonors' | 'requestsThisMonth' | 'successfulDonations';
  onPress: (statType: string) => void;
}

interface StatDetailData {
  title: string;
  data: any[];
  totalCount: number;
  lastUpdated: string;
}

interface DonorDetail {
  id: string;
  name: string;
  bloodType: string;
  availability: string;
  lastDonation?: string;
  location: string;
  phoneNumber?: string;
}

// Extended donor detail with additional info for expanded view
interface ExpandedDonorDetail extends DonorDetail {
  email?: string | null;
  age?: number;
  sex?: string;
  dateRegistered?: string;
  notes?: string;
}

interface RequestDetail {
  id: string;
  patientName: string;
  bloodType: string;
  urgency: string;
  location: string;
  createdAt: string;
  status: string;
}

interface DonationDetail {
  id: string;
  donorName: string;
  bloodType: string;
  date: string;
  location: string;
  volume: string;
}

// ========== Reusable Components ==========
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  color,
  icon,
  statType,
  onPress
}) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.statCard, { backgroundColor: colors.surface }]}
      activeOpacity={0.7}
      onPress={() => onPress(statType)}
    >
      <View style={[styles.statIconContainer, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: colors.text }]}>{value.toLocaleString()}</Text>
        <Text style={[styles.statTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      </View>
      <View style={[styles.statIndicator, { backgroundColor: color + '20' }]} />
    </TouchableOpacity>
  );
};

const StatDetailModal: React.FC<{
  visible: boolean;
  statData: StatDetailData | null;
  onClose: () => void;
}> = ({ visible, statData, onClose }) => {
  const { colors } = useTheme();
  const [expandedDonorId, setExpandedDonorId] = useState<string | null>(null);
  const [expandedDonorData, setExpandedDonorData] = useState<ExpandedDonorDetail | null>(null);
  const [loadingExpanded, setLoadingExpanded] = useState(false);

  // Reset expanded state when modal closes or changes
  React.useEffect(() => {
    if (!visible) {
      setExpandedDonorId(null);
      setExpandedDonorData(null);
    }
  }, [visible]);

  const fetchExpandedDonorData = async (donorId: string) => {
    try {
      setLoadingExpanded(true);
      const rows = await queryRows<Record<string, any>>(
        `SELECT id, full_name, blood_type, availability_status, municipality, 
                last_donation_date, contact_number, age, sex, created_at, notes
         FROM donors 
         WHERE id = ? AND is_deleted = 0
         LIMIT 1`,
        [donorId]
      );

      if (rows.length > 0) {
        const row = rows[0];
        setExpandedDonorData({
          id: String(row.id),
          name: row.full_name,
          bloodType: row.blood_type,
          availability: row.availability_status,
          location: row.municipality || 'Unknown',
          lastDonation: row.last_donation_date,
          phoneNumber: row.contact_number,
          email: undefined, // email column doesn't exist in donors table
          age: row.age,
          sex: row.sex,
          dateRegistered: row.created_at, // using created_at instead of date_registered
          notes: row.notes,
        });
      }
    } catch (error) {
      console.error('Error fetching expanded donor data:', error);
      Alert.alert('Error', 'Failed to load donor details');
    } finally {
      setLoadingExpanded(false);
    }
  };

  const handleDonorPress = (donor: DonorDetail) => {
    if (expandedDonorId === donor.id) {
      // Collapse if already expanded
      setExpandedDonorId(null);
      setExpandedDonorData(null);
    } else {
      // Expand this donor
      setExpandedDonorId(donor.id);
      fetchExpandedDonorData(donor.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCall = async (phoneNumber: string) => {
    const url = `tel:${phoneNumber}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Phone call is not available on this device.');
      }
    } catch (error) {
      console.error('Failed to open phone app:', error);
      Alert.alert('Error', 'Failed to open phone app.');
    }
  };

  const handleMessage = async (phoneNumber: string) => {
    const url = `sms:${phoneNumber}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Messaging is not available on this device.');
      }
    } catch (error) {
      console.error('Failed to open messaging app:', error);
      Alert.alert('Error', 'Failed to open messaging app.');
    }
  };

  const renderDetailItem = (item: any, index: number) => {
    switch (statData?.title) {
      case 'Total Donors':
        const donor = item as DonorDetail;
        const isExpanded = expandedDonorId === donor.id;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.detailItem,
              { backgroundColor: colors.surface },
              isExpanded && styles.detailItemExpanded
            ]}
            onPress={() => handleDonorPress(donor)}
            activeOpacity={0.7}
          >
            {/* List Mode - Always Visible */}
            <View style={styles.listModeContainer}>
              <View style={styles.listModeLeft}>
                <Text style={[styles.listModeName, { color: colors.text }]}>{donor.name}</Text>
                <Text style={[styles.listModeSubtitle, { color: colors.textSecondary }]}>
                  Tap to view details
                </Text>
              </View>
              <View style={[styles.bloodTypeBadge, { backgroundColor: '#FF6B6B20' }]}>
                <Text style={[styles.bloodTypeText, { color: '#FF6B6B' }]}>{donor.bloodType}</Text>
              </View>
              <Ionicons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={20}
                color={colors.textSecondary}
                style={styles.expandIcon}
              />
            </View>

            {/* Expanded Card Mode - Only Visible When Expanded */}
            {isExpanded && (
              <View style={styles.expandedContent}>
                {loadingExpanded ? (
                  <View style={styles.loadingExpandedContainer}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                      Loading details...
                    </Text>
                  </View>
                ) : expandedDonorData ? (
                  <>
                    <View style={[styles.expandedDivider, { backgroundColor: colors.border }]} />
                    
                    {/* Contact Info */}
                    <View style={styles.expandedSection}>
                      <Text style={[styles.expandedSectionTitle, { color: colors.primary }]}>
                        Contact Information
                      </Text>
                      {expandedDonorData.phoneNumber && (
                        <View style={styles.expandedRow}>
                          <Ionicons name="call-outline" size={16} color={colors.textSecondary} />
                          <Text style={[styles.expandedText, { color: colors.text }]}>
                            {expandedDonorData.phoneNumber}
                          </Text>
                        </View>
                      )}
                      {expandedDonorData.email && (
                        <View style={styles.expandedRow}>
                          <Ionicons name="mail-outline" size={16} color={colors.textSecondary} />
                          <Text style={[styles.expandedText, { color: colors.text }]}>
                            {expandedDonorData.email}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Personal Info */}
                    <View style={styles.expandedSection}>
                      <Text style={[styles.expandedSectionTitle, { color: colors.primary }]}>
                        Personal Details
                      </Text>
                      <View style={styles.expandedRow}>
                        <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                        <Text style={[styles.expandedText, { color: colors.text }]}>
                          {expandedDonorData.location}
                        </Text>
                      </View>
                      {expandedDonorData.age && (
                        <View style={styles.expandedRow}>
                          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                          <Text style={[styles.expandedText, { color: colors.text }]}>
                            {expandedDonorData.age} years old
                          </Text>
                        </View>
                      )}
                      {expandedDonorData.sex && (
                        <View style={styles.expandedRow}>
                          <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
                          <Text style={[styles.expandedText, { color: colors.text }]}>
                            {expandedDonorData.sex}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Donation Info */}
                    <View style={styles.expandedSection}>
                      <Text style={[styles.expandedSectionTitle, { color: colors.primary }]}>
                        Donation Status
                      </Text>
                      <View style={styles.expandedRow}>
                        <View style={[styles.statusDot, { 
                          backgroundColor: expandedDonorData.availability === 'Available' ? '#00C896' : '#FF6B6B' 
                        }]} />
                        <Text style={[styles.expandedText, { color: colors.text }]}>
                          {expandedDonorData.availability}
                        </Text>
                      </View>
                      {expandedDonorData.lastDonation && (
                        <View style={styles.expandedRow}>
                          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                          <Text style={[styles.expandedText, { color: colors.text }]}>
                            Last donation: {formatDate(expandedDonorData.lastDonation)}
                          </Text>
                        </View>
                      )}
                      {expandedDonorData.dateRegistered && (
                        <View style={styles.expandedRow}>
                          <Ionicons name="calendar-clear-outline" size={16} color={colors.textSecondary} />
                          <Text style={[styles.expandedText, { color: colors.text }]}>
                            Registered: {formatDate(expandedDonorData.dateRegistered)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Notes */}
                    {expandedDonorData.notes && (
                      <View style={styles.expandedSection}>
                        <Text style={[styles.expandedSectionTitle, { color: colors.primary }]}>
                          Notes
                        </Text>
                        <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                          {expandedDonorData.notes}
                        </Text>
                      </View>
                    )}

                    {/* Action Buttons */}
                    {expandedDonorData.phoneNumber && (
                      <View style={styles.actionButtonsContainer}>
                        <ActionButton
                          icon="call"
                          label="Call"
                          variant="call"
                          onPress={() => handleCall(expandedDonorData.phoneNumber!)}
                        />
                        <ActionButton
                          icon="chatbubble"
                          label="Message"
                          variant="message"
                          onPress={() => handleMessage(expandedDonorData.phoneNumber!)}
                        />
                      </View>
                    )}
                  </>
                ) : null}
              </View>
            )}
          </TouchableOpacity>
        );

      case 'Available Donors':
        const availableDonor = item as DonorDetail;
        return (
          <View key={index} style={[styles.detailItem, { backgroundColor: colors.surface }]}>
            <View style={styles.detailHeader}>
              <Text style={[styles.detailName, { color: colors.text }]}>{availableDonor.name}</Text>
              <View style={[styles.bloodTypeBadge, { backgroundColor: '#00C89620' }]}>
                <Text style={[styles.bloodTypeText, { color: '#00C896' }]}>{availableDonor.bloodType}</Text>
              </View>
            </View>
            <View style={styles.detailInfo}>
              <Text style={[styles.detailInfoText, { color: colors.textSecondary }]}>
                📍 {availableDonor.location}
              </Text>
              <Text style={[styles.detailInfoText, { color: colors.textSecondary }]}>
                ✅ Available Now
              </Text>
            </View>
            {availableDonor.phoneNumber && (
              <View style={styles.actionButtonsContainer}>
                <ActionButton
                  icon="call"
                  label="Call"
                  variant="call"
                  onPress={() => handleCall(availableDonor.phoneNumber!)}
                />
                <ActionButton
                  icon="chatbubble"
                  label="Message"
                  variant="message"
                  onPress={() => handleMessage(availableDonor.phoneNumber!)}
                />
              </View>
            )}
          </View>
        );

      case 'Requests This Month':
        const request = item as RequestDetail;
        return (
          <View key={index} style={[styles.detailItem, { backgroundColor: colors.surface }]}>
            <View style={styles.detailHeader}>
              <Text style={[styles.detailName, { color: colors.text }]}>{request.patientName}</Text>
              <View style={[styles.bloodTypeBadge, { backgroundColor: '#FF9F4320' }]}>
                <Text style={[styles.bloodTypeText, { color: '#FF9F43' }]}>{request.bloodType}</Text>
              </View>
            </View>
            <View style={styles.detailInfo}>
              <Text style={[styles.detailInfoText, { color: colors.textSecondary }]}>
                📍 {request.location}
              </Text>
              <Text style={[styles.detailInfoText, { color: colors.textSecondary }]}>
                🚨 {request.urgency}
              </Text>
              <Text style={[styles.detailInfoText, { color: colors.textSecondary }]}>
                📅 {formatDate(request.createdAt)}
              </Text>
              <Text style={[styles.detailStatus, {
                color: request.status === 'Active' ? '#00C896' : '#9B51E0'
              }]}>
                {request.status}
              </Text>
            </View>
          </View>
        );

      case 'Successful Donations':
        const donation = item as DonationDetail;
        return (
          <View key={index} style={[styles.detailItem, { backgroundColor: colors.surface }]}>
            <View style={styles.detailHeader}>
              <Text style={[styles.detailName, { color: colors.text }]}>{donation.donorName}</Text>
              <View style={[styles.bloodTypeBadge, { backgroundColor: '#9B51E020' }]}>
                <Text style={[styles.bloodTypeText, { color: '#9B51E0' }]}>{donation.bloodType}</Text>
              </View>
            </View>
            <View style={styles.detailInfo}>
              <Text style={[styles.detailInfoText, { color: colors.textSecondary }]}>
                📍 {donation.location}
              </Text>
              <Text style={[styles.detailInfoText, { color: colors.textSecondary }]}>
                📅 {formatDate(donation.date)}
              </Text>
              <Text style={[styles.detailInfoText, { color: colors.textSecondary }]}>
                🩸 Volume: {donation.volume}
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (!statData) return null;

  const isTotalDonors = statData.title === 'Total Donors';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, isTotalDonors && styles.modalOverlayTall]}>
        <View style={[
          styles.modalContent, 
          { backgroundColor: colors.surface },
          isTotalDonors && styles.modalContentTall
        ]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{statData.title}</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Total: {statData.totalCount} items
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            showsVerticalScrollIndicator={false}
          >
            {statData.data.length > 0 ? (
              statData.data.map((item, index) => renderDetailItem(item, index))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open" size={64} color={colors.textSecondary} />
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                  No data available
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              Last updated: {formatDate(statData.lastUpdated)}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ========== Main Component ==========
interface StatsGridProps {
  totalDonors: number;
  availableDonors: number;
  requestsThisMonth: number;
  successfulDonations: number;
}

const StatsGrid: React.FC<StatsGridProps> = ({
  totalDonors,
  availableDonors,
  requestsThisMonth,
  successfulDonations,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStatData, setSelectedStatData] = useState<StatDetailData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStatDetails = async (statType: string): Promise<void> => {
    try {
      setLoading(true);
      const currentTime = new Date().toISOString();

      switch (statType) {
        case 'totalDonors': {
          const rows = await queryRows<Record<string, any>>(
            `SELECT id, full_name, blood_type, availability_status, municipality, last_donation_date, contact_number 
             FROM donors 
             WHERE is_deleted = 0
             ORDER BY full_name ASC 
             LIMIT 50`
          );

          const donors: DonorDetail[] = rows.map(row => ({
            id: String(row.id),
            name: row.full_name,
            bloodType: row.blood_type,
            availability: row.availability_status,
            location: row.municipality || 'Unknown',
            lastDonation: row.last_donation_date,
            phoneNumber: row.contact_number,
          }));

          setSelectedStatData({
            title: 'Total Donors',
            data: donors,
            totalCount: donors.length,
            lastUpdated: currentTime,
          });
          break;
        }

        case 'availableDonors': {
          const rows = await queryRows<Record<string, any>>(
            `SELECT id, full_name, blood_type, availability_status, municipality, contact_number 
             FROM donors 
             WHERE availability_status = 'Available' AND is_deleted = 0
             ORDER BY full_name ASC 
             LIMIT 50`
          );

          const donors: DonorDetail[] = rows.map(row => ({
            id: String(row.id),
            name: row.full_name,
            bloodType: row.blood_type,
            availability: row.availability_status,
            location: row.municipality || 'Unknown',
            phoneNumber: row.contact_number,
          }));

          setSelectedStatData({
            title: 'Available Donors',
            data: donors,
            totalCount: donors.length,
            lastUpdated: currentTime,
          });
          break;
        }

        case 'requestsThisMonth': {
          const currentMonth = new Date().toISOString().slice(0, 7);
          const rows = await queryRows<Record<string, any>>(
            `SELECT id, requester_name, blood_type, urgency, location, created_at, status
             FROM blood_requests 
             WHERE strftime('%Y-%m', created_at) = ?
             ORDER BY created_at DESC 
             LIMIT 50`,
            [currentMonth]
          );

          const requests: RequestDetail[] = rows.map(row => ({
            id: String(row.id),
            patientName: row.requester_name,
            bloodType: row.blood_type,
            urgency: row.urgency,
            location: row.location,
            createdAt: row.created_at,
            status: row.status || 'Active',
          }));

          setSelectedStatData({
            title: 'Requests This Month',
            data: requests,
            totalCount: requests.length,
            lastUpdated: currentTime,
          });
          break;
        }

        case 'successfulDonations': {
          const rows = await queryRows<Record<string, any>>(
            `SELECT d.id, dr.full_name as donor_name, d.blood_type, d.donation_date, d.location, d.quantity
             FROM donations d
             JOIN donors dr ON d.donor_id = dr.id
             WHERE dr.is_deleted = 0
             ORDER BY d.donation_date DESC 
             LIMIT 50`
          );

          const donations: DonationDetail[] = rows.map(row => ({
            id: String(row.id),
            donorName: row.donor_name,
            bloodType: row.blood_type,
            date: row.donation_date,
            location: row.location,
            volume: `${row.quantity || 450}ml`,
          }));

          setSelectedStatData({
            title: 'Successful Donations',
            data: donations,
            totalCount: donations.length,
            lastUpdated: currentTime,
          });
          break;
        }

        default:
          return;
      }

      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching stat details:', error);
      Alert.alert('Error', 'Failed to load detailed data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatPress = (statType: string): void => {
    fetchStatDetails(statType);
  };

  const handleCloseModal = (): void => {
    setModalVisible(false);
    setSelectedStatData(null);
  };

  return (
    <>
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Donors"
          value={totalDonors}
          subtitle="Registered in system"
          color="#4A6FFF"
          icon="people-outline"
          statType="totalDonors"
          onPress={handleStatPress}
        />
        <StatCard
          title="Available Now"
          value={availableDonors}
          subtitle="Ready to donate"
          color="#00C896"
          icon="checkmark-circle-outline"
          statType="availableDonors"
          onPress={handleStatPress}
        />
        <StatCard
          title="This Month"
          value={requestsThisMonth}
          subtitle="Blood requests"
          color="#FF9F43"
          icon="calendar-outline"
          statType="requestsThisMonth"
          onPress={handleStatPress}
        />
        <StatCard
          title="Successful"
          value={successfulDonations}
          subtitle="Completed donations"
          color="#9B51E0"
          icon="trophy-outline"
          statType="successfulDonations"
          onPress={handleStatPress}
        />
      </View>

      {loading && <LoadingIndicator />}

      <StatDetailModal
        visible={modalVisible}
        statData={selectedStatData}
        onClose={handleCloseModal}
      />
    </>
  );
};

// ========== Styles ==========
const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: Dimensions.get('window').width / 2 - 30,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 150,
    maxHeight: 150,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 11,
  },
  statIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    borderBottomLeftRadius: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    padding: 0,
  },
  modalOverlayTall: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderRadius: 20,
    maxHeight: '85%',
    minHeight: 300,
    marginHorizontal: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  modalContentTall: {
    maxHeight: '92%',
    minHeight: 500,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    flex: 1,
    padding: 20,
  },
  detailItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailItemExpanded: {
    paddingBottom: 20,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  bloodTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bloodTypeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  detailInfo: {
    gap: 4,
  },
  detailInfoText: {
    fontSize: 13,
  },
  detailStatus: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 12,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  // List Mode Styles
  listModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listModeLeft: {
    flex: 1,
    marginRight: 12,
  },
  listModeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  listModeSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  expandIcon: {
    marginLeft: 8,
  },
  // Expanded Card Mode Styles
  expandedContent: {
    marginTop: 12,
  },
  loadingExpandedContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 8,
  },
  expandedDivider: {
    height: 1,
    marginBottom: 16,
  },
  expandedSection: {
    marginBottom: 16,
  },
  expandedSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  expandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  expandedText: {
    fontSize: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default StatsGrid;