import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobOffer } from '../../../core/models/job-offer.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-job-results-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-results-list.component.html',
})
export class JobResultsListComponent {
  private authService = inject(AuthService);

  @Input() jobs: JobOffer[] = [];
  @Input() totalItems = 0;
  @Input() itemsPerPage = 10;
  @Input() currentPage = 1;
  @Input() favoriteIds: Set<string | number> = new Set();

  @Output() pageChange = new EventEmitter<number>();
  @Output() addToFavorites = new EventEmitter<JobOffer>();
  @Output() applyToJob = new EventEmitter<JobOffer>();

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginatedJobs(): JobOffer[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.jobs.slice(startIndex, startIndex + this.itemsPerPage);
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  isFavorite(job: JobOffer): boolean {
    return job.id !== undefined && this.favoriteIds.has(String(job.id));
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
