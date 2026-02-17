import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthService } from '../../core/services/auth.service';
import { FavoriteOffer } from '../../core/models/favorite-offer.model';
import { FavoritesActions } from './state/favorites.actions';
import { selectFavoritesError, selectFavoritesItems, selectFavoritesLoading } from './state/favorites.selectors';

@Component({
  standalone: true,
  selector: 'app-favorites-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites-page.component.html',
})
export class FavoritesPageComponent implements OnInit {
  private store = inject(Store);
  private authService = inject(AuthService);

  favorites$ = this.store.select(selectFavoritesItems);
  isLoading$ = this.store.select(selectFavoritesLoading);
  error$ = this.store.select(selectFavoritesError);

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.store.dispatch(FavoritesActions.clearFavoritesState());
      return;
    }

    this.store.dispatch(FavoritesActions.loadFavorites({ userId: user.id }));
  }

  trackById(_: number, item: FavoriteOffer): string | number {
    return item.id ?? item.offerId;
  }

  remove(item: FavoriteOffer): void {
    if (!item.id) return;
    this.store.dispatch(FavoritesActions.removeFavorite({ id: item.id }));
  }
}
