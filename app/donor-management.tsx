import DonorManagementScreen from './screens/dashboard/DonorManagementScreen';
import RoleBasedDashboardLayout from './components/RoleBasedDashboardLayout';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { RoleGuard } from './components/RoleGuard';
import { USER_ROLES } from '../constants/roles.constants';
import { View, Text } from 'react-native';

export default function DonorManagement() {
  const { userRole, isAdmin, isHospitalStaff, isLoading: authLoading } = useRoleAccess();

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

  // Check if user has permission to access donor management
  if (!isAdmin() && !isHospitalStaff()) {
    return (
      <RoleGuard 
        allowedRoles={[USER_ROLES.ADMIN, USER_ROLES.HOSPITAL_STAFF]} 
        userRole={userRole}
      >
        <View />
      </RoleGuard>
    );
  }

  return (
    <RoleBasedDashboardLayout>
      <DonorManagementScreen />
    </RoleBasedDashboardLayout>
  );
}