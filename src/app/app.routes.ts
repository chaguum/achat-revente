import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'operations/open' },
  {
    path: 'operations/open',
    loadComponent: () =>
      import('./ui/pages/open-operations/open-operations.page').then(
        (module) => module.OpenOperationsPageComponent
      ),
    title: 'Operations ouvertes'
  },
  {
    path: 'operations/sold',
    loadComponent: () =>
      import('./ui/pages/sold-operations/sold-operations.page').then(
        (module) => module.SoldOperationsPageComponent
      ),
    title: 'Operations vendues'
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./ui/pages/analytics/analytics.page').then(
        (module) => module.AnalyticsPageComponent
      ),
    title: 'Analyse'
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./ui/pages/settings/settings.page').then(
        (module) => module.SettingsPageComponent
      ),
    title: 'Parametres'
  },
  { path: '**', redirectTo: 'operations/open' }
];