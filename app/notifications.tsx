import NotificationsScreen from './screens/dashboard/NotificationsScreen';
import RoleBasedDashboardLayout from './components/RoleBasedDashboardLayout';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { RoleGuard } from './components/RoleGuard';
import { USER_ROLES } from '../constants/roles.constants';
import { View, Text } from 'react-native';

export default function Notifications() {
  const { userRole, isAdmin, isHospitalStaff, isHealthOfficer, isLoading: authLoading } = useRoleAccess();

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

  // Check if user has permission to access notifications
  if (!isAdmin() && !isHospitalStaff() && !isHealthOfficer()) {
    return (
      <RoleGuard 
        allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.HOSPITAL_STAFF, USER_ROLES.HEALTH_OFFICER]} 
        userRole={userRole}
      >
        <View />
      </RoleGuard>
    );
  }

  return (
    <RoleBasedDashboardLayout>
      <NotificationsScreen />
    </RoleBasedDashboardLayout>
  );
}