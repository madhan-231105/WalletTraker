import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="reports-wrapper">
      <!-- Header -->
      <header class="reports-header">
        <div class="header-left">
          <h1>📊 Today's Report</h1>
          <span class="date">{{ currentDate | date:'fullDate' }}</span>
        </div>
        <div class="header-right">
          <button class="back-btn" routerLink="/dashboard">← Back to Dashboard</button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="reports-main">
        <!-- Summary Section -->
        <section class="summary-section">
          <h2>Summary</h2>
          <div class="summary-grid">
            <div class="summary-card">
              <h3>Total Sales</h3>
              <p class="value">₹{{ summary.totalSales | number:'1.2-2' }}</p>
            </div>
            <div class="summary-card">
              <h3>Transactions</h3>
              <p class="value">{{ summary.transactionCount }}</p>
            </div>
            <div class="summary-card">
              <h3>Average Bill</h3>
              <p class="value">₹{{ summary.avgTransactionValue | number:'1.2-2' }}</p>
            </div>
            <div class="summary-card">
              <h3>Items Sold</h3>
              <p class="value">{{ summary.totalItemsSold }}</p>
            </div>
          </div>
        </section>

        <!-- Payment Breakdown -->
        <section class="payment-section">
          <h2>Payment Breakdown</h2>
          <div class="payment-grid">
            <div class="payment-card">
              <h3>Cash</h3>
              <p class="value">₹{{ paymentBreakdown.cash | number:'1.2-2' }}</p>
              <small>{{ paymentBreakdown.cashPercentage }}% of total</small>
            </div>
            <div class="payment-card">
              <h3>UPI</h3>
              <p class="value">₹{{ paymentBreakdown.upi | number:'1.2-2' }}</p>
              <small>{{ paymentBreakdown.upiPercentage }}% of total</small>
            </div>
            <div class="payment-card">
              <h3>Card</h3>
              <p class="value">₹{{ paymentBreakdown.card | number:'1.2-2' }}</p>
              <small>{{ paymentBreakdown.cardPercentage }}% of total</small>
            </div>
          </div>
        </section>

        <!-- Top Selling Products -->
        <section class="top-products-section">
          <h2>Top Selling Products</h2>
          <div class="products-table">
            <div class="table-header">
              <span>Rank</span>
              <span>Product</span>
              <span>Category</span>
              <span>Quantity</span>
              <span>Revenue</span>
            </div>
            <div class="table-row" *ngFor="let item of topSellingItems; let i = index">
              <span>{{ i + 1 }}</span>
              <span>{{ item.name }}</span>
              <span>{{ item.category }}</span>
              <span>{{ item.soldQuantity }}</span>
              <span>₹{{ item.revenue | number:'1.2-2' }}</span>
            </div>
          </div>
        </section>

        <!-- Transaction History -->
        <section class="transactions-section">
          <h2>Transaction History</h2>
          <div class="transactions-table">
            <div class="table-header">
              <span>Bill #</span>
              <span>Time</span>
              <span>Amount</span>
              <span>Payment Method</span>
              <span>Items</span>
            </div>
            <div class="table-row" *ngFor="let transaction of transactions">
              <span>{{ transaction.billNumber }}</span>
              <span>{{ transaction.time | date:'shortTime' }}</span>
              <span>₹{{ transaction.amount | number:'1.2-2' }}</span>
              <span class="payment-badge {{ transaction.paymentMethod }}">
                {{ transaction.paymentMethod.toUpperCase() }}
              </span>
              <span>{{ transaction.itemCount }}</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styleUrls: ['./reports.css']
})
export class ReportsComponent implements OnInit {
  currentDate = new Date();
  
  // Summary data
  summary = {
    totalSales: 25420.50,
    transactionCount: 48,
    avgTransactionValue: 529.60,
    totalItemsSold: 127
  };

  // Payment breakdown
  paymentBreakdown = {
    cash: 8500,
    upi: 12400,
    card: 4520.50,
    cashPercentage: 33.4,
    upiPercentage: 48.8,
    cardPercentage: 17.8
  };

  // Top selling items (same as dashboard for consistency)
  topSellingItems = [
    { name: 'Bluetooth Headphones', category: 'Electronics', soldQuantity: 12, revenue: 4800 },
    { name: 'Phone Case', category: 'Accessories', soldQuantity: 8, revenue: 2400 },
    { name: 'USB Cable', category: 'Accessories', soldQuantity: 15, revenue: 1500 },
    { name: 'Power Bank', category: 'Electronics', soldQuantity: 5, revenue: 2500 },
    { name: 'Screen Guard', category: 'Accessories', soldQuantity: 6, revenue: 900 }
  ];

  // Transaction history
  transactions = [
    { billNumber: 'B001', time: new Date(), amount: 1250.00, paymentMethod: 'upi', itemCount: 3 },
    { billNumber: 'B002', time: new Date(Date.now() - 300000), amount: 450.00, paymentMethod: 'cash', itemCount: 1 },
    { billNumber: 'B003', time: new Date(Date.now() - 600000), amount: 2100.00, paymentMethod: 'card', itemCount: 4 },
    { billNumber: 'B004', time: new Date(Date.now() - 900000), amount: 750.00, paymentMethod: 'upi', itemCount: 2 },
    { billNumber: 'B005', time: new Date(Date.now() - 1200000), amount: 320.00, paymentMethod: 'cash', itemCount: 1 }
  ];

  ngOnInit() {
    // In a real application, this would fetch data from a backend service
  }
}