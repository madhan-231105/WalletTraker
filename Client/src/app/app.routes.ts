import { Routes } from '@angular/router';
import { LoginComponent } from './login/login';
import { HomepageComponent } from './homepage/homepage';
import { QrScannerComponent } from './qr-scanner-component/qr-scanner-component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomepageComponent },
  { path: 'scan', component: QrScannerComponent }

];
