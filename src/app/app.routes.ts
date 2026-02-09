import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/home/home-page.component').then(m => m.HomePageComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login-page.component').then(m => m.LoginPageComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register-page.component').then(m => m.RegisterPageComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/auth/profile-page.component').then(m => m.ProfilePageComponent),
  },
  {
    path: 'search',
    loadChildren: () =>
      import('./features/jobs/jobs.routes').then(m => m.JOBS_ROUTES),
  },
  {
    path: 'favorites',
    loadChildren: () =>
      import('./features/favorites/favorites.routes').then(m => m.FAVORITES_ROUTES),
  },
  {
    path: 'applications',
    loadChildren: () =>
      import('./features/applications/applications.routes').then(m => m.APPLICATIONS_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];