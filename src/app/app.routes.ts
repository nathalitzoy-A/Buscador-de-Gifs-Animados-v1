import { Routes } from '@angular/router';
import { ErrorPageComponent } from './shared/pages/error-page/error-page.component';

export const routes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./gifs/pages/dashboard-page/dashboard-page.component').then(
        (m) => m.default
      ),

    children: [
      {
        path: 'trending',
        loadComponent: () =>
          import('./gifs/pages/trending-page/trending-page.component').then(
            (m) => m.default
          ),
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./gifs/pages/search-page/search-page.component').then(
            (m) => m.default
          ),
      },
      {
        path: 'history/:query',
        loadComponent: () =>
          import('./gifs/pages/gif-history/gif-history.component').then(
            (m) => m.default
          ),
      },
      {
        path: '**',
        redirectTo: 'trending',
      },
    ],
  },
  {
    path: 'error',
    component: ErrorPageComponent,
  },

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'error',
  },
];