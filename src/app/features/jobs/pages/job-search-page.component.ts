import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JobSearchFormComponent } from '../ui/job-search-form.component';
import { JobSearchCriteria } from '../../../core/models/job-search-criteria.model';

@Component({
  standalone: true,
  selector: 'app-job-search-page',
  imports: [CommonModule, JobSearchFormComponent],
  template: `
    <div class="min-h-screen bg-slate-50">
      <!-- Zone colorée avec le formulaire centré -->
      <div class="relative bg-gradient-to-r from-sky-200 via-indigo-100 to-amber-100 px-4 py-12 sm:py-16">
        <div class="max-w-4xl mx-auto">
          <div class="text-center mb-6">
            <h1 class="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight">Find jobs</h1>
          </div>
          
          <!-- Formulaire avec hauteur réduite -->
          <div class="bg-white rounded-2xl border border-slate-200 shadow-lg p-5 sm:p-6">
            <app-job-search-form (search)="onSearch($event)"></app-job-search-form>
          </div>
        </div>
      </div>

      <!-- Section des résultats en dessous -->
      <div class="px-4 py-12">
        <div class="max-w-4xl mx-auto">
          <div class="text-sm font-semibold text-slate-900 mb-4">Results</div>
          
          <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <div class="text-sm font-semibold text-slate-900">No results yet</div>

          </div>

          <div *ngIf="lastSearch" class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div class="text-[11px] text-slate-500">Keyword</div>
              <div class="mt-1 text-sm font-semibold text-slate-900">
                {{ lastSearch.keyword }}
              </div>
            </div>
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div class="text-[11px] text-slate-500">Location</div>
              <div class="mt-1 text-sm font-semibold text-slate-900">
                {{ lastSearch.location || '—' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class JobSearchPageComponent {
  lastSearch: JobSearchCriteria | null = null;

  onSearch(criteria: JobSearchCriteria) {
    this.lastSearch = criteria;
  }
}