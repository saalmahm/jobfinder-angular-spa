import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobSearchFormComponent } from '../ui/job-search-form.component';
import { JobResultsListComponent } from '../ui/job-results-list.component';
import { JobSearchCriteria } from '../../../core/models/job-search-criteria.model';
import { JobOffer } from '../../../core/models/job-offer.model';
import { JobsService } from '../services/jobs.service';

@Component({
  standalone: true,
  selector: 'app-job-search-page',
  imports: [CommonModule, JobSearchFormComponent, JobResultsListComponent],
  templateUrl: './job-search-page.component.html',
})
export class JobSearchPageComponent {
  private jobsService = inject(JobsService);
  
  lastSearch: JobSearchCriteria | null = null;
  results: JobOffer[] = [];
  isLoading = false;
  currentPage = 1;
  itemsPerPage = 10;

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
    console.log('Add to favorites:', job);
    // TODO: Implement favorites logic in next story
    alert('Added to favorites (Mock)');
  }

  onApplyToJob(job: JobOffer): void {
    console.log('Apply to job:', job);
    // TODO: Implement application tracking logic in next story
    alert('Application tracked (Mock)');
  }
}