import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { FavoriteOffer } from '../../../core/models/favorite-offer.model';

export const FavoritesActions = createActionGroup({
  source: 'Favorites',
  events: {
    'Load Favorites': props<{ userId: string | number }>(),
    'Load Favorites Success': props<{ favorites: FavoriteOffer[] }>(),
    'Load Favorites Failure': props<{ error: string }>(),

    'Add Favorite': props<{ favorite: Omit<FavoriteOffer, 'id'> }>(),
    'Add Favorite Success': props<{ favorite: FavoriteOffer }>(),
    'Add Favorite Failure': props<{ error: string }>(),

    'Remove Favorite': props<{ id: string | number }>(),
    'Remove Favorite Success': props<{ id: string | number }>(),
    'Remove Favorite Failure': props<{ error: string }>(),

    'Clear Favorites State': emptyProps(),
  },
});
