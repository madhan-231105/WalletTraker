// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { HomeComponent } from './home/home';
// Import new components (create these next)
import { DashboardComponent } from './components/dashboard/dashboard';
import { BillingComponent } from './components/billing/billing';
import { InventoryComponent } from './components/inventory/inventory';
//import { ReportsComponent } from './components/reports/reports';
//import { QrPaymentComponent } from './components/qr-payment/qr-payment';

export const routes: Routes = [
  // Default route - redirect to login
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  
  // Authentication routes
  { path: 'login', component: LoginComponent },
  
  // Keep existing home for now (we'll replace with dashboard)
  { path: 'home', component: HomeComponent },
  
  // New WalletTracker routes
  { path: 'dashboard', component: DashboardComponent },
  { path: 'billing', component: BillingComponent },
  { path: 'inventory', component: InventoryComponent },
  //{ path: 'reports', component: ReportsComponent },
  //{ path: 'qr-payment', component: QrPaymentComponent },
  
  // Wildcard route - redirect any unknown routes to login
  { path: '**', redirectTo: '/login' }
];

