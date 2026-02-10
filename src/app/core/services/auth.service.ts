import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, throwError, tap } from 'rxjs';
import { User } from '../models/user.model';

type StorageMode = 'session' | 'local';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/users';

  private readonly STORAGE_KEY = 'jobfinder_user';

  register(user: User): Observable<User> {
    return this.getUserByEmail(user.email).pipe(
      switchMap(existingUser => {
        if (existingUser) {
          return throwError(() => new Error('Cet email est déjà utilisé.'));
        }
        return this.http.post<User>(this.apiUrl, user);
      })
    );
  }

  getUserByEmail(email: string): Observable<User | null> {
    return this.http.get<User[]>(`${this.apiUrl}?email=${encodeURIComponent(email)}`).pipe(
      map(users => (users.length > 0 ? users[0] : null))
    );
  }

  login(email: string, password: string, mode: StorageMode): Observable<Omit<User, 'password'>> {
    return this.http
      .get<User[]>(`${this.apiUrl}?email=${encodeURIComponent(email)}`)
      .pipe(
        switchMap((users) => {
          const user = users[0];
          if (!user) {
            return throwError(() => new Error('Email ou mot de passe incorrect.'));
          }
          if (user.password !== password) {
            return throwError(() => new Error('Email ou mot de passe incorrect.'));
          }

          const { password: _, ...safeUser } = user;

          this.setCurrentUser(safeUser, mode);
          return new Observable<Omit<User, 'password'>>((subscriber) => {
            subscriber.next(safeUser);
            subscriber.complete();
          });
        })
      );
  }

  logout(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getCurrentUser(): Omit<User, 'password'> | null {
    const fromSession = sessionStorage.getItem(this.STORAGE_KEY);
    if (fromSession) return JSON.parse(fromSession);

    const fromLocal = localStorage.getItem(this.STORAGE_KEY);
    if (fromLocal) return JSON.parse(fromLocal);

    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  private setCurrentUser(user: Omit<User, 'password'>, mode: StorageMode): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.STORAGE_KEY);

    const target = mode === 'local' ? localStorage : sessionStorage;
    target.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  /**
   * Met à jour les informations de l'utilisateur
   */
  updateUser(id: string | number, userData: Partial<User>): Observable<Omit<User, 'password'>> {
    return this.http.patch<User>(`${this.apiUrl}/${id}`, userData).pipe(
      map(user => {
        const { password, ...safeUser } = user;
        const mode: StorageMode = localStorage.getItem(this.STORAGE_KEY) ? 'local' : 'session';
        this.setCurrentUser(safeUser, mode);
        return safeUser;
      })
    );
  }

  /**
   * Supprime le compte utilisateur
   */
  deleteUser(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.logout())
    );
  }
}