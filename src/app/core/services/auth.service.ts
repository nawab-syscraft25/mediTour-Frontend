import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { ApiResponse, User } from '../../shared/interfaces/api.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private apiService: ApiService) {
    this.loadStoredUser();
  }

  login(email: string, password: string): Observable<ApiResponse<{ token: string; user: User }>> {
    return this.apiService.post<ApiResponse<{ token: string; user: User }>>('/auth/login', { email, password })
      .pipe(
        tap(response => {
          if (response.success) {
            localStorage.setItem(this.TOKEN_KEY, response.data.token);
            this.currentUserSubject.next(response.data.user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private loadStoredUser(): void {
    const token = this.getToken();
    if (token) {
      // You might want to validate the token with the backend
      this.apiService.get<ApiResponse<User>>('/auth/me').subscribe({
        next: (response) => {
          if (response.success) {
            this.currentUserSubject.next(response.data);
          }
        },
        error: () => this.logout()
      });
    }
  }
}