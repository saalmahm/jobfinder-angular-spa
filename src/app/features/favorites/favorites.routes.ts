import { Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-job-search-page',
  template: `<h1>Favorites Page </h1>`,
})
export class FavoritesPageComponent  {}

export const FAVORITES_ROUTES: Routes = [
  {
    path: '',
    component: FavoritesPageComponent,
  },
];