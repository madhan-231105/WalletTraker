import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { email, password } = this.loginForm.value;
      
      this.authService.login(email, password).subscribe({
        next: (response) => {
          console.log('Login successful', response);
          this.handleSuccessfulLogin();
        },
        error: (error) => {
          console.error('Login failed', error);
          this.isLoading = false;
          // Handle error (show user feedback)
        }
      });
    } else {
      console.log('Form is invalid:', this.loginForm.errors);
      this.markFormGroupTouched();
    }
  }

  loginWithGoogle() {
    this.isLoading = true;
    this.authService.googleSignIn().subscribe({
      next: (response) => {
        console.log('Google login successful', response);
        this.handleSuccessfulLogin();
      },
      error: (error) => {
        console.error('Google login failed', error);
        this.isLoading = false;
      }
    });
  }

  loginWithGithub() {
    this.isLoading = true;
    this.authService.githubSignIn().subscribe({
      next: (response) => {
        console.log('GitHub login successful', response);
        this.handleSuccessfulLogin();
      },
      error: (error) => {
        console.error('GitHub login failed', error);
        this.isLoading = false;
      }
    });
  }

  private handleSuccessfulLogin() {
    // Small delay to ensure any auth tokens are properly set
    setTimeout(() => {
      console.log('Current URL before navigation:', this.router.url);
      console.log('Attempting to navigate to /home');
      
      this.router.navigate(['/home'], { replaceUrl: true }).then(
        (navigationSuccess) => {
          console.log('Navigation successful:', navigationSuccess);
          console.log('Current URL after navigation:', this.router.url);
          this.isLoading = false;
        }
      ).catch((error) => {
        console.error('Navigation error:', error);
        this.isLoading = false;
        // Fallback navigation
        window.location.href = '/home';
      });
    }, 100);
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(field => {
      const control = this.loginForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  // Helper methods for template
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}