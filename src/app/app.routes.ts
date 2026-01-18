import { Routes } from '@angular/router';
import { DashboardPageComponent } from './ui/pages/dashboard/dashboard.page';
import { ImportPageComponent } from './ui/pages/import/import.page';
import { OpportunitiesPageComponent } from './ui/pages/opportunities/opportunities.page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'import' },
  { path: 'import', component: ImportPageComponent, title: 'Import' },
  { path: 'dashboard', component: DashboardPageComponent, title: 'Dashboard' },
  { path: 'opportunities', component: OpportunitiesPageComponent, title: 'Opportunities' },
  { path: '**', redirectTo: 'import' }
];

