// auth.service.ts - Development version with mock API
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, delay } from 'rxjs/operators';

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
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  
  // Track authentication state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Development mode flag - set to false when you have a real backend
  private readonly DEVELOPMENT_MODE = true;

  constructor(private http: HttpClient) {}

  // Login with email and password
  login(email: string, password: string): Observable<LoginResponse> {
    if (this.DEVELOPMENT_MODE) {
      return this.mockLogin(email, password);
    }
    
    // Real API call (use this when you have a backend)
    return this.http.post<LoginResponse>('/api/auth/login', { email, password }).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  // Mock login for development
  private mockLogin(email: string, password: string): Observable<LoginResponse> {
    // Simple validation - accept any email/password combo for demo
    if (!email || !password || password.length < 6) {
      return throwError(() => new Error('Invalid email or password (min 6 chars)'));
    }
    
    // Mock successful response
    const mockResponse: LoginResponse = {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: '123',
        email: email,
        name: email.split('@')[0] // Use email prefix as name
      }
    };
    
    // Simulate API delay and return response
    return of(mockResponse).pipe(
      delay(1000), // 1 second delay to simulate network
      tap(response => {
        this.setSession(response);
      })
    );
  }

  // Google Sign In
  googleSignIn(): Observable<LoginResponse> {
    if (this.DEVELOPMENT_MODE) {
      return this.mockSocialLogin('google');
    }
    
    return this.http.post<LoginResponse>('/api/auth/google', {}).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  // GitHub Sign In
  githubSignIn(): Observable<LoginResponse> {
    if (this.DEVELOPMENT_MODE) {
      return this.mockSocialLogin('github');
    }
    
    return this.http.post<LoginResponse>('/api/auth/github', {}).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  // Mock social login
  private mockSocialLogin(provider: string): Observable<LoginResponse> {
    return of({
      token: `mock-${provider}-token-` + Date.now(),
      user: {
        id: '456',
        email: `user@${provider}-demo.com`,
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`
      }
    }).pipe(
      delay(800),
      tap(response => {
        this.setSession(response);
      })
    );
  }

  // Logout method
  logout(): void {
    // Clear local storage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    
    // Update authentication state
    this.isAuthenticatedSubject.next(false);
    
    console.log('User logged out successfully');
  }

  // Get current token
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Get current user
  getCurrentUser(): any {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  // Private helper methods
  private setSession(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    if (response.user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    }
    this.isAuthenticatedSubject.next(true);
  }

  private hasToken(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token;
  }
}