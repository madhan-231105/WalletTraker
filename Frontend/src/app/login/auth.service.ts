// src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:3000/api/auth'; // ✅ your Express backend
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {}

  /** 🔹 Login (email/password) */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, { email, password }).pipe(
      tap(response => this.setSession(response)),
      catchError(err => throwError(() => err))
    );
  }

  /** 🔹 Google Sign-in */
  googleSignIn(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/google`, {}).pipe(
      tap(response => this.setSession(response)),
      catchError(err => throwError(() => err))
    );
  }

  /** 🔹 GitHub Sign-in */
  githubSignIn(): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/github`, {}).pipe(
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
  private setSession(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.isAuthenticatedSubject.next(true);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}
