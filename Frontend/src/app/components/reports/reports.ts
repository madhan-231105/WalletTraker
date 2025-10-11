import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../login/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="reports-wrapper">
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

  // Default fallback data (until API loads)
  summary = {
    totalSales: 0,
    transactionCount: 0,
    avgTransactionValue: 0,
    totalItemsSold: 0
  };

  paymentBreakdown = {
    cash: 0,
    upi: 0,
    card: 0,
    cashPercentage: 0,
    upiPercentage: 0,
    cardPercentage: 0
  };

  topSellingItems: any[] = [];
  transactions: any[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });

    this.http.get('http://localhost:3000/api/reports/today', { headers }).subscribe({
      next: (res: any) => {
        this.summary = res.summary;
        this.paymentBreakdown = res.paymentBreakdown;
        this.topSellingItems = res.topSellingItems;
        this.transactions = res.transactions;
      },
      error: (err) => {
        console.error('❌ Error loading report:', err);
        alert('Failed to load today’s report.');
      }
    });
  }
}