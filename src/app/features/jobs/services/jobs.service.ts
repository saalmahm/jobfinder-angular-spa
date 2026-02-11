import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { JobOffer } from '../../../core/models/job-offer.model';
import { JobSearchCriteria } from '../../../core/models/job-search-criteria.model';

type TheMuseJob = {
  id: number;
  name: string;
  contents: string;
  publication_date: string;
  locations?: Array<{ name: string }>;
  company?: { name: string };
  refs?: {
    landing_page?: string;
  };
};

type TheMuseJobsResponse = {
  results: TheMuseJob[];
};

@Injectable({
  providedIn: 'root'
})
export class JobsService {
  private http = inject(HttpClient);
  private apiUrl = 'https://www.themuse.com/api/public/jobs';

  searchJobs(criteria: JobSearchCriteria): Observable<JobOffer[]> {
    const { keyword, location } = criteria;

    const params: Record<string, string> = {
      page: '0',
      descending: 'true',
    };

    if (location) {
      params['location'] = location;
    }

    return this.http.get<TheMuseJobsResponse>(this.apiUrl, { params }).pipe(
      map((res) => {
        const results = res?.results || [];

        const filteredByLocation = location
          ? results.filter((j) =>
              j.locations?.some((loc) =>
                loc.name.toLowerCase().includes(location.toLowerCase())
              )
            )
          : results;

        const mapped: JobOffer[] = filteredByLocation.map((j) => ({
          id: j.id,
          title: j.name,
          company: j.company?.name || '—',
          location: j.locations?.[0]?.name || '—',
          date: j.publication_date,
          description: j.contents,
          sourceUrl: j.refs?.landing_page,
        }));

        // Filtrer par titre (mot clé dans le titre uniquement)
        const normalizedKeyword = (keyword || '').trim().toLowerCase();
        const filtered = normalizedKeyword
          ? mapped.filter((job) => job.title.toLowerCase().includes(normalizedKeyword))
          : mapped;

        // Trier par date (plus récent -> plus ancien)
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      })
    );
  }
}
