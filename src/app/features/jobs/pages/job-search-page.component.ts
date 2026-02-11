import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobSearchFormComponent } from '../ui/job-search-form.component';
import { JobSearchCriteria } from '../../../core/models/job-search-criteria.model';

@Component({
  standalone: true,
  selector: 'app-job-search-page',
  imports: [CommonModule, JobSearchFormComponent],
  templateUrl: './job-search-page.component.html',
})
export class JobSearchPageComponent {
  lastSearch: JobSearchCriteria | null = null;

  onSearch(criteria: JobSearchCriteria) {
    this.lastSearch = criteria;
  }
}