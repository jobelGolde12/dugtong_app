import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { ProfileInfo } from '../../types/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface ProfileCardProps extends ProfileInfo {
  onPress?: () => void;
  showEditButton?: boolean;
  onEditPress?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = memo(({
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
        {renderAvatar()}
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1} accessibilityRole="text">
            {name}
          </Text>
          <Text style={styles.email} numberOfLines={1} accessibilityRole="text">
            {email}
          </Text>
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
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
});

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textOnPrimary,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  email: {
    fontSize: 14,
    color: colors.textSecondary,
    opacity: 0.9,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surfaceVariant,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});

export default ProfileCard;
