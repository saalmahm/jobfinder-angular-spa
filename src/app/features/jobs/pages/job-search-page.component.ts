import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobSearchFormComponent } from '../ui/job-search-form.component';
import { JobSearchCriteria } from '../../../core/models/job-search-criteria.model';
import { JobOffer } from '../../../core/models/job-offer.model';
import { JobsService } from '../services/jobs.service';

@Component({
  standalone: true,
  selector: 'app-job-search-page',
  imports: [CommonModule, JobSearchFormComponent],
  templateUrl: './job-search-page.component.html',
})
export class JobSearchPageComponent {
  private jobsService = inject(JobsService);
  
  lastSearch: JobSearchCriteria | null = null;
  results: JobOffer[] = [];
  isLoading = false;

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
}