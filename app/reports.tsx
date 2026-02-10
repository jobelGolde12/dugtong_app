import RoleBasedDashboardLayout from './components/RoleBasedDashboardLayout';
import ReportsScreen from './screens/dashboard/ReportsScreen';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { RoleGuard } from './components/RoleGuard';
import { USER_ROLES } from '../constants/roles.constants';
import { View, Text } from 'react-native';

export default function Reports() {
  const { userRole, isAdmin, isHealthOfficer, isLoading: authLoading } = useRoleAccess();

  // Show loading while authentication is being initialized
  if (authLoading) {
    return (
      <RoleBasedDashboardLayout>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </RoleBasedDashboardLayout>
    );
  }

  // Check if user has permission to access reports
  if (!isAdmin() && !isHealthOfficer()) {
    return (
      <RoleGuard 
        allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.HEALTH_OFFICER]} 
        userRole={userRole}
      >
        <View />
      </RoleGuard>
    );
  }

  return (
    <RoleBasedDashboardLayout>
      <ReportsScreen />
    </RoleBasedDashboardLayout>
  );
}