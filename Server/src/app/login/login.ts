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
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        console.log('Current URL before navigation:', this.router.url);
        console.log('Attempting to navigate to /home');
        
        this.router.navigate(['/home']).then(
          (navigationSuccess) => {
            console.log('Navigation successful:', navigationSuccess);
            console.log('Current URL after navigation:', this.router.url);
          },
          (navigationError) => {
            console.error('Navigation failed:', navigationError);
          }
        ).catch((error) => {
          console.error('Navigation promise error:', error);
        });
      },
      error: (error) => console.error('Login failed', error)
    });
  } else {
    console.log('Form is invalid:', this.loginForm.errors);
  }
}

  loginWithGoogle() {
    this.authService.googleSignIn().subscribe({
      next: (response) => {
        console.log('Google login successful', response);
        this.router.navigate(['/home']);
      },
      error: (error) => console.error('Google login failed', error)
    });
  }

  loginWithGithub() {
    this.authService.githubSignIn().subscribe({
      next: (response) => {
        console.log('GitHub login successful', response);
        this.router.navigate(['/home']);
      },
      error: (error) => console.error('GitHub login failed', error)
    });
  }
}
