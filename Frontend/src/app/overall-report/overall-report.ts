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

        <!-- Revenue Trend Chart -->
        <section class="report-section">
          <h2>📈 Revenue Trend (Last 10 Days)</h2>
          <div class="chart-container">
            <div class="chart-header">
              <div class="trend-stats">
                <div class="trend-stat">
                  <span class="trend-label">Average Daily</span>
                  <span class="trend-value">₹{{ getAverageDailyRevenue() | number:'1.0-0' }}</span>
                </div>
                <div class="trend-stat">
                  <span class="trend-label">Highest Day</span>
                  <span class="trend-value positive">₹{{ getHighestRevenue() | number:'1.0-0' }}</span>
                </div>
                <div class="trend-stat">
                  <span class="trend-label">Lowest Day</span>
                  <span class="trend-value negative">₹{{ getLowestRevenue() | number:'1.0-0' }}</span>
                </div>
                <div class="trend-stat">
                  <span class="trend-label">Total (10 Days)</span>
                  <span class="trend-value">₹{{ getTotalRevenue() | number:'1.0-0' }}</span>
                </div>
              </div>
            </div>
            <canvas #revenueChart></canvas>
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
      </main>
    </div>
  `,
  styleUrls: ['./overall-report.css']
})
export class OverallReportComponent implements OnInit {
  currentDate = new Date();
  chart: any;

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

  dailyRevenue: any[] = [];

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.loadChartJS().then(() => {
      this.fetchReportData();
    });
  }

  loadChartJS(): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).Chart) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  }

  fetchReportData() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
    });

    this.http.get('http://localhost:3000/api/reports/overall', { headers }).subscribe({
      next: (res: any) => {
        this.summary = {
          totalProducts: res.inventoryReport?.length || 0,
          outOfStock: res.inventoryReport?.filter((i: any) => i.stock === 0).length || 0,
          lowStock: res.inventoryReport?.filter((i: any) => i.stock < 10 && i.stock > 0).length || 0,
          totalRevenue: res.totalRevenue || 0
        };

        this.paymentBreakdown = res.paymentBreakdown || this.paymentBreakdown;
        this.topProducts = res.topProducts || this.topProducts;
        this.transactions = res.transactions || this.transactions;
        this.dailyRevenue = res.dailyRevenue || [];

        // Render chart after data is loaded
        setTimeout(() => this.renderChart(), 100);
      },
      error: (err) => {
        console.error('❌ Error loading report:', err);
        alert('Failed to load overall report.');
      }
    });
  }

  renderChart() {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement;
    if (!canvas || !this.dailyRevenue.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if any
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.dailyRevenue.map(day => {
      const date = new Date(day.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const revenueData = this.dailyRevenue.map(day => day.revenue || 0);
    const average = this.getAverageDailyRevenue();

    const Chart = (window as any).Chart;
    
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Daily Revenue',
            data: revenueData,
            borderColor: '#3b82f6',
            backgroundColor: (context: any) => {
              const ctx = context.chart.ctx;
              const gradient = ctx.createLinearGradient(0, 0, 0, 400);
              gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
              gradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');
              return gradient;
            },
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 6,
            pointHoverRadius: 9,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#fff',
            pointBorderWidth: 3,
            pointHoverBorderWidth: 4
          },
          {
            label: 'Average',
            data: new Array(revenueData.length).fill(average),
            borderColor: '#f59e0b',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [10, 5],
            tension: 0,
            fill: false,
            pointRadius: 0,
            pointHoverRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.5,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              font: {
                size: 13,
                weight: '600'
              },
              padding: 15,
              usePointStyle: true,
              boxWidth: 8,
              boxHeight: 8
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            padding: 16,
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            bodyFont: {
              size: 14
            },
            bodySpacing: 8,
            cornerRadius: 8,
            displayColors: true,
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            callbacks: {
              label: function(context: any) {
                if (context.dataset.label === 'Average') {
                  return 'Average: ₹' + context.parsed.y.toLocaleString('en-IN', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  });
                }
                return 'Revenue: ₹' + context.parsed.y.toLocaleString('en-IN', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                });
              },
              afterLabel: function(context: any) {
                if (context.dataset.label === 'Daily Revenue') {
                  const avg = context.chart.data.datasets[1].data[0];
                  const diff = context.parsed.y - avg;
                  const percent = ((diff / avg) * 100).toFixed(1);
                  if (diff > 0) {
                    return '↑ +' + percent + '% above average';
                  } else if (diff < 0) {
                    return '↓ ' + percent + '% below average';
                  } else {
                    return '= Average';
                  }
                }
                return '';
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false,
              drawBorder: false
            },
            ticks: {
              font: {
                size: 12,
                weight: '600'
              },
              color: '#6b7280'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.06)',
              drawBorder: false
            },
            ticks: {
              font: {
                size: 12,
                weight: '500'
              },
              color: '#6b7280',
              padding: 10,
              callback: function(value: any) {
                if (value >= 1000) {
                  return '₹' + (value / 1000).toFixed(0) + 'K';
                }
                return '₹' + value;
              }
            }
          }
        }
      }
    });
  }

  getAverageDailyRevenue(): number {
    if (!this.dailyRevenue.length) return 0;
    const total = this.dailyRevenue.reduce((sum, day) => sum + (day.revenue || 0), 0);
    return total / this.dailyRevenue.length;
  }

  getHighestRevenue(): number {
    if (!this.dailyRevenue.length) return 0;
    return Math.max(...this.dailyRevenue.map(day => day.revenue || 0));
  }

  getLowestRevenue(): number {
    if (!this.dailyRevenue.length) return 0;
    return Math.min(...this.dailyRevenue.map(day => day.revenue || 0));
  }

  getTotalRevenue(): number {
    return this.dailyRevenue.reduce((sum, day) => sum + (day.revenue || 0), 0);
  }
}