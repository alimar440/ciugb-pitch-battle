import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/public/home-page/home-page').then(
        (module) => module.HomePage,
      ),
  },
  {
    path: 'finalistes',
    loadComponent: () =>
      import('./features/public/finalists-page/finalists-page').then(
        (module) => module.FinalistsPage,
      ),
  },
  {
    path: 'postuler',
    loadComponent: () =>
      import('./features/registration/application-page/application-page').then(
        (module) => module.ApplicationPage,
      ),
  },
  {
    path: '404',
    loadComponent: () =>
      import('./features/public/not-found-page/not-found-page').then(
        (module) => module.NotFoundPage,
      ),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/public/not-found-page/not-found-page').then(
        (module) => module.NotFoundPage,
      ),
  },
];
