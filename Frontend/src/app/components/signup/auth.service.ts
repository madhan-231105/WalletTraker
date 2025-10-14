import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth'; // ✅ your Express backend
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** 🔹 Register */
  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, { name, email, password }).pipe(
      tap(response => this.setSession(response)),
      catchError(err => throwError(() => err))
    );
  }

  /** 🔹 Login (email/password) */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, { email, password }).pipe(
      tap(response => this.setSession(response)),
      catchError(err => throwError(() => err))
    );
  }

  /** 🔹 Google Sign-in */
  googleSignIn(provider: string, email: string, name: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/social`, { provider, email, name }).pipe(
      tap(response => this.setSession(response)),
      catchError(err => throwError(() => err))
    );
  }

  /** 🔹 GitHub Sign-in */
  githubSignIn(provider: string, email: string, name: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/social`, { provider, email, name }).pipe(
      tap(response => this.setSession(response)),
      catchError(err => throwError(() => err))
    );
  }

  /** 🔹 Logout */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticatedSubject.next(false);
  }

  /** 🔹 Get token */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /** 🔹 Get current user */
  getCurrentUser(): any {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /** 🔹 Check auth */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /** 🔹 Helpers */
  private setSession(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.isAuthenticatedSubject.next(true);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}