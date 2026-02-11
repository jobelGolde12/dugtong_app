import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileInfo } from '../../types/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface ProfileCardProps extends ProfileInfo {
  onPress?: () => void;
  showEditButton?: boolean;
  onEditPress?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  email,
  initials,
  avatarUrl,
  onPress,
  showEditButton = true,
  onEditPress,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handlePress = () => {
    if (onPress) onPress();
  };

  const handleEditPress = () => {
    if (onEditPress) onEditPress();
  };

  const renderAvatar = () => {
    if (avatarUrl) {
      return (
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatar}
          accessibilityLabel={`Profile picture of ${name}`}
        />
      );
    }

    return (
      <View style={styles.avatarFallback}>
        <Text style={styles.avatarText} accessibilityLabel={`Initials: ${initials}`}>
          {initials}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Profile information for ${name}`}
      accessibilityHint="Double tap to edit profile"
    >
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          {renderAvatar()}
          <View style={styles.statusIndicator} />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1} accessibilityRole="text">
            {name}
          </Text>
          <View style={styles.emailRow}>
            <Ionicons 
              name="mail-outline" 
              size={14} 
              color={colors.textSecondary} 
              style={styles.emailIcon}
            />
            <Text style={styles.email} numberOfLines={1} accessibilityRole="text">
              {email}
            </Text>
          </View>
        </View>
        {showEditButton && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            accessibilityHint="Opens profile edit screen"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons 
              name="chevron-forward" 
              size={18} 
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    marginRight: 16,
    position: 'relative',
  },
  avatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  emailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailIcon: {
    marginRight: 6,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    opacity: 0.85,
    flex: 1,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default memo(ProfileCard);
