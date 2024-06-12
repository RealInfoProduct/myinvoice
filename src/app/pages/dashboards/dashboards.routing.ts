import { Routes } from '@angular/router';

// dashboards
import { AppDashboard1Component } from './dashboard1/dashboard1.component';
import { FullComponent } from 'src/app/layouts/full/full.component';
import { BlankComponent } from 'src/app/layouts/blank/blank.component';

export const DashboardsRoutes: Routes = [
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'dashboard1',
        component: AppDashboard1Component,
        data: {
          title: 'Analytical',
          urls: [
            { title: 'Dashboard', url: '/dashboards/dashboard1' },
            { title: 'Analytical' },
          ],
        },
      },
    ],
  },
];
