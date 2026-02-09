import { Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-job-search-page',
  template: `<h1>app</h1>`,
})
export class ApplicationsPageComponent  {}

export const APPLICATIONS_ROUTES: Routes = [
  {
    path: '',
    component: ApplicationsPageComponent,
  },
];