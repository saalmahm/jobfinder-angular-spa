import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobSearchFormComponent } from '../ui/job-search-form.component';
import { JobResultsListComponent } from '../ui/job-results-list.component';
import { JobSearchCriteria } from '../../../core/models/job-search-criteria.model';
import { JobOffer } from '../../../core/models/job-offer.model';
import { JobsService } from '../services/jobs.service';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesActions } from '../../favorites/state/favorites.actions';
import { selectFavoriteOfferIds, selectFavoritesItems } from '../../favorites/state/favorites.selectors';
import { FavoriteOffer } from '../../../core/models/favorite-offer.model';
import { map, Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-job-search-page',
  imports: [CommonModule, JobSearchFormComponent, JobResultsListComponent],
  templateUrl: './job-search-page.component.html',
})
export class JobSearchPageComponent implements OnInit {
  private jobsService = inject(JobsService);
  private store = inject(Store);
  private authService = inject(AuthService);

  lastSearch: JobSearchCriteria | null = null;
  results: JobOffer[] = [];
  isLoading = false;
  currentPage = 1;
  itemsPerPage = 10;

  favorites: FavoriteOffer[] = [];
  favoriteOfferIds$: Observable<Set<string | number>> = this.store.select(selectFavoriteOfferIds);
  emptySet = new Set<string | number>();

  constructor() {
    this.store.select(selectFavoritesItems).subscribe((items) => {
      this.favorites = items;
    });

    const user = this.authService.getCurrentUser();
    if (user?.id) {
      this.store.dispatch(FavoritesActions.loadFavorites({ userId: user.id }));
    }
  }

  ngOnInit(): void {}

  onSearch(criteria: JobSearchCriteria) {
    this.lastSearch = criteria;
    this.isLoading = true;
    this.results = [];
    this.currentPage = 1;

    this.jobsService.searchJobs(criteria).subscribe({
      next: (data) => {
        this.results = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Search error:', err);
        this.isLoading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onAddToFavorites(job: JobOffer): void {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      alert('Please log in to use favorites.');
      return;
    }

    const offerId = job.id;
    if (offerId === undefined || offerId === null) return;

    const existing = this.favorites.find(
      (f) => String(f.offerId) === String(offerId)
    );
    
    if (existing?.id !== undefined && existing?.id !== null) {
      this.store.dispatch(FavoritesActions.removeFavorite({ id: existing.id }));
      return;
    }

    this.store.dispatch(
      FavoritesActions.addFavorite({
        favorite: {
          userId: user.id,
          offerId: offerId,
          title: job.title,
          company: job.company,
          location: job.location,
          date: job.date,
          sourceUrl: job.sourceUrl,
        },
      })
    );
  }

  onApplyToJob(job: JobOffer): void {
    console.log('Apply to job:', job);
    // TODO: Implement application tracking logic in next story
    alert('Application tracked (Mock)');
  }

  isFavorite(job: JobOffer): boolean {
    const offerId = job.id;
    if (offerId === undefined || offerId === null) return false;
    return this.favorites.some((f) => String(f.offerId) === String(offerId));
  }
}