export const USER_ROLES = {
  ADMIN: 'admin',
  DONOR: 'donor',
  HOSPITAL_STAFF: 'hospital_staff',
  HEALTH_OFFICER: 'health_officer',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_DISPLAY_NAMES = {
  [USER_ROLES.ADMIN]: 'Administrator',
  [USER_ROLES.DONOR]: 'Donor',
  [USER_ROLES.HOSPITAL_STAFF]: 'Hospital Staff',
  [USER_ROLES.HEALTH_OFFICER]: 'Health Officer',
} as const;

export const DEFAULT_ROLE = USER_ROLES.DONOR;

export const VALID_ROLES = Object.values(USER_ROLES) as readonly UserRole[];