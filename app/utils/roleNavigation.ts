import { USER_ROLES, UserRole } from '../../constants/roles.constants';

export const getNavigationItemsForRole = (userRole: UserRole | null) => {
  const baseItems = [
    { label: 'Find Donor', path: '/search', icon: 'search', iconOutline: 'search-outline', allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.HOSPITAL_STAFF, USER_ROLES.HEALTH_OFFICER] },
    { label: 'Reports', path: '/reports', icon: 'bar-chart', iconOutline: 'bar-chart-outline', allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.HEALTH_OFFICER] },
    { label: 'Donor Management', path: '/donor-management', icon: 'people', iconOutline: 'people-outline', allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.HOSPITAL_STAFF] },
    { label: 'Dugtong Bot', path: '/chatbot', icon: 'chatbubbles-outline', iconOutline: 'chatbubbles', allowedRoles: [USER_ROLES.ADMIN] },
    { label: 'Notification', path: '/notifications', icon: 'notifications', iconOutline: 'notifications-outline', allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.HOSPITAL_STAFF, USER_ROLES.HEALTH_OFFICER] },
    { label: 'Settings', path: '/settings', icon: 'settings', iconOutline: 'settings-outline', allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.HOSPITAL_STAFF, USER_ROLES.HEALTH_OFFICER, USER_ROLES.DONOR] },
  ];

  if (!userRole) {
    return [];
  }

  return baseItems.filter(item => item.allowedRoles.includes(userRole));
};

export const canAccessRoute = (route: string, userRole: UserRole | null): boolean => {
  const routePermissions: Record<string, UserRole[]> = {
    '/search': [USER_ROLES.ADMIN, USER_ROLES.HOSPITAL_STAFF, USER_ROLES.HEALTH_OFFICER],
    '/reports': [USER_ROLES.ADMIN, USER_ROLES.HEALTH_OFFICER],
    '/donor-management': [USER_ROLES.ADMIN, USER_ROLES.HOSPITAL_STAFF],
    '/chatbot': [USER_ROLES.ADMIN],
    '/notifications': [USER_ROLES.ADMIN, USER_ROLES.HOSPITAL_STAFF, USER_ROLES.HEALTH_OFFICER],
    '/settings': [USER_ROLES.ADMIN, USER_ROLES.HOSPITAL_STAFF, USER_ROLES.HEALTH_OFFICER, USER_ROLES.DONOR],
    '/DonorDashboard': [USER_ROLES.DONOR],
    '/dashboard': [USER_ROLES.ADMIN, USER_ROLES.HOSPITAL_STAFF, USER_ROLES.HEALTH_OFFICER],
  };

  const allowedRoles = routePermissions[route] || [];
  return userRole ? allowedRoles.includes(userRole) : false;
};