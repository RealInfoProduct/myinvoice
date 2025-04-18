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
    displayName: 'Product Master',
    iconName: 'brand-asana',
    route: '/master/productmaster',
  },
  {
    displayName: 'Purchase',
    iconName: 'file-invoice',
    route: '/master/purchase',
  },
  {
    displayName: 'Add Shell',
    iconName: 'receipt-tax',
    route: '/master/invoice',
  },  
  {
    displayName: 'Shell List',
    iconName: 'building-store',
    route: '/master/shelllist',
  },
  {
    displayName: 'Invoice List',
    iconName: 'list-details',
    route: '/master/invoicelist',
  },
]