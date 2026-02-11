import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; 
import { provideState, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { routes } from './app.routes';
import { favoritesFeatureKey, favoritesReducer } from './features/favorites/state/favorites.reducer';
import { FavoritesEffects } from './features/favorites/state/favorites.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(),
    provideStore(),
    provideState(favoritesFeatureKey, favoritesReducer),
    provideEffects(FavoritesEffects),
    provideStoreDevtools({ maxAge: 25 })
  ]
};