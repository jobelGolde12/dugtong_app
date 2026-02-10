import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { USER_ROLES, UserRole } from '../constants/roles.constants';

export const useRoleAccess = () => {
  const { userRole, isAuthenticated, isLoading } = useAuth();

  const hasRole = useCallback((role: UserRole): boolean => {
    return userRole === role;
  }, [userRole]);

  const hasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return roles.includes(userRole as UserRole);
  }, [userRole]);

  const isAdmin = useCallback((): boolean => {
    return userRole === USER_ROLES.ADMIN;
  }, [userRole]);

  const isDonor = useCallback((): boolean => {
    return userRole === USER_ROLES.DONOR;
  }, [userRole]);

  const isHospitalStaff = useCallback((): boolean => {
    return userRole === USER_ROLES.HOSPITAL_STAFF;
  }, [userRole]);

  const isHealthOfficer = useCallback((): boolean => {
    return userRole === USER_ROLES.HEALTH_OFFICER;
  }, [userRole]);

  const canAccessAdminFeatures = useCallback((): boolean => {
    return userRole === USER_ROLES.ADMIN;
  }, [userRole]);

  const canAccessDonorFeatures = useCallback((): boolean => {
    return userRole === USER_ROLES.DONOR;
  }, [userRole]);

  const canAccessHospitalStaffFeatures = useCallback((): boolean => {
    return userRole === USER_ROLES.HOSPITAL_STAFF;
  }, [userRole]);

  const canAccessHealthOfficerFeatures = useCallback((): boolean => {
    return userRole === USER_ROLES.HEALTH_OFFICER;
  }, [userRole]);

  const canAccessDashboard = useCallback((): boolean => {
    return userRole === USER_ROLES.ADMIN || 
           userRole === USER_ROLES.HOSPITAL_STAFF || 
           userRole === USER_ROLES.HEALTH_OFFICER;
  }, [userRole]);

  const canAccessDonorDashboard = useCallback((): boolean => {
    return userRole === USER_ROLES.DONOR;
  }, [userRole]);

  return {
    userRole,
    isAuthenticated,
    isLoading,
    hasRole,
    hasAnyRole,
    isAdmin,
    isDonor,
    isHospitalStaff,
    isHealthOfficer,
    canAccessAdminFeatures,
    canAccessDonorFeatures,
    canAccessHospitalStaffFeatures,
    canAccessHealthOfficerFeatures,
    canAccessDashboard,
    canAccessDonorDashboard,
  };
};