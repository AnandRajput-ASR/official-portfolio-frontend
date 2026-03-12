import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/portfolio.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'portfolio_admin_token';
  private readonly USER_KEY = 'portfolio_admin_user';
  private loggedIn$ = new BehaviorSubject<boolean>(this.hasValidToken());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.api.baseUrl}/auth/login`, { username, password })
      .pipe(
        tap((res) => {
          localStorage.setItem(this.TOKEN_KEY, res.token);
          localStorage.setItem(this.USER_KEY, res.username);
          this.loggedIn$.next(true);
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.loggedIn$.next(false);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  getUsername(): string {
    return localStorage.getItem(this.USER_KEY) || 'admin';
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }
  isLoggedInSnapshot(): boolean {
    return this.loggedIn$.value;
  }

  changePassword(
    currentPassword: string,
    newPassword: string,
    newUsername?: string,
  ): Observable<AuthResponse> {
    return this.http
      .put<AuthResponse>(`${environment.api.baseUrl}/auth/change-password`, {
        currentPassword,
        newPassword,
        newUsername,
      })
      .pipe(
        tap((res) => {
          if (res.token) {
            localStorage.setItem(this.TOKEN_KEY, res.token);
            localStorage.setItem(this.USER_KEY, res.username);
          }
        }),
      );
  }

  forgotPassword(): Observable<any> {
    return this.http.post(`${environment.api.baseUrl}/auth/forgot-password`, {});
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${environment.api.baseUrl}/auth/reset-password`, { token, newPassword });
  }

  private hasValidToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
