import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeOption as ThemeOptionType } from '../../types/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeOptionProps {
  option: ThemeOptionType;
  isActive: boolean;
  onPress: (key: string) => void;
  isLast?: boolean;
}

const ThemeOption: React.FC<ThemeOptionProps> = ({
  option,
  isActive,
  onPress,
  isLast = false,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors, isActive, isLast);

  const handlePress = () => {
    onPress(option.key);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="radio"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${option.label} theme`}
      accessibilityHint="Double tap to select this theme"
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          {typeof option.icon === 'string' ? (
            <Ionicons 
              name={option.icon as any} 
              size={28} 
              color={isActive ? colors.primary : colors.textSecondary} 
            />
          ) : (
            <Text style={styles.icon} accessibilityElementsHidden={true}>
              {option.icon}
            </Text>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{option.label}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {option.description}
          </Text>
        </View>
        <View style={styles.radioContainer}>
          <View style={styles.radioOuter}>
            {isActive && <View style={styles.radioInner} />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors: any, isActive: boolean, isLast: boolean) =>
  StyleSheet.create({
    container: {
      padding: 20,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: isLast ? 'transparent' : colors.border + '30',
      backgroundColor: isActive ? colors.primary + '08' : 'transparent',
      marginHorizontal: 4,
      borderRadius: isLast ? 12 : 0,
      marginBottom: isLast ? 4 : 0,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconContainer: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      marginTop: 2,
      opacity: isActive ? 1 : 0.7,
    },
    icon: {
      fontSize: 28,
      minWidth: 32,
      color: isActive ? colors.primary : colors.textSecondary,
    },
    textContainer: {
      flex: 1,
      marginRight: 16,
    },
    label: {
      fontSize: 17,
      fontWeight: isActive ? '700' : '600',
      color: isActive ? colors.primary : colors.text,
      marginBottom: 4,
      letterSpacing: -0.3,
    },
    description: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      opacity: 0.75,
    },
    radioContainer: {
      padding: 6,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioOuter: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: isActive ? colors.primary : colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
      ...Platform.select({
        ios: {
          shadowColor: isActive ? colors.primary : 'transparent',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isActive ? 0.2 : 0,
          shadowRadius: 4,
        },
      }),
    },
    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.3,
          shadowRadius: 2,
        },
      }),
    },
  });

export default ThemeOption;
