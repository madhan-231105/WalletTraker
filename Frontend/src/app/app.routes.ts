// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { HomeComponent } from './home/home';
import { DashboardComponent } from './components/dashboard/dashboard';
import { BillingComponent } from './components/billing/billing';
import { InventoryComponent } from './components/inventory/inventory';
import { ReportsComponent } from './components/reports/reports';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'billing', component: BillingComponent },
  { path: 'inventory', component: InventoryComponent },
  { path: 'reports', component: ReportsComponent },
  { path: '**', redirectTo: '/login' }
];
