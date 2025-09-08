import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.css']
})
export class HomepageComponent {
  
  constructor(private router: Router) {}
openQRScanner() {
    console.log('Button clicked - attempting navigation...');
    console.log('Current URL:', this.router.url);
    
    this.router.navigate(['/scan']).then(
      (success) => {
        console.log('Navigation success:', success);
        console.log('New URL:', this.router.url);
      },
      (error) => {
        console.error('Navigation failed:', error);
      }
    ).catch((err) => {
      console.error('Navigation error:', err);
    });
  }
  viewTransactions() {
    console.log('Viewing transactions...');
    // Navigate to transactions page
    this.router.navigate(['/transactions']);
  }
  
  addTransaction() {
    console.log('Adding new transaction...');
    // Navigate to add transaction page
    this.router.navigate(['/add-transaction']);
  }
}