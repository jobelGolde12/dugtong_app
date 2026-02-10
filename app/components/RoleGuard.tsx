import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserRole, USER_ROLES } from '../../constants/roles.constants';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
  userRole: UserRole | null;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback,
  userRole 
}) => {
  if (!userRole) {
    return fallback || <UnauthorizedAccess />;
  }

  if (!allowedRoles.includes(userRole)) {
    return fallback || <UnauthorizedAccess />;
  }

  return <>{children}</>;
};

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  userRole: UserRole | null;
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({ children, fallback, userRole }) => {
  return (
    <RoleGuard allowedRoles={[USER_ROLES.ADMIN]} fallback={fallback} userRole={userRole}>
      {children}
    </RoleGuard>
  );
};

interface DonorOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  userRole: UserRole | null;
}

export const DonorOnly: React.FC<DonorOnlyProps> = ({ children, fallback, userRole }) => {
  return (
    <RoleGuard allowedRoles={[USER_ROLES.DONOR]} fallback={fallback} userRole={userRole}>
      {children}
    </RoleGuard>
  );
};

interface HospitalStaffOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  userRole: UserRole | null;
}

export const HospitalStaffOnly: React.FC<HospitalStaffOnlyProps> = ({ children, fallback, userRole }) => {
  return (
    <RoleGuard allowedRoles={[USER_ROLES.HOSPITAL_STAFF]} fallback={fallback} userRole={userRole}>
      {children}
    </RoleGuard>
  );
};

interface HealthOfficerOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  userRole: UserRole | null;
}

export const HealthOfficerOnly: React.FC<HealthOfficerOnlyProps> = ({ children, fallback, userRole }) => {
  return (
    <RoleGuard allowedRoles={[USER_ROLES.HEALTH_OFFICER]} fallback={fallback} userRole={userRole}>
      {children}
    </RoleGuard>
  );
};

const UnauthorizedAccess = () => (
  <View style={styles.unauthorizedContainer}>
    <Text style={styles.unauthorizedTitle}>Access Denied</Text>
    <Text style={styles.unauthorizedMessage}>
      You don&apos;t have permission to access this feature.
    </Text>
  </View>
);

const styles = StyleSheet.create({
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  unauthorizedTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
    textAlign: 'center',
  },
  unauthorizedMessage: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
  },
});