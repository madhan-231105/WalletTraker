// home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <header class="header">
        <h1>Welcome to Home Page!</h1>
        <div class="user-info" *ngIf="currentUser">
          <span>Hello, {{ currentUser.name || currentUser.email }}!</span>
        </div>
        <button (click)="logout()" class="logout-btn" [disabled]="isLoggingOut">
          {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
        </button>
      </header>
      <main class="main-content">
        <div class="welcome-card">
          <h2>Dashboard</h2>
          <p>You have successfully logged in.</p>
          <p>Current time: {{ currentTime | date:'medium' }}</p>
          
          <div class="stats-grid">
            <div class="stat-card">
              <h3>Login Status</h3>
              <p class="status-active">Active</p>
            </div>
            <div class="stat-card">
              <h3>Session</h3>
              <p>{{ getSessionDuration() }}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      min-height: 100vh;
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
      padding: 20px 0;
      border-bottom: 2px solid #eee;
    }
    
    .header h1 {
      color: #333;
      margin: 0;
      font-size: 28px;
    }
    
    .user-info {
      color: #666;
      font-size: 16px;
    }
    
    .logout-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background-color 0.2s;
    }
    
    .logout-btn:hover:not(:disabled) {
      background: #c82333;
    }
    
    .logout-btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
    
    .main-content {
      display: flex;
      justify-content: center;
    }
    
    .welcome-card {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      max-width: 600px;
      width: 100%;
    }
    
    .welcome-card h2 {
      color: #333;
      margin-bottom: 20px;
      font-size: 24px;
    }
    
    .welcome-card p {
      font-size: 16px;
      margin-bottom: 15px;
      color: #666;
      line-height: 1.5;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 30px;
    }
    
    .stat-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #dee2e6;
    }
    
    .stat-card h3 {
      margin: 0 0 10px 0;
      color: #495057;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .stat-card p {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }
    
    .status-active {
      color: #28a745 !important;
    }
    
    @media (max-width: 768px) {
      .header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .welcome-card {
        padding: 20px;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  currentTime = new Date();
  currentUser: any = null;
  isLoggingOut = false;
  private loginTime = new Date();

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    // Update time every second
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  logout() {
    this.isLoggingOut = true;
    
    // Call the logout method from AuthService
    this.authService.logout();
    
    // Navigate to login page
    setTimeout(() => {
      this.router.navigate(['/login']).then(() => {
        this.isLoggingOut = false;
      });
    }, 500); // Small delay for better UX
  }

  getSessionDuration(): string {
    const now = new Date();
    const diff = now.getTime() - this.loginTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  }
}