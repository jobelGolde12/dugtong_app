import React, { memo, ReactNode } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  containerStyle?: object;
  testID?: string;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  children,
  containerStyle,
  testID,
}) => {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View
      style={[styles.container, containerStyle]}
      testID={testID}
      accessibilityLabel={`${title} settings section`}
    >
      <View style={styles.header}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    opacity: 0.85,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...Platform.select({
      ios: {
        shadowColor: colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});

export default SettingsSection;
