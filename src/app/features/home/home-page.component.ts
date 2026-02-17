import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { JobOffer } from '../../core/models/job-offer.model';
import { JobsService } from '../jobs/services/jobs.service';
import { AuthService } from '../../core/services/auth.service';
import { ApplicationsService } from '../applications/services/applications.service';
import { Store } from '@ngrx/store';
import { FavoritesActions } from '../favorites/state/favorites.actions';
import { selectFavoriteOfferIds } from '../favorites/state/favorites.selectors';
import { Observable } from 'rxjs';
import { Application } from '../../core/models/application.model';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent implements OnInit {
  private jobsService = inject(JobsService);
  private authService = inject(AuthService);
  private applicationsService = inject(ApplicationsService);
  private store = inject(Store);
  private fb = inject(FormBuilder);

  searchForm: FormGroup;
  allJobs: JobOffer[] = [];
  displayedJobs: JobOffer[] = [];
  isLoading = false;
  hasSearched = false;
  currentPage = 1;
  itemsPerPage = 6;

  favoriteOfferIds$: Observable<Set<string | number>> = this.store.select(
    selectFavoriteOfferIds,
  );
  applications: Application[] = [];
  applicationOfferIds = new Set<string | number>();

  successMessage = '';
  errorMessage = '';

  constructor() {
    this.searchForm = this.fb.group({
      keyword: [''],
      location: [''],
    });
  }

  ngOnInit(): void {
    this.loadInitialJobs();

    const user = this.authService.getCurrentUser();
    if (user?.id) {
      this.store.dispatch(FavoritesActions.loadFavorites({ userId: user.id }));
      this.loadApplications(user.id);
    }
  }

  loadInitialJobs(): void {
    this.isLoading = true;
    this.jobsService.searchJobs({ keyword: '', location: '' }).subscribe({
      next: (jobs) => {
        this.allJobs = jobs.slice(0, 18); // Limiter à 18 pour la home
        this.updateDisplayedJobs();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading jobs:', err);
        this.isLoading = false;
      },
    });
  }

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

  onSearch(): void {
    const { keyword, location } = this.searchForm.value;

    if (!keyword && !location) {
      this.loadInitialJobs();
      return;
    }

    this.hasSearched = true;
    this.isLoading = true;
    this.currentPage = 1;

    this.jobsService
      .searchJobs({ keyword: keyword || '', location: location || '' })
      .subscribe({
        next: (jobs) => {
          this.allJobs = jobs;
          this.updateDisplayedJobs();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Search error:', err);
          this.isLoading = false;
        },
      });
  }

  updateDisplayedJobs(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.displayedJobs = this.allJobs.slice(
      startIndex,
      startIndex + this.itemsPerPage,
    );
  }

  get totalPages(): number {
    return Math.ceil(this.allJobs.length / this.itemsPerPage);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedJobs();
      window.scrollTo({ top: 600, behavior: 'smooth' });
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isFavorite(job: JobOffer, favoriteIds: Set<string | number>): boolean {
    if (job.id === undefined || job.id === null) return false;
    return Array.from(favoriteIds).some(
      (favId) => String(favId) === String(job.id),
    );
  }

  isTracked(job: JobOffer): boolean {
    if (job.id === undefined || job.id === null) return false;
    return this.applicationOfferIds.has(String(job.id));
  }

  onAddToFavorites(job: JobOffer): void {
    const user = this.authService.getCurrentUser();
    if (!user?.id) {
      this.showErrorMessage(
        'Veuillez vous connecter pour ajouter aux favoris.',
      );
      return;
    }

    const offerId = job.id;
    if (offerId === undefined || offerId === null) return;

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

  onTrackApplication(job: JobOffer): void {
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

    const existing = this.applications.find(
      (app) => String(app.offerId) === String(offerId),
    );
    if (existing) {
      this.showErrorMessage(
        'Cette offre est déjà dans votre suivi de candidatures.',
      );
      return;
    }

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

  openJob(job: JobOffer): void {
    if (!job.sourceUrl) return;
    window.open(job.sourceUrl, '_blank', 'noopener');
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

  trackById(_: number, item: JobOffer): string | number {
    return item.id ?? 0;
  }
}
