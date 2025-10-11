import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-wrapper">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="header-left">
          <h1>💰 WalletTracker</h1>
          <span class="shop-name">{{ shopName }}</span>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span>👤 {{ currentUser?.name || currentUser?.email || 'Cashier' }}</span>
            <small>{{ currentUser?.role || 'Staff' }}</small>
          </div>
          <button (click)="logout()" class="logout-btn" [disabled]="isLoggingOut">
            {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
          </button>
        </div>
      </header>

      <!-- Navigation Menu -->
      <nav class="nav-menu">
        <button class="nav-item" routerLink="/dashboard" routerLinkActive="active">
          <span class="nav-icon">🏠</span>
          Dashboard
        </button>
        <button class="nav-item" routerLink="/billing" routerLinkActive="active">
          <span class="nav-icon">🛒</span>
          New Sale
        </button>
        <button class="nav-item" routerLink="/inventory" routerLinkActive="active">
          <span class="nav-icon">📦</span>
          Inventory
        </button>
        <button class="nav-item" routerLink="/reports" routerLinkActive="active">
          <span class="nav-icon">📈</span>
          Today's Report
        </button>
        <button class="nav-item" routerLink="/overall-report" routerLinkActive="active">
          <span class="nav-icon">📊</span>
          Overall Report
        </button>
      </nav>

      <!-- Main Content -->
      <main class="dashboard-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrls: ['./layout.css']
})
export class LayoutComponent {
  currentUser: any = null;
  shopName = 'ABC Electronics Store';
  isLoggingOut = false;

  constructor(private authService: AuthService) {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout() {
    this.isLoggingOut = true;
    this.authService.logout();
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  }
}
