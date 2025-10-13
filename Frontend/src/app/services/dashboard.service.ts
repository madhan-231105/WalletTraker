// services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DashboardStats {
  todaySales: number;
  salesGrowth: number;
  todayTransactions: number;
  avgTransactionValue: number;
  lowStockCount: number;
  paymentBreakdown: {
    cash: number;
    upi: number;
    card: number;
  };
}

export interface TopSellingItem {
  productId: string;
  name: string;
  category: string;
  soldQuantity: number;
  revenue: number;
}

export interface RecentTransaction {
  billNumber: string;
  amount: number;
  paymentMethod: string;
  time: Date;
}

export interface WeeklySalesData {
  date: string;
  sales: number;
  transactions: number;
}

export interface CompleteDashboardData {
  stats: DashboardStats;
  topSellingItems: TopSellingItem[];
  recentTransactions: RecentTransaction[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Get complete dashboard data (recommended - single API call)
  getCompleteDashboard(): Observable<{ success: boolean; data: CompleteDashboardData }> {
    return this.http.get<{ success: boolean; data: CompleteDashboardData }>(
      `${this.apiUrl}/complete`,
      { headers: this.getHeaders() }
    );
  }

  // Get dashboard statistics only
  getDashboardStats(): Observable<{ success: boolean; data: DashboardStats }> {
    return this.http.get<{ success: boolean; data: DashboardStats }>(
      `${this.apiUrl}/stats`,
      { headers: this.getHeaders() }
    );
  }

  // Get top selling items
  getTopSellingItems(): Observable<{ success: boolean; data: TopSellingItem[] }> {
    return this.http.get<{ success: boolean; data: TopSellingItem[] }>(
      `${this.apiUrl}/top-selling`,
      { headers: this.getHeaders() }
    );
  }

  // Get recent transactions
  getRecentTransactions(limit: number = 5): Observable<{ success: boolean; data: RecentTransaction[] }> {
    return this.http.get<{ success: boolean; data: RecentTransaction[] }>(
      `${this.apiUrl}/recent-transactions?limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  // Get weekly sales trend
  getWeeklySalesTrend(): Observable<{ success: boolean; data: WeeklySalesData[] }> {
    return this.http.get<{ success: boolean; data: WeeklySalesData[] }>(
      `${this.apiUrl}/weekly-trend`,
      { headers: this.getHeaders() }
    );
  }
}