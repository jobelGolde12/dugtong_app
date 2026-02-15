import { router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES } from '../constants/roles.constants';
import { useTheme } from '../contexts/ThemeContext';
import { Text, View, StyleSheet } from 'react-native';
import RoleBasedDashboardLayout from './components/RoleBasedDashboardLayout';

export default function DashboardScreen() {
  const { userRole } = useAuth();
  const { colors } = useTheme();

  useEffect(() => {
    // Wait for userRole to be loaded
    if (userRole === null || userRole === undefined) {
      return;
    }
    
    // Redirect based on role
    if (userRole === USER_ROLES.DONOR) {
      router.replace('/DonorDashboard');
      return;
    }

    // For admin, hospital staff, and health officer, redirect to search
    router.replace('/search');
  }, [userRole]);

  // Show loading state while determining redirect
  return (
    <RoleBasedDashboardLayout>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading dashboard...
        </Text>
      </View>
    </RoleBasedDashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
