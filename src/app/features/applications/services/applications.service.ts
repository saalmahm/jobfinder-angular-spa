import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, throwError } from 'rxjs';
import { Application } from '../../../core/models/application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationsService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/applications';

  /**
   * Récupère toutes les candidatures d'un utilisateur
   */
  getApplicationsByUserId(userId: string | number): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}?userId=${encodeURIComponent(String(userId))}`);
  }

  /**
   * Récupère une candidature par son ID
   */
  getApplicationById(id: string | number): Observable<Application> {
    return this.http.get<Application>(`${this.apiUrl}/${id}`);
  }

  /**
   * Vérifie si une candidature existe déjà pour un utilisateur et une offre donnés
   */
  checkDuplicate(userId: string | number, offerId: string | number): Observable<Application | null> {
    return this.http.get<Application[]>(
      `${this.apiUrl}?userId=${encodeURIComponent(String(userId))}&offerId=${encodeURIComponent(String(offerId))}`
    ).pipe(
      map(applications => applications.length > 0 ? applications[0] : null)
    );
  }

  /**
   * Crée une nouvelle candidature
   */
  createApplication(application: Omit<Application, 'id'>): Observable<Application> {
    return this.checkDuplicate(application.userId, application.offerId).pipe(
      switchMap(existing => {
        if (existing) {
          return throwError(() => new Error('Cette offre est déjà dans votre suivi de candidatures.'));
        }
        return this.http.post<Application>(this.apiUrl, application);
      })
    );
  }

  /**
   * Met à jour une candidature existante (statut, notes, etc.)
   */
  updateApplication(id: string | number, updates: Partial<Application>): Observable<Application> {
    return this.http.patch<Application>(`${this.apiUrl}/${id}`, updates);
  }

  /**
   * Supprime une candidature
   */
  deleteApplication(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
