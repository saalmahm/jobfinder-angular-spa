import { Routes } from '@angular/router';

export const JOBS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/job-search-page.component').then((m) => m.JobSearchPageComponent),
  },
];