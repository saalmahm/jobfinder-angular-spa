import { Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-job-search-page',
  template: `<h1>Recherche d'offres</h1>`,
})
export class JobSearchPageComponent {}

export const JOBS_ROUTES: Routes = [
  {
    path: '',
    component: JobSearchPageComponent,
  },
];