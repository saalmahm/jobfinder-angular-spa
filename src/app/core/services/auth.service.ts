import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, throwError } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/users';

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
    return this.http.get<User[]>(`${this.apiUrl}?email=${email}`).pipe(
      map(users => users.length > 0 ? users[0] : null)
    );
  }
}