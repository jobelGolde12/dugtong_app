import React, { memo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import { ThemeOption as ThemeOptionType } from '../../types/theme';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeOptionProps {
  option: ThemeOptionType;
  isActive: boolean;
  onPress: (key: string) => void;
  isLast?: boolean;
}

const ThemeOption: React.FC<ThemeOptionProps> = memo(({
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
        <Text style={styles.icon} accessibilityElementsHidden={true}>
          {option.icon}
        </Text>
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
});

const createStyles = (colors: any, isActive: boolean, isLast: boolean) =>
  StyleSheet.create({
    container: {
      padding: 16,
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: isLast ? 'transparent' : colors.border,
      backgroundColor: isActive ? colors.primary + '15' : 'transparent',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    icon: {
      fontSize: 24,
      marginRight: 12,
      minWidth: 32,
    },
    textContainer: {
      flex: 1,
      marginRight: 12,
    },
    label: {
      fontSize: 16,
      fontWeight: isActive ? '600' : '500',
      color: isActive ? colors.primary : colors.text,
      marginBottom: 2,
      letterSpacing: -0.3,
    },
    description: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
      opacity: 0.8,
    },
    radioContainer: {
      padding: 4,
    },
    radioOuter: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: isActive ? colors.primary : colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
  });

export default ThemeOption;
