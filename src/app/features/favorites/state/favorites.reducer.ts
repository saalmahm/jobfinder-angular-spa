import { createReducer, on } from '@ngrx/store';
import { FavoriteOffer } from '../../../core/models/favorite-offer.model';
import { FavoritesActions } from './favorites.actions';

export const favoritesFeatureKey = 'favorites';

export interface FavoritesState {
  items: FavoriteOffer[];
  isLoading: boolean;
  error: string | null;
}

export const initialState: FavoritesState = {
  items: [],
  isLoading: false,
  error: null,
};

export const favoritesReducer = createReducer(
  initialState,

  on(FavoritesActions.loadFavorites, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(FavoritesActions.loadFavoritesSuccess, (state, { favorites }) => ({
    ...state,
    items: favorites,
    isLoading: false,
  })),
  on(FavoritesActions.loadFavoritesFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(FavoritesActions.addFavorite, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(FavoritesActions.addFavoriteSuccess, (state, { favorite }) => ({
    ...state,
    items: [favorite, ...state.items],
    isLoading: false,
  })),
  on(FavoritesActions.addFavoriteFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(FavoritesActions.removeFavorite, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),
  on(FavoritesActions.removeFavoriteSuccess, (state, { id }) => ({
    ...state,
    items: state.items.filter((x) => x.id !== id),
    isLoading: false,
  })),
  on(FavoritesActions.removeFavoriteFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(FavoritesActions.clearFavoritesState, () => initialState)
);
