import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobResultsListComponent } from '../ui/job-results-list.component';
import { JobSearchCriteria } from '../../../core/models/job-search-criteria.model';
import { JobOffer } from '../../../core/models/job-offer.model';
import { JobsService } from '../services/jobs.service';
import { Store } from '@ngrx/store';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FavoritesActions } from '../../favorites/state/favorites.actions';
import {
  selectFavoriteOfferIds,
  selectFavoritesItems,
} from '../../favorites/state/favorites.selectors';
import { FavoriteOffer } from '../../../core/models/favorite-offer.model';
import { Application } from '../../../core/models/application.model';
import { ApplicationsService } from '../../applications/services/applications.service';
import { Observable } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-job-search-page',
  imports: [CommonModule, ReactiveFormsModule, JobResultsListComponent],
  templateUrl: './job-search-page.component.html',
})
export class JobSearchPageComponent implements OnInit {
  private jobsService = inject(JobsService);
  private store = inject(Store);
  private authService = inject(AuthService);
  private applicationsService = inject(ApplicationsService);
  private fb = inject(FormBuilder);

  lastSearch: JobSearchCriteria | null = null;
  searchForm: FormGroup<{
    keyword: FormControl<string | null>;
    location: FormControl<string | null>;
  }>;
  results: JobOffer[] = [];
  isLoading = false;
  currentPage = 1;
  itemsPerPage = 10;

  favorites: FavoriteOffer[] = [];
  favoriteOfferIds$: Observable<Set<string | number>> = this.store.select(
    selectFavoriteOfferIds,
  );
  emptySet = new Set<string | number>();

  applications: Application[] = [];
  applicationOfferIds = new Set<string | number>();

  successMessage = '';
  errorMessage = '';

  constructor() {
    this.searchForm = this.fb.group({
      keyword: [''],
      location: [''],
    });

    this.store.select(selectFavoritesItems).subscribe((items) => {
      this.favorites = items;
    });

    const user = this.authService.getCurrentUser();
    if (user?.id) {
      this.store.dispatch(FavoritesActions.loadFavorites({ userId: user.id }));
      this.loadApplications(user.id);
    }
  }

  ngOnInit(): void {}

  loadApplications(userId: string | number): void {
    this.applicationsService.getApplicationsByUserId(userId).subscribe({
      next: (apps) => {
        this.applications = apps;
        this.applicationOfferIds = new Set(
          apps.map((app) => String(app.offerId)),
        );
      },
      error: (err) => {
        console.error('Failed to load applications:', err);
      },
    });
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }

  showErrorMessage(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    setTimeout(() => {
      this.errorMessage = '';
    }, 4000);
  }

  onSearch(): void {
    const keyword = String(this.searchForm.value?.keyword ?? '').trim();
    const location = String(this.searchForm.value?.location ?? '').trim();

    const criteria: JobSearchCriteria = {
      keyword,
      location,
    };

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
      },
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
      (f) => String(f.offerId) === String(offerId),
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
      }),
    );
  }

  onApplyToJob(job: JobOffer): void {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.showErrorMessage(
        'Veuillez vous connecter pour suivre une candidature.',
      );
      return;
    }

    const offerId = job.id;
    if (offerId === undefined || offerId === null) {
      this.showErrorMessage(
        'Cette offre ne peut pas être suivie (ID manquant).',
      );
      return;
    }

    // Vérifier si déjà en suivi
    const existing = this.applications.find(
      (app) => String(app.offerId) === String(offerId),
    );

    if (existing) {
      this.showErrorMessage(
        'Cette offre est déjà dans votre suivi de candidatures.',
      );
      return;
    }

    // Créer une nouvelle candidature
    const newApplication: Omit<Application, 'id'> = {
      userId: user.id,
      offerId: offerId,
      apiSource: 'themuse',
      title: job.title,
      company: job.company,
      location: job.location,
      url: job.sourceUrl,
      status: 'en_attente',
      notes: '',
      dateAdded: new Date().toISOString(),
    };

    this.applicationsService.createApplication(newApplication).subscribe({
      next: (created) => {
        this.applications.push(created);
        this.applicationOfferIds.add(String(created.offerId));
        this.showSuccessMessage('Candidature ajoutée au suivi avec succès !');
      },
      error: (err) => {
        this.showErrorMessage(
          err.message || "Erreur lors de l'ajout de la candidature.",
        );
      },
    });
  }

  isFavorite(job: JobOffer): boolean {
    const offerId = job.id;
    if (offerId === undefined || offerId === null) return false;
    return this.favorites.some((f) => String(f.offerId) === String(offerId));
  }
}
