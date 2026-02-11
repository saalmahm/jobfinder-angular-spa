import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobSearchCriteria } from '../../../core/models/job-search-criteria.model';

@Component({
  standalone: true,
  selector: 'app-job-search-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './job-search-form.component.html',
})
export class JobSearchFormComponent {
  private fb = inject(FormBuilder);

  @Output() search = new EventEmitter<JobSearchCriteria>();

  businessError = '';

  form = this.fb.group({
    keyword: ['', [Validators.required]],
    location: [''],
  });

  submit(): void {
    this.businessError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const keyword = (this.form.value.keyword || '').trim();
    const location = (this.form.value.location || '').trim();

    if (!keyword) {
      this.businessError = 'Keyword cannot be empty.';
      return;
    }

    this.search.emit({
      keyword,
      location: location || undefined,
    });
  }

  reset(): void {
    this.businessError = '';
    this.form.reset({ keyword: '', location: '' });
  }
}