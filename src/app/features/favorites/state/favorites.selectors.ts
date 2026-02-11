import { createFeatureSelector, createSelector } from '@ngrx/store';
import { favoritesFeatureKey, FavoritesState } from './favorites.reducer';

export const selectFavoritesState = createFeatureSelector<FavoritesState>(favoritesFeatureKey);

export const selectFavoritesItems = createSelector(
  selectFavoritesState,
  (state) => state.items
);

export const selectFavoritesLoading = createSelector(
  selectFavoritesState,
  (state) => state.isLoading
);

export const selectFavoritesError = createSelector(
  selectFavoritesState,
  (state) => state.error
);

export const selectFavoriteOfferIds = createSelector(selectFavoritesItems, (items) =>
  new Set(items.map((x) => x.offerId))
);
