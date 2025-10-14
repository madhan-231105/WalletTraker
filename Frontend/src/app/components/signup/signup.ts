import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, AuthResponse } from '../signup/auth.service'
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class SignupComponent {
  signupForm: FormGroup;
  error: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      this.error = 'Please fill in all fields correctly.';
      return;
    }

    this.loading = true;
    this.error = null;

    const { name, email, password } = this.signupForm.value;

    this.authService.register(name, email, password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']); // Redirect to dashboard
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error.message || 'Error registering user';
        this.loading = false;
      },
    });
  }

  // Social sign-in handlers
  googleSignIn(): void {
    this.loading = true;
    this.error = null;

    // In a real app, use Google OAuth SDK to get user data
    const mockGoogleData = { provider: 'google', email: 'user@example.com', name: 'Google User' }; // Replace with actual Google auth
    this.authService.googleSignIn(mockGoogleData.provider, mockGoogleData.email, mockGoogleData.name).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error.message || 'Error with Google sign-in';
        this.loading = false;
      },
    });
  }

  githubSignIn(): void {
    this.loading = true;
    this.error = null;

    // In a real app, use GitHub OAuth SDK to get user data
    const mockGithubData = { provider: 'github', email: 'user@example.com', name: 'GitHub User' }; // Replace with actual GitHub auth
    this.authService.githubSignIn(mockGithubData.provider, mockGithubData.email, mockGithubData.name).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error.message || 'Error with GitHub sign-in';
        this.loading = false;
      },
    });
  }

  // Getter for form controls
  get f() {
    return this.signupForm.controls;
  }
}