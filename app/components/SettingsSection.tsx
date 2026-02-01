import React, { memo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  containerStyle?: object;
  testID?: string;
}

const SettingsSection: React.FC<SettingsSectionProps> = memo(({
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
});

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
});

export default SettingsSection;
