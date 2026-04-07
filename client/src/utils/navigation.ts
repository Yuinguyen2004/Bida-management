import type { User } from '../services/authService';

export type UserRole = User['role'];

export type AppPage =
  | 'dashboard'
  | 'table-management'
  | 'fb-management'
  | 'revenue-reports'
  | 'customers'
  | 'staff-tables'
  | 'staff-menu'
  | 'my-profile'
  | 'notifications';

export interface NavigationItem {
  id: AppPage;
  label: string;
}

const navigationByRole: Record<UserRole, NavigationItem[]> = {
  admin: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'table-management', label: 'Table Management' },
    { id: 'fb-management', label: 'F&B Management' },
    { id: 'customers', label: 'Customer CRM' },
    { id: 'revenue-reports', label: 'Revenue Reports' },
  ],
  staff: [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'staff-tables', label: 'Table Service' },
    { id: 'staff-menu', label: 'Service Menu' },
    { id: 'customers', label: 'Customer CRM' },
  ],
};

export const getNavigationItems = (role: UserRole): NavigationItem[] => navigationByRole[role];

export const getDefaultPageForRole = (_role: UserRole): AppPage => 'dashboard';

const sharedUtilityPages: AppPage[] = ['my-profile', 'notifications'];

export const isPageAllowedForRole = (role: UserRole, page: string): page is AppPage =>
  navigationByRole[role].some((item) => item.id === page) || sharedUtilityPages.includes(page as AppPage);
