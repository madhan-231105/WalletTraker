import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../login/auth.service';

@Component({
  selector: 'app-overall-report',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  template: `
    <div class="reports-wrapper">
      <!-- Main Content -->
      <main class="reports-main">
        <!-- Summary Section -->
        <section class="summary-section">
          <h2>Summary</h2>
          <div class="summary-grid">
            <div class="summary-card">
              <h3>Total Products</h3>
              <p class="value">{{ summary.totalProducts }}</p>
            </div>
            <div class="summary-card">
              <h3>Out of Stock</h3>
              <p class="value">{{ summary.outOfStock }}</p>
            </div>
            <div class="summary-card">
              <h3>Low Stock</h3>
              <p class="value">{{ summary.lowStock }}</p>
            </div>
            <div class="summary-card">
              <h3>Total Revenue</h3>
              <p class="value">₹{{ summary.totalRevenue | number:'1.0-0' }}</p>
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
              <span>Units Sold</span>
              <span>Revenue</span>
            </div>
            <div class="table-row" *ngFor="let product of topProducts; let i = index">
              <span>{{ i + 1 }}</span>
              <span>{{ product.name }}</span>
              <span>{{ product.category }}</span>
              <span>{{ product.unitsSold }}</span>
              <span>₹{{ product.revenue | number:'1.2-2' }}</span>
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

        <!-- Product Movement -->
        <section class="report-section">
          <h2>📈 Product Movement</h2>
          <div class="movement-chart bg-gray-50 p-6 rounded-lg text-center">
            <p class="text-gray-600">Interactive chart coming soon: Weekly product movement trends 📊</p>
            <div class="h-64 flex items-center justify-center">
              <div class="animate-pulse bg-gray-200 h-full w-full rounded-lg"></div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styleUrls: ['./overall-report.css']
})
export class OverallReportComponent implements OnInit {
  currentDate = new Date();

  // Default fallback data
  summary = {
    totalProducts: 0,
    outOfStock: 0,
    lowStock: 0,
    totalRevenue: 0
  };

  paymentBreakdown = {
    cash: 0,
    upi: 0,
    card: 0,
    cashPercentage: 0,
    upiPercentage: 0,
    cardPercentage: 0
  };

  topProducts = [
    { name: 'Bluetooth Headphones', category: 'Electronics', unitsSold: 150, revenue: 60000 },
    { name: 'USB Cable', category: 'Accessories', unitsSold: 300, revenue: 30000 },
    { name: 'Power Bank', category: 'Electronics', unitsSold: 120, revenue: 60000 },
    { name: 'Phone Case', category: 'Accessories', unitsSold: 250, revenue: 25000 }
  ];

  transactions = [
    { billNumber: 'B001', time: new Date(), amount: 1500, paymentMethod: 'cash', itemCount: 2 },
    { billNumber: 'B002', time: new Date(), amount: 2500, paymentMethod: 'upi', itemCount: 3 },
    { billNumber: 'B003', time: new Date(), amount: 1800, paymentMethod: 'card', itemCount: 1 }
  ];

  constructor(private http: HttpClient, private authService: AuthService) {}

ngOnInit() {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.authService.getToken()}`
  });

  this.http.get('http://localhost:3000/api/reports/overall', { headers }).subscribe({
    next: (res: any) => {
      // Use totalRevenue from API directly
      this.summary = {
        totalProducts: res.inventoryReport?.length || 0,
        outOfStock: res.inventoryReport?.filter((i: any) => i.stock === 0).length || 0,
        lowStock: res.inventoryReport?.filter((i: any) => i.stock < 10 && i.stock > 0).length || 0,
        totalRevenue: res.totalRevenue || 0  // ✅ updated
      };

      this.paymentBreakdown = res.paymentBreakdown || this.paymentBreakdown;
      this.topProducts = res.topProducts || this.topProducts;
      this.transactions = res.transactions || this.transactions;
    },
    error: (err) => {
      console.error('❌ Error loading report:', err);
      alert('Failed to load overall report.');
    }
  });
}

  }
