import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobSearchFormComponent } from '../ui/job-search-form.component';
import { JobSearchCriteria } from '../../../core/models/job-search-criteria.model';
import { JobOffer } from '../../../core/models/job-offer.model';
import { JobsService } from '../services/jobs.service';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesActions } from '../../favorites/state/favorites.actions';
import { selectFavoritesItems } from '../../favorites/state/favorites.selectors';
import { FavoriteOffer } from '../../../core/models/favorite-offer.model';

@Component({
  standalone: true,
  selector: 'app-job-search-page',
  imports: [CommonModule, JobSearchFormComponent],
  templateUrl: './job-search-page.component.html',
})
export class JobSearchPageComponent implements OnInit {
  private jobsService = inject(JobsService);
  private store = inject(Store);
  private authService = inject(AuthService);

  lastSearch: JobSearchCriteria | null = null;
  results: JobOffer[] = [];
  isLoading = false;

  favorites: FavoriteOffer[] = [];

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

  isFavorite(job: JobOffer): boolean {
    const offerId = job.id;
    if (offerId === undefined || offerId === null) return false;
    return this.favorites.some((f) => String(f.offerId) === String(offerId));
  }

  toggleFavorite(job: JobOffer): void {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      alert('Please log in to use favorites.');
      return;
    }

    const offerId = job.id;
    if (offerId === undefined || offerId === null) return;

    const existing = this.favorites.find((f) => String(f.offerId) === String(offerId));
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

  openJob(job: JobOffer): void {
    if (!job.sourceUrl) return;
    window.open(job.sourceUrl, '_blank', 'noopener');
  }
}