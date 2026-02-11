import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { FavoriteOffer } from '../../../core/models/favorite-offer.model';
import { FavoritesActions } from './favorites.actions';

@Injectable()
export class FavoritesEffects {
  private actions$ = inject(Actions);
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:3000/favoritesOffers';

  loadFavorites$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.loadFavorites),
      mergeMap(({ userId }) =>
        this.http.get<FavoriteOffer[]>(`${this.apiUrl}?userId=${encodeURIComponent(String(userId))}`).pipe(
          map((favorites) => FavoritesActions.loadFavoritesSuccess({ favorites })),
          catchError((err) =>
            of(
              FavoritesActions.loadFavoritesFailure({
                error:
                  err?.status === 0
                    ? 'JSON Server non démarré (http://localhost:3000). Lance json-server puis recharge la page.'
                    : err?.message || 'Failed to load favorites.',
              })
            )
          )
        )
      )
    )
  );

  addFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.addFavorite),
      mergeMap(({ favorite }) =>
        this.http.post<FavoriteOffer>(this.apiUrl, favorite).pipe(
          map((created) => FavoritesActions.addFavoriteSuccess({ favorite: created })),
          catchError((err) =>
            of(
              FavoritesActions.addFavoriteFailure({
                error:
                  err?.status === 0
                    ? 'JSON Server non démarré (http://localhost:3000). Impossible d\'ajouter aux favoris.'
                    : err?.message || 'Failed to add favorite.',
              })
            )
          )
        )
      )
    )
  );

  removeFavorite$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FavoritesActions.removeFavorite),
      mergeMap(({ id }) =>
        this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
          map(() => FavoritesActions.removeFavoriteSuccess({ id })),
          catchError((err) =>
            of(
              FavoritesActions.removeFavoriteFailure({
                error:
                  err?.status === 0
                    ? 'JSON Server non démarré (http://localhost:3000). Impossible de retirer le favori.'
                    : err?.message || 'Failed to remove favorite.',
              })
            )
          )
        )
      )
    )
  );
}
