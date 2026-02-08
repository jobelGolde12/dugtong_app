import { useTheme } from '@/contexts/ThemeContext';
import { Donor } from '@/types/donor.types';
import { Ionicons } from '@expo/vector-icons';
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

  return (
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
                {donor.name.charAt(0)}
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
                {donor.name}
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

      {/* Expandable contact button */}
      <Animated.View 
        style={[
          styles.expandableSection,
          {
            height: expanded ? (isSmallDevice ? 44 : 48) : 0,
            opacity: expanded ? 1 : 0,
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.contactButton,
            { 
              backgroundColor: colors.primary,
              opacity: isAvailable ? 1 : 0.6
            }
          ]}
          onPress={() => onPress(donor)}
          activeOpacity={0.8}
          disabled={!isAvailable}
        >
          <Ionicons 
            name="chatbubble-ellipses-outline" 
            size={isSmallDevice ? 16 : 18} 
            color="#fff" 
          />
          <Text style={[
            styles.contactButtonText,
            { fontSize: isSmallDevice ? 13 : 14 }
          ]}>
            {isAvailable ? 'Contact Donor' : 'Not Available'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
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
    marginTop: 8,
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