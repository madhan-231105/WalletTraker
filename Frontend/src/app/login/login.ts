// src/app/login/login.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, type LoginResponse } from './auth.service';

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
        next: (response: LoginResponse) => {
          console.log('Login successful', response);
          this.handleSuccessfulLogin();
        },
        error: (error: any) => {
          console.error('Login failed', error);
          this.isLoading = false;
        }
      });
    }
  }

  loginWithGoogle() {
    this.isLoading = true;
    this.authService.googleSignIn().subscribe({
      next: (response: LoginResponse) => {
        console.log('Google login successful', response);
        this.handleSuccessfulLogin();
      },
      error: (error: any) => {
        console.error('Google login failed', error);
        this.isLoading = false;
      }
    });
  }

  loginWithGithub() {
    this.isLoading = true;
    this.authService.githubSignIn().subscribe({
      next: (response: LoginResponse) => {
        console.log('GitHub login successful', response);
        this.handleSuccessfulLogin();
      },
      error: (error: any) => {
        console.error('GitHub login failed', error);
        this.isLoading = false;
      }
    });
  }

  private handleSuccessfulLogin() {
    this.router.navigate(['/dashboard'], { replaceUrl: true });
    this.isLoading = false;
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}
