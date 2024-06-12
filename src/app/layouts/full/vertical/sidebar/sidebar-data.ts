import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Dashboard',
    iconName: 'aperture',
    route: '/dashboards/dashboard1',
  },
  {
    navCap: 'Master',
  },
  {
    displayName: 'Party Master',
    iconName: 'user-circle',
    route: '/master/partymaster',
  },
  {
    displayName: 'Firm Master',
    iconName: 'note',
    route: '/master/firmmaster',
  },
  {
    displayName: 'Product Master',
    iconName: 'message-2',
    route: '/master/productmaster',
  },
]