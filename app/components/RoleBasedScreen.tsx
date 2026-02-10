import React from 'react';
import { View } from 'react-native';
import { useRoleAccess } from '../../hooks/useRoleAccess';
import { RoleGuard } from './RoleGuard';
import { USER_ROLES } from '../../constants/roles.constants';

interface RoleBasedScreenProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

export const RoleBasedScreen: React.FC<RoleBasedScreenProps> = ({ 
  children, 
  allowedRoles,
  fallback
}) => {
  const { userRole } = useRoleAccess();

  return (
    <RoleGuard 
      allowedRoles={allowedRoles as any} 
      userRole={userRole}
      fallback={fallback}
    >
      {children}
    </RoleGuard>
  );
};

// Specific role screen wrappers
export const AdminScreen: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedScreen 
    allowedRoles={[USER_ROLES.ADMIN]} 
    fallback={fallback}
  >
    {children}
  </RoleBasedScreen>
);

export const DonorScreen: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedScreen 
    allowedRoles={[USER_ROLES.DONOR]} 
    fallback={fallback}
  >
    {children}
  </RoleBasedScreen>
);

export const HospitalStaffScreen: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedScreen 
    allowedRoles={[USER_ROLES.HOSPITAL_STAFF]} 
    fallback={fallback}
  >
    {children}
  </RoleBasedScreen>
);

export const HealthOfficerScreen: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <RoleBasedScreen 
    allowedRoles={[USER_ROLES.HEALTH_OFFICER]} 
    fallback={fallback}
  >
    {children}
  </RoleBasedScreen>
);

export const MultiRoleScreen: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles: string[];
  fallback?: React.ReactNode;
}> = ({ 
  children, 
  allowedRoles,
  fallback 
}) => (
  <RoleBasedScreen 
    allowedRoles={allowedRoles} 
    fallback={fallback}
  >
    {children}
  </RoleBasedScreen>
);