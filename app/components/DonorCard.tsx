
import { useTheme } from '@/contexts/ThemeContext';
import { Donor } from '@/types/donor.types';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

interface DonorCardProps {
  donor: Donor;
  onPress: (donor: Donor) => void;
}

const DonorCard: React.FC<DonorCardProps> = ({ donor, onPress }) => {
  const { colors, isDark } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const { width } = useWindowDimensions();
  
  // Determine device size thresholds based on actual screen width
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

  return (
    <TouchableOpacity
      style={[
        styles.donorCard,
        {
          backgroundColor: colors.card,
          borderColor: 'transparent',
          padding: isSmallDevice ? 14 : 20,
          transform: [{ scale: expanded ? 1.01 : 1 }]
        }
      ]}
      onPress={() => setExpanded(!expanded)}
      onLongPress={() => onPress(donor)}
      activeOpacity={0.9}
      delayLongPress={500}
    >
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { 
            width: isSmallDevice ? 44 : 48,
            height: isSmallDevice ? 44 : 48,
            borderRadius: isSmallDevice ? 22 : 24,
            backgroundColor: colors.primary + '20' 
          }]}>
            <Text style={[styles.avatarText, { 
              fontSize: isSmallDevice ? 18 : 20,
              color: colors.primary 
            }]}>
              {donor.name.charAt(0)}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={[styles.donorName, { 
              color: colors.text,
              fontSize: isSmallDevice ? 16 : 18 
            }]} numberOfLines={1} ellipsizeMode="tail">
              {donor.name}
            </Text>
            <View style={styles.donorMeta}>
              <View style={[styles.badge, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons name="person" size={isSmallDevice ? 11 : 12} color={colors.primary} />
                <Text style={[styles.badgeText, { 
                  color: colors.primary,
                  fontSize: isSmallDevice ? 10 : 11 
                }]}>
                  {donor.age}y
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.textSecondary + '10' }]}>
                <FontAwesome name="transgender" size={isSmallDevice ? 11 : 12} color={colors.textSecondary} />
                <Text style={[styles.badgeText, { 
                  color: colors.textSecondary,
                  fontSize: isSmallDevice ? 10 : 11 
                }]}>
                  {donor.sex.charAt(0)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bloodTypeContainer}>
          <View style={[
            styles.bloodTypeBadge,
            { backgroundColor: getBloodTypeColor(donor.bloodType) + '20' }
          ]}>
            <Text style={[
              styles.bloodTypeText,
              { 
                color: getBloodTypeColor(donor.bloodType),
                fontSize: isSmallDevice ? 14 : 16 
              }
            ]}>
              {donor.bloodType}
            </Text>
          </View>
          <View style={[
            styles.statusBadge,
            { 
              backgroundColor: donor.availabilityStatus === 'Available' 
                ? '#10B98120' 
                : '#EF444420',
              borderColor: donor.availabilityStatus === 'Available'
                ? '#10B981'
                : '#EF4444'
            }
          ]}>
            <View style={[
              styles.statusDot,
              { 
                backgroundColor: donor.availabilityStatus === 'Available' 
                  ? '#10B981' 
                  : '#EF4444'
              }
            ]} />
            <Text style={[
              styles.statusText,
              { 
                color: donor.availabilityStatus === 'Available' 
                  ? '#10B981' 
                  : '#EF4444',
                fontSize: isSmallDevice ? 10 : 11
              }
            ]}>
              {donor.availabilityStatus}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardBody}>
        {/* On very small screens, stack location and last donation vertically to prevent overflow */}
        <View style={[
          styles.infoRow,
          isVerySmallDevice && { flexDirection: 'column', gap: 8 }
        ]}>
          <View style={styles.infoItem}>
            <Ionicons name="location" size={isSmallDevice ? 15 : 16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { 
              color: colors.text,
              fontSize: isSmallDevice ? 13 : 14 
            }]} numberOfLines={1} ellipsizeMode="tail">
              {donor.municipality}
            </Text>
          </View>
          {!isVerySmallDevice && <View style={{ width: 12 }} />}
          <View style={styles.infoItem}>
            <Ionicons name="calendar" size={isSmallDevice ? 15 : 16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { 
              color: colors.text,
              fontSize: isSmallDevice ? 13 : 14 
            }]} numberOfLines={1} ellipsizeMode="tail">
              {donor.lastDonationDate 
                ? `Last: ${new Date(donor.lastDonationDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}`
                : 'No donations yet'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="call" size={isSmallDevice ? 15 : 16} color={colors.textSecondary} />
            <Text style={[styles.infoText, { 
              color: colors.text,
              fontSize: isSmallDevice ? 13 : 14 
            }]} numberOfLines={1} ellipsizeMode="tail">
              {donor.contactNumber}
            </Text>
          </View>
        </View>
      </View>

      <Animated.View 
        style={[
          styles.cardFooter,
          {
            height: expanded ? (isSmallDevice ? 46 : 50) : 0,
            opacity: expanded ? 1 : 0,
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: colors.primary }]}
          onPress={() => onPress(donor)}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses" size={isSmallDevice ? 16 : 18} color="#fff" />
          <Text style={[styles.contactButtonText, { 
            fontSize: isSmallDevice ? 13 : 14 
          }]}>Contact Donor</Text>
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  donorCard: {
    borderRadius: 20,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0, // Critical for proper text truncation in flex containers
  },
  avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
    minWidth: 0, // Allows child text elements to truncate properly
  },
  donorName: {
    fontWeight: '700',
    marginBottom: 6,
  },
  donorMeta: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  badgeText: {
    fontWeight: '600',
  },
  bloodTypeContainer: {
    alignItems: 'flex-end',
    gap: 6,
    marginLeft: 8, // Prevents crowding with user info on small screens
  },
  bloodTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  bloodTypeText: {
    fontWeight: '800',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontWeight: '600',
  },
  cardBody: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    minWidth: 0, // Enables proper text truncation within flex items
  },
  infoText: {
    fontWeight: '400',
    flex: 1,
  },
  cardFooter: {
    overflow: 'hidden',
    marginTop: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default DonorCard;
