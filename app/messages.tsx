import MessagesScreen from './screens/dashboard/MessagesScreen';
import RoleBasedDashboardLayout from './components/RoleBasedDashboardLayout';
import { useRoleAccess } from '../hooks/useRoleAccess';
import { RoleGuard } from './components/RoleGuard';
import { USER_ROLES } from '../constants/roles.constants';
import { View, Text } from 'react-native';

export default function Messages() {
  const { userRole, isAdmin, isLoading: authLoading } = useRoleAccess();

  if (authLoading) {
    return (
      <RoleBasedDashboardLayout>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      </RoleBasedDashboardLayout>
    );
  }

  if (!isAdmin()) {
    return (
      <RoleGuard 
        allowedRoles={[USER_ROLES.ADMIN]} 
        userRole={userRole}
      >
        <View />
      </RoleGuard>
    );
  }

  return (
    <RoleBasedDashboardLayout>
      <MessagesScreen />
    </RoleBasedDashboardLayout>
  );
}
