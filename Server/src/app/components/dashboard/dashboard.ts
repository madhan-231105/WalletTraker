// dashboard/dashboard.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../login/auth.service';

@Component({
  selector: 'app-dashboard',
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
        <button class="nav-item active" routerLink="/dashboard">
          <span class="nav-icon">🏠</span>
          Dashboard
        </button>
        <button class="nav-item" routerLink="/billing">
          <span class="nav-icon">🛒</span>
          New Sale
        </button>
        <button class="nav-item" routerLink="/inventory">
          <span class="nav-icon">📦</span>
          Inventory
        </button>
        <button class="nav-item" routerLink="/reports">
          <span class="nav-icon">📊</span>
          Reports
        </button>
        <button class="nav-item" routerLink="/qr-payment">
          <span class="nav-icon">📱</span>
          QR Payment
        </button>
      </nav>

      <!-- Main Content -->
      <main class="dashboard-main">
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
              <span class="growth-indicator positive">+{{ salesGrowth }}%</span>
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

          <div class="stat-card stock-alert">
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

            <button class="action-card" (click)="showQRCode()">
              <span class="action-icon">📱</span>
              <div class="action-content">
                <h4>QR Payment</h4>
                <p>Show payment QR</p>
              </div>
            </button>
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="recent-activity">
          <div class="activity-column">
            <h3>🏆 Top Selling Today</h3>
            <div class="activity-list">
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
            <h3>🕒 Recent Transactions</h3>
            <div class="activity-list">
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
  shopName = 'ABC Electronics Store';
  isLoggingOut = false;

  // Mock dashboard data
  todaySales = 25420.50;
  salesGrowth = 12.5;
  todayTransactions = 48;
  avgTransactionValue = 529.6;
  lowStockCount = 3;

  paymentBreakdown = {
    cash: 8500,
    upi: 12400,
    card: 4520.50
  };

  topSellingItems = [
    { name: 'Bluetooth Headphones', category: 'Electronics', soldQuantity: 12, revenue: 4800 },
    { name: 'Phone Case', category: 'Accessories', soldQuantity: 8, revenue: 2400 },
    { name: 'USB Cable', category: 'Accessories', soldQuantity: 15, revenue: 1500 },
    { name: 'Power Bank', category: 'Electronics', soldQuantity: 5, revenue: 2500 },
    { name: 'Screen Guard', category: 'Accessories', soldQuantity: 6, revenue: 900 }
  ];

  recentTransactions = [
    { billNumber: 'B001', amount: 1250.00, paymentMethod: 'upi', time: new Date() },
    { billNumber: 'B002', amount: 450.00, paymentMethod: 'cash', time: new Date(Date.now() - 300000) },
    { billNumber: 'B003', amount: 2100.00, paymentMethod: 'card', time: new Date(Date.now() - 600000) },
    { billNumber: 'B004', amount: 750.00, paymentMethod: 'upi', time: new Date(Date.now() - 900000) },
    { billNumber: 'B005', amount: 320.00, paymentMethod: 'cash', time: new Date(Date.now() - 1200000) }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout() {
    this.isLoggingOut = true;
    this.authService.logout();
    
    setTimeout(() => {
      this.router.navigate(['/login']).then(() => {
        this.isLoggingOut = false;
      });
    }, 500);
  }

  showQRCode() {
    alert('🔄 QR Payment feature will be implemented next!');
  }

  showTodayReport() {
    this.router.navigate(['/reports']);
  }
}