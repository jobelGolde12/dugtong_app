import { useTheme } from '@/contexts/ThemeContext';
import { Donor } from '@/types/donor.types';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Alert, Animated, Clipboard, Linking, Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { checkPhonePermission, openAppSettings, requestPhonePermission } from '../../lib/utils/permissions';
import { getPermissionRequestCount, incrementPermissionRequestCount } from '../../lib/utils/storage';
import PermissionRequestModal from './permissions/PermissionRequestModal';
import SettingsRedirectModal from './permissions/SettingsRedirectModal';

// ========== Modern Animated Action Button ==========
interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  variant: 'call' | 'message';
  disabled?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ icon, label, onPress, variant, disabled = false }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
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
    <Animated.View style={[actionStyles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        style={[
          actionStyles.button,
          {
            backgroundColor: buttonColors.bg,
            shadowColor: buttonColors.shadow,
            opacity: disabled ? 0.5 : 1,
          }
        ]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        activeOpacity={1}
        disabled={disabled}
      >
        <View style={actionStyles.iconContainer}>
          <Ionicons name={icon as any} size={18} color="#fff" />
        </View>
        <Text style={actionStyles.label}>{label}</Text>
        <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const actionStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  label: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

interface DonorCardProps {
  donor: Donor;
  onPress: (donor: Donor) => void;
}

const DonorCard: React.FC<DonorCardProps> = ({ donor, onPress }) => {
  const { colors, isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const { width } = useWindowDimensions();
  const [permissionModalVisible, setPermissionModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Determine device size thresholds
  const isSmallDevice = width < 375;
  const isVerySmallDevice = width < 340;

  const getBloodTypeColor = (type: string) => {
    const colorsMap: Record<string, string> = {
      'O+': '#DC2626',
      'O-': '#DC2626',
      'A+': '#2563EB',
      'A-': '#2563EB',
      'B+': '#059669',
      'B-': '#059669',
      'AB+': '#7C3AED',
      'AB-': '#7C3AED',
    };
    return colorsMap[type] || colors.primary;
  };

  const bloodTypeColor = getBloodTypeColor(donor.bloodType);
  const statusColor = donor.availabilityStatus === 'Available' ? '#10B981' : '#EF4444';
  const isAvailable = donor.availabilityStatus === 'Available';

  const makeCall = () => {
    const cleanNumber = donor.contactNumber.replace(/[^0-9+]/g, '');
    let url = `tel:${cleanNumber}`;
    if (Platform.OS === 'ios') {
      url = `telprompt:${cleanNumber}`;
    }

    Linking.canOpenURL(url)
      .then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'This device does not support making phone calls.');
        }
      })
      .catch(err => console.error('An error occurred', err));
  };
  
  const handleCall = async () => {
    if (!donor.contactNumber) {
      Alert.alert('Error', 'No phone number available for this donor.');
      return;
    }

    const permissionStatus = await checkPhonePermission();

    switch (permissionStatus) {
      case 'granted':
        makeCall();
        break;
      case 'undetermined':
        setPermissionModalVisible(true);
        break;
      case 'denied':
        const requestCount = await getPermissionRequestCount();
        if (requestCount < 2) { // Show rationale once after first denial
          setPermissionModalVisible(true);
        } else {
          setSettingsModalVisible(true);
        }
        break;
      case 'blocked':
        setSettingsModalVisible(true);
        break;
      case 'unavailable':
        Alert.alert('Error', 'Phone call functionality is not available on this device.');
        break;
    }
  };

  const handleRequestPermission = async () => {
    setPermissionModalVisible(false);
    await incrementPermissionRequestCount();
    const newStatus = await requestPhonePermission();
    if (newStatus === 'granted') {
      makeCall();
    } else if (newStatus === 'blocked' || newStatus === 'denied') {
      setSettingsModalVisible(true);
    }
  };

  const handleOpenSettings = () => {
    setSettingsModalVisible(false);
    openAppSettings();
  };

  const handleCopyToClipboard = () => {
    Clipboard.setString(donor.contactNumber);
    Alert.alert('Copied', 'Phone number copied to clipboard.');
  }

  // Handle message action
  const handleMessage = async () => {
    if (!donor.contactNumber) {
      Alert.alert('Error', 'No phone number available for this donor.');
      return;
    }
    const url = `sms:${donor.contactNumber}`;
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

  return (
    <>
      <PermissionRequestModal
        visible={permissionModalVisible}
        onClose={() => setPermissionModalVisible(false)}
        onAllow={handleRequestPermission}
        title="Allow Phone Calls"
        message="To call donors directly from the app, please allow access to your phone."
        iconName="call-outline"
      />
      <SettingsRedirectModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        onOpenSettings={handleOpenSettings}
        title="Permission Denied"
        message="To make calls, you need to enable phone permissions in your device settings. Alternatively, you can copy the number to your clipboard."
      >
        <TouchableOpacity style={styles.copyButton} onPress={handleCopyToClipboard}>
          <Ionicons name="copy-outline" size={20} color={colors.primary} />
          <Text style={[styles.copyButtonText, { color: colors.primary }]}>Copy Number</Text>
        </TouchableOpacity>
      </SettingsRedirectModal>
      <TouchableOpacity
        style={[
          styles.donorCard,
          {
            backgroundColor: colors.card,
            borderColor: isDark ? colors.border : 'transparent',
            borderWidth: isDark ? 1 : 0,
            padding: isSmallDevice ? 16 : 20,
            transform: [{ scale: expanded ? 1.01 : 1 }]
          }
        ]}
        onPress={() => setExpanded(!expanded)}
        onLongPress={() => onPress(donor)}
        activeOpacity={0.9}
        delayLongPress={500}
      >
        {/* Main content container */}
        <View style={styles.contentContainer}>

          {/* Top row: Avatar + Info + Blood Type */}
          <View style={styles.topRow}>
            <View style={styles.avatarContainer}>
              <View style={[
                styles.avatar,
                {
                  backgroundColor: colors.primary + '15',
                  width: isSmallDevice ? 44 : 50,
                  height: isSmallDevice ? 44 : 50,
                  borderRadius: isSmallDevice ? 22 : 25,
                }
              ]}>
                <Text style={[
                  styles.avatarText,
                  {
                    fontSize: isSmallDevice ? 18 : 20,
                    color: colors.primary
                  }
                ]}>
                  {donor.name ? donor.name.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>

              {/* Status indicator dot on avatar */}
              <View style={[
                styles.statusIndicator,
                {
                  backgroundColor: statusColor,
                  borderColor: colors.card,
                  borderWidth: 2,
                }
              ]} />
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.nameRow}>
                <Text style={[
                  styles.donorName,
                  {
                    color: colors.text,
                    fontSize: isSmallDevice ? 16 : 18
                  }
                ]} numberOfLines={1}>
                  {donor.name || 'Unknown'}
                </Text>

                {/* Combined age and gender badge */}
                <View style={[styles.combinedBadge, { backgroundColor: colors.surface }]}>
                  <Text style={[
                    styles.combinedBadgeText,
                    { color: colors.textSecondary, fontSize: isSmallDevice ? 11 : 12 }
                  ]}>
                    {donor.age}y • {donor.sex.charAt(0)}
                  </Text>
                </View>
              </View>

              {/* Location with minimal icon */}
              <View style={styles.locationRow}>
                <Ionicons
                  name="location-outline"
                  size={isSmallDevice ? 13 : 14}
                  color={colors.textSecondary}
                />
                <Text style={[
                  styles.locationText,
                  {
                    color: colors.text,
                    fontSize: isSmallDevice ? 13 : 14
                  }
                ]} numberOfLines={1}>
                  {donor.municipality}
                </Text>
              </View>
            </View>

            {/* Blood type badge */}
            <View style={styles.bloodTypeWrapper}>
              <View style={[
                styles.bloodTypeBadge,
                { backgroundColor: bloodTypeColor + '10' }
              ]}>
                <Text style={[
                  styles.bloodTypeText,
                  {
                    color: bloodTypeColor,
                    fontSize: isSmallDevice ? 16 : 18
                  }
                ]}>
                  {donor.bloodType}
                </Text>
              </View>
            </View>
          </View>

          {/* Bottom row: Contact and last donation */}
          <View style={styles.bottomRow}>
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Ionicons
                  name="call-outline"
                  size={isSmallDevice ? 14 : 15}
                  color={colors.textSecondary}
                />
                <Text style={[
                  styles.contactText,
                  {
                    color: colors.text,
                    fontSize: isSmallDevice ? 13 : 14
                  }
                ]} numberOfLines={1}>
                  {donor.contactNumber}
                </Text>
              </View>

              <View style={styles.contactItem}>
                <Ionicons
                  name="time-outline"
                  size={isSmallDevice ? 14 : 15}
                  color={colors.textSecondary}
                />
                <Text style={[
                  styles.lastDonationText,
                  {
                    color: colors.textSecondary,
                    fontSize: isSmallDevice ? 12 : 13
                  }
                ]}>
                  {donor.lastDonationDate
                    ? `Last: ${new Date(donor.lastDonationDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}`
                    : 'Never donated'}
                </Text>
              </View>
            </View>

            {/* Availability status - simplified */}
            <View style={[
              styles.availabilityBadge,
              { backgroundColor: statusColor + '10' }
            ]}>
              <Text style={[
                styles.availabilityText,
                {
                  color: statusColor,
                  fontSize: isSmallDevice ? 10 : 11
                }
              ]}>
                {isAvailable ? 'Available' : 'Unavailable'}
              </Text>
            </View>
          </View>
        </View>

        {/* Expandable action buttons - Call & Message */}
        <Animated.View
          style={[
            styles.expandableSection,
            {
              height: expanded ? (isSmallDevice ? 56 : 60) : 0,
              opacity: expanded ? 1 : 0,
            }
          ]}
        >
          <View style={styles.actionButtonsContainer}>
            <ActionButton
              icon="chatbubble"
              label="Message"
              variant="message"
              onPress={handleMessage}
              disabled={!isAvailable || !donor.contactNumber}
            />
          </View>
        </Animated.View>
      </TouchableOpacity>
    </>
  );
};

const styles = StyleSheet.create({
  donorCard: {
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contentContainer: {
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    fontWeight: '700',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  infoContainer: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  donorName: {
    fontWeight: '700',
    flex: 1,
    minWidth: 0,
  },
  combinedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  combinedBadgeText: {
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    fontWeight: '400',
    flex: 1,
    minWidth: 0,
  },
  bloodTypeWrapper: {
    marginLeft: 'auto',
  },
  bloodTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  bloodTypeText: {
    fontWeight: '800',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  contactInfo: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  contactText: {
    fontWeight: '500',
    flex: 1,
    minWidth: 0,
  },
  lastDonationText: {
    fontWeight: '400',
  },
  availabilityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  availabilityText: {
    fontWeight: '600',
  },
  expandableSection: {
    overflow: 'hidden',
    marginTop: 12,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 4,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
  },
  copyButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DonorCard;