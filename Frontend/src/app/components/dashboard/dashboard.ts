// dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../login/auth.service';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-wrapper">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-overlay">
        <div class="spinner"></div>
        <p>Loading dashboard...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="error-message">
        <span class="error-icon">⚠️</span>
        <p>{{ error }}</p>
        <button (click)="loadDashboardData()" class="retry-btn">Retry</button>
      </div>

      <!-- Main Content -->
      <main class="dashboard-main" *ngIf="!isLoading && !error">
        <!-- Quick Stats Grid -->
        <section class="stats-section">
          <div class="stat-card today-sales">
            <div class="stat-header">
              <span class="stat-icon">💰</span>
              <div>
                <h3>Today's Sales</h3>
                <p class="stat-value">₹{{ todaySales | number:'1.2-2' }}</p>
              </div>
            </div>
            <div class="stat-footer">
              <span class="growth-indicator" [ngClass]="salesGrowth >= 0 ? 'positive' : 'negative'">
                {{ salesGrowth >= 0 ? '+' : '' }}{{ salesGrowth }}%
              </span>
              <small>from yesterday</small>
            </div>
          </div>

          <div class="stat-card transactions">
            <div class="stat-header">
              <span class="stat-icon">🧾</span>
              <div>
                <h3>Transactions</h3>
                <p class="stat-value">{{ todayTransactions }}</p>
              </div>
            </div>
            <div class="stat-footer">
              <small>Avg: ₹{{ avgTransactionValue | number:'1.0-0' }}</small>
            </div>
          </div>

          <div class="stat-card stock-alert" [ngClass]="{'alert': lowStockCount > 0}">
            <div class="stat-header">
              <span class="stat-icon">⚠️</span>
              <div>
                <h3>Low Stock</h3>
                <p class="stat-value">{{ lowStockCount }}</p>
              </div>
            </div>
            <div class="stat-footer">
              <small>{{ lowStockCount > 0 ? 'Items need attention' : 'All items stocked' }}</small>
            </div>
          </div>

          <div class="stat-card payment-summary">
            <div class="stat-header">
              <span class="stat-icon">💳</span>
              <div>
                <h3>Payment Mix</h3>
                <div class="payment-breakdown">
                  <div class="payment-item">
                    <span class="method cash">Cash</span>
                    <span>₹{{ paymentBreakdown.cash | number:'1.0-0' }}</span>
                  </div>
                  <div class="payment-item">
                    <span class="method upi">UPI</span>
                    <span>₹{{ paymentBreakdown.upi | number:'1.0-0' }}</span>
                  </div>
                  <div class="payment-item">
                    <span class="method card">Card</span>
                    <span>₹{{ paymentBreakdown.card | number:'1.0-0' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="action-grid">
            <button class="action-card primary" routerLink="/billing">
              <span class="action-icon">🛒</span>
              <div class="action-content">
                <h4>Create Bill</h4>
                <p>Start new transaction</p>
              </div>
            </button>

            <button class="action-card" routerLink="/inventory">
              <span class="action-icon">➕</span>
              <div class="action-content">
                <h4>Add Product</h4>
                <p>Manage inventory</p>
              </div>
            </button>

            <button class="action-card" (click)="showTodayReport()">
              <span class="action-icon">📈</span>
              <div class="action-content">
                <h4>Today's Report</h4>
                <p>View daily summary</p>
              </div>
            </button>

            <button class="action-card" (click)="showOverallReport()">
              <span class="action-icon">📊</span>
              <div class="action-content">
                <h4>Overall Report</h4>
                <p>Show the report for overall Sales</p>
              </div>
            </button>
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="recent-activity">
          <div class="activity-column">
            <div class="section-header">
              <h3>🏆 Top Selling Today</h3>
              <button class="refresh-btn" (click)="loadDashboardData()" [disabled]="isRefreshing">
                {{ isRefreshing ? '↻' : '🔄' }}
              </button>
            </div>
            <div class="activity-list">
              <div *ngIf="topSellingItems.length === 0" class="empty-state">
                <p>No sales today yet</p>
              </div>
              <div class="activity-item" *ngFor="let item of topSellingItems; let i = index">
                <div class="item-rank">{{ i + 1 }}</div>
                <div class="item-details">
                  <strong>{{ item.name }}</strong>
                  <small>{{ item.category }}</small>
                </div>
                <div class="item-stats">
                  <span class="quantity">{{ item.soldQuantity }} sold</span>
                  <span class="revenue">₹{{ item.revenue | number:'1.0-0' }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="activity-column">
            <div class="section-header">
              <h3>🕒 Recent Transactions</h3>
            </div>
            <div class="activity-list">
              <div *ngIf="recentTransactions.length === 0" class="empty-state">
                <p>No transactions yet</p>
              </div>
              <div class="activity-item" *ngFor="let transaction of recentTransactions">
                <div class="transaction-details">
                  <strong>Bill #{{ transaction.billNumber }}</strong>
                  <small>{{ transaction.time | date:'short' }}</small>
                </div>
                <div class="transaction-amount">
                  <span class="amount">₹{{ transaction.amount | number:'1.2-2' }}</span>
                  <span class="payment-badge" [ngClass]="transaction.paymentMethod">
                    {{ transaction.paymentMethod.toUpperCase() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  currentUser: any = null;
  isLoading = true;
  isRefreshing = false;
  error: string | null = null;

  // Dashboard data
  todaySales = 0;
  salesGrowth = 0;
  todayTransactions = 0;
  avgTransactionValue = 0;
  lowStockCount = 0;

  paymentBreakdown = {
    cash: 0,
    upi: 0,
    card: 0
  };

  topSellingItems: any[] = [];
  recentTransactions: any[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    this.isRefreshing = true;
    this.error = null;

    // Using the complete endpoint for efficiency (single API call)
    this.dashboardService.getCompleteDashboard().subscribe({
      next: (response) => {
        if (response.success) {
          const { stats, topSellingItems, recentTransactions } = response.data;
          
          // Update stats
          this.todaySales = stats.todaySales;
          this.salesGrowth = stats.salesGrowth;
          this.todayTransactions = stats.todayTransactions;
          this.avgTransactionValue = stats.avgTransactionValue;
          this.lowStockCount = stats.lowStockCount;
          this.paymentBreakdown = stats.paymentBreakdown;
          
          // Update top selling items
          this.topSellingItems = topSellingItems;
          
          // Update recent transactions
          this.recentTransactions = recentTransactions;
          
          this.isLoading = false;
          this.isRefreshing = false;
        }
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.error = 'Failed to load dashboard data. Please try again.';
        this.isLoading = false;
        this.isRefreshing = false;

        // If unauthorized, redirect to login
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  showOverallReport() {
    this.router.navigate(['/overall-report']);
  }

  showTodayReport() {
    this.router.navigate(['/reports']);
  }
}