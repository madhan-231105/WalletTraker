import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { AuthService } from '../../login/auth.service';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  barcode?: string;
  description?: string;
  costPrice?: number;
  minStockAlert?: number;
  createdAt?: Date;
  updatedAt?: Date;
  image?: string;
  userId?: string; // Added to match backend
}

interface BillItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

interface Bill {
  billNumber: string;
  items: BillItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  customerPhone?: string;
  timestamp: Date;
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="billing-container">
      <!-- Header -->
      <header class="billing-header">
        <div class="header-left">
          <button class="back-btn" routerLink="/dashboard">
            ← Dashboard
          </button>
          <h1>🛒 New Bill</h1>
        </div>
        <div class="header-right">
          <div class="bill-info">
            <span class="bill-number">Bill #{{ currentBill.billNumber }}</span>
            <small>{{ currentBill.timestamp | date:'medium' }}</small>
          </div>
        </div>
      </header>

      <div class="billing-content">
        <!-- Product Search & Add -->
        <section class="product-section">
          <div class="search-area">
            <div class="search-box">
              <input 
                type="text" 
                [(ngModel)]="searchQuery"
                (input)="searchProducts()"
                placeholder="🔍 Search products by name or scan barcode..."
                class="search-input"
              >
              <button class="barcode-btn" (click)="toggleBarcodeScanner()">
                📷 Scan
              </button>
            </div>
          </div>

          <!-- Product Results -->
          <div class="product-results" *ngIf="filteredProducts.length > 0">
            <div class="product-grid">
              <div 
                class="product-card" 
                *ngFor="let product of filteredProducts"
                (click)="addToCart(product)"
                [class.out-of-stock]="product.stock === 0"
              >
                <div class="product-info">
                  <strong>{{ product.name }}</strong>
                  <small>{{ product.category }}</small>
                  <div class="product-price">₹{{ product.price | number:'1.2-2' }}</div>
                </div>
                <div class="product-stock">
                  <span class="stock-count" [class.low-stock]="product.stock < 10">
                    {{ product.stock }} in stock
                  </span>
                  <button class="add-btn" [disabled]="product.stock === 0">
                    {{ product.stock === 0 ? 'Out of Stock' : '+ Add' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Bill Items -->
        <section class="cart-section">
          <h2>🧾 Current Bill</h2>
          
          <div class="cart-empty" *ngIf="currentBill.items.length === 0">
            <p>No items added yet. Search and add products to create a bill.</p>
          </div>

          <div class="cart-items" *ngIf="currentBill.items.length > 0">
            <div class="cart-item" *ngFor="let item of currentBill.items; let i = index">
              <div class="item-info">
                <strong>{{ item.product.name }}</strong>
                <small>{{ item.product.category }}</small>
                <div class="item-price">₹{{ item.product.price | number:'1.2-2' }} each</div>
              </div>
              
              <div class="quantity-controls">
                <button class="qty-btn" (click)="updateQuantity(i, item.quantity - 1)">-</button>
                <input 
                  type="number" 
                  class="qty-input"
                  [(ngModel)]="item.quantity"
                  (change)="updateQuantity(i, item.quantity)"
                  min="1"
                  [max]="item.product.stock + item.quantity"
                >
                <button class="qty-btn" (click)="updateQuantity(i, item.quantity + 1)" 
                        [disabled]="item.quantity >= item.product.stock">+</button>
              </div>
              
              <div class="item-total">
                <div class="subtotal">₹{{ item.subtotal | number:'1.2-2' }}</div>
                <button class="remove-btn" (click)="removeItem(i)">🗑️</button>
              </div>
            </div>
          </div>

          <!-- Bill Summary -->
          <div class="bill-summary" *ngIf="currentBill.items.length > 0">
            <div class="summary-row">
              <span>Subtotal ({{ getTotalItems() }} items)</span>
              <span>₹{{ currentBill.subtotal | number:'1.2-2' }}</span>
            </div>
            
            <div class="summary-row">
              <span>Discount</span>
              <div class="discount-input">
                <input 
                  type="number" 
                  [(ngModel)]="discountPercent"
                  (input)="calculateTotal()"
                  placeholder="0"
                  min="0" 
                  max="100"
                  class="discount-field"
                >
                <span>% (₹{{ currentBill.discount | number:'1.2-2' }})</span>
              </div>
            </div>
            
            <div class="summary-row">
              <span>Tax (18% GST)</span>
              <span>₹{{ currentBill.tax | number:'1.2-2' }}</span>
            </div>
            
            <div class="summary-row total-row">
              <strong>Total Amount</strong>
              <strong class="total-amount">₹{{ currentBill.total | number:'1.2-2' }}</strong>
            </div>

            <!-- Customer Info -->
            <div class="customer-info">
              <input 
                type="tel" 
                [(ngModel)]="currentBill.customerPhone"
                placeholder="Customer phone number (optional)"
                class="customer-input"
              >
            </div>

            <!-- Payment Methods -->
            <div class="payment-methods">
              <h3>💳 Payment Method</h3>
              <div class="payment-options">
                <button 
                  class="payment-btn"
                  [class.active]="currentBill.paymentMethod === 'cash'"
                  (click)="setPaymentMethod('cash')"
                >
                  💵 Cash
                </button>
                <button 
                  class="payment-btn"
                  [class.active]="currentBill.paymentMethod === 'upi'"
                  (click)="setPaymentMethod('upi')"
                >
                  📱 UPI
                </button>
                <button 
                  class="payment-btn"
                  [class.active]="currentBill.paymentMethod === 'card'"
                  (click)="setPaymentMethod('card')"
                >
                  💳 Card
                </button>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="bill-actions">
              <button class="action-btn secondary" (click)="testJsonGeneration()">
                🔍 Test JSON
              </button>
              <button class="action-btn secondary" (click)="clearBill()">
                🗑️ Clear Bill
              </button>
              <button class="action-btn primary" (click)="processBill()" [disabled]="!currentBill.paymentMethod">
                ✅ Complete Sale (₹{{ currentBill.total | number:'1.2-2' }})
              </button>
            </div>
          </div>
        </section>
      </div>

      <!-- Payment Processing Modal -->
      <div class="modal-overlay" *ngIf="showPaymentModal" (click)="closePaymentModal()">
        <div class="payment-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>💳 Processing Payment</h3>
            <button class="close-btn" (click)="closePaymentModal()">×</button>
          </div>
          <div class="modal-content">
            <div class="payment-details">
              <div class="payment-amount">₹{{ currentBill.total | number:'1.2-2' }}</div>
              <div class="payment-method-display">
                {{ getPaymentMethodText() }}
              </div>
            </div>
            
            <div class="qr-section" *ngIf="currentBill.paymentMethod === 'upi'">
              <div class="qr-code">
                <h4>Payment QR</h4>
                <img *ngIf="upiQrCode" [src]="upiQrCode" alt="UPI Payment QR Code" class="qr-image">
                <div *ngIf="!upiQrCode" class="qr-placeholder">
                  Generating Payment QR...
                </div>
                <small>Scan to pay ₹{{ currentBill.total | number:'1.2-2' }}</small>
              </div>
            </div>

            <div class="cash-section" *ngIf="currentBill.paymentMethod === 'cash'">
              <div class="cash-input">
                <label>Amount Received:</label>
                <input 
                  type="number" 
                  [(ngModel)]="cashReceived"
                  placeholder="Enter amount received"
                  class="cash-field"
                  (input)="calculateChange()"
                >
                <div class="change-amount" *ngIf="cashReceived > 0">
                  <strong>Change: ₹{{ getChangeAmount() | number:'1.2-2' }}</strong>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button class="modal-btn secondary" (click)="closePaymentModal()">
                Cancel
              </button>
              <button 
                class="modal-btn primary" 
                (click)="confirmPayment()"
                [disabled]="!isPaymentValid()"
              >
                {{ currentBill.paymentMethod === 'cash' ? 'Confirm Payment' : 'Payment Received' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Success Modal -->
      <div class="modal-overlay" *ngIf="showSuccessModal">
        <div class="success-modal">
          <div class="success-icon">✅</div>
          <h3>Bill Created Successfully!</h3>
          <div class="success-details">
            <p>Bill #{{ currentBill.billNumber }}</p>
            <p>Amount: ₹{{ currentBill.total | number:'1.2-2' }}</p>
            <p>Payment: {{ getPaymentMethodText() }}</p>
          </div>
          <div class="success-actions">
            <button class="success-btn secondary" (click)="downloadBillAsTxt()">
              💾 Save as TXT
            </button>
            <button class="success-btn secondary" (click)="downloadBillAsPdf()">
              📄 Save as PDF
            </button>
            <button class="success-btn secondary" (click)="printBill()">
              🖨️ Print Bill
            </button>
            <button class="success-btn secondary" (click)="downloadBillAsJson()">
              💾 Save as JSON
            </button>
            <button class="success-btn primary" (click)="startNewBill()">
              ➕ New Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./billing.css']
})
export class BillingComponent implements OnInit {
  searchQuery = '';
  filteredProducts: Product[] = [];
  availableProducts: Product[] = [];
  discountPercent = 0;
  cashReceived = 0;
  showPaymentModal = false;
  showSuccessModal = false;
  upiQrCode: string | null = null;

  currentBill: Bill = {
    billNumber: '',
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    paymentMethod: '',
    customerPhone: '',
    timestamp: new Date()
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.generateBillNumber();
    this.loadProducts();
  }

  loadProducts() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.authService.getToken()}`
    });

    this.http.get<Product[]>('http://localhost:3000/api/inventory/products', { headers }).subscribe({
      next: (data) => {
        this.availableProducts = data.map(product => ({
          ...product,
          _id: product._id.toString(),
          userId: product.userId || '' // Handle userId
        }));
        this.filteredProducts = this.availableProducts.slice(0, 6);
      },
      error: (err) => {
        console.error('Error fetching products:', err.status, err.error);
        alert(`Failed to load products: ${err.error?.message || 'Unknown error'}`);
        this.filteredProducts = [];
      }
    });
  }

  generateBillNumber() {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = date.getTime().toString().slice(-4);
    this.currentBill.billNumber = `WT${dateStr}${timeStr}`;
    this.currentBill.timestamp = date;
  }

  searchProducts() {
    if (!this.searchQuery.trim()) {
      this.filteredProducts = this.availableProducts.slice(0, 6);
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredProducts = this.availableProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.barcode?.includes(query)
    );
  }

  addToCart(product: Product) {
    if (product.stock === 0) return;

    const existingItem = this.currentBill.items.find(item => item.product._id === product._id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        existingItem.quantity++;
        existingItem.subtotal = existingItem.quantity * existingItem.product.price;
      }
    } else {
      this.currentBill.items.push({
        product: product,
        quantity: 1,
        subtotal: product.price
      });
    }
    
    this.calculateTotal();
  }

  updateQuantity(index: number, newQuantity: number) {
    if (newQuantity <= 0) {
      this.removeItem(index);
      return;
    }

    const item = this.currentBill.items[index];
    if (newQuantity <= item.product.stock) {
      item.quantity = newQuantity;
      item.subtotal = item.quantity * item.product.price;
      this.calculateTotal();
    }
  }

  removeItem(index: number) {
    this.currentBill.items.splice(index, 1);
    this.calculateTotal();
  }

  calculateTotal() {
    this.currentBill.subtotal = this.currentBill.items.reduce((sum, item) => sum + item.subtotal, 0);
    this.currentBill.discount = (this.currentBill.subtotal * this.discountPercent) / 100;
    const discountedAmount = this.currentBill.subtotal - this.currentBill.discount;
    this.currentBill.tax = discountedAmount * 0.18; // 18% GST
    this.currentBill.total = discountedAmount + this.currentBill.tax;
  }

  getTotalItems(): number {
    return this.currentBill.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  setPaymentMethod(method: string) {
    this.currentBill.paymentMethod = method;
  }

  processBill() {
    if (!this.currentBill.paymentMethod) return;
    if (this.currentBill.paymentMethod === 'upi') {
      this.generateUpiQrCode();
    }
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.cashReceived = 0;
    this.upiQrCode = null;
  }

  calculateChange() {
    // Change calculation handled in getChangeAmount()
  }

  getChangeAmount(): number {
    return Math.max(0, this.cashReceived - this.currentBill.total);
  }

  isPaymentValid(): boolean {
    if (this.currentBill.paymentMethod === 'cash') {
      return this.cashReceived >= this.currentBill.total;
    }
    return true; // UPI and Card payments are assumed to be valid
  }

confirmPayment() {
  if (!this.isPaymentValid()) return;

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${this.authService.getToken()}`,
    'Content-Type': 'application/json'
  });

  // Map items to backend-friendly format
  const billPayload = {
    billNumber: this.currentBill.billNumber,
    items: this.currentBill.items.map(item => ({
      productId: item.product._id,
      quantity: item.quantity,
      subtotal: item.subtotal
    })),
    subtotal: this.currentBill.subtotal,
    tax: this.currentBill.tax,
    discount: this.currentBill.discount,
    total: this.currentBill.total,
    paymentMethod: this.currentBill.paymentMethod,
    customerPhone: this.currentBill.customerPhone,
    timestamp: this.currentBill.timestamp
  };

  // Send bill to backend, backend handles stock transactionally
  this.http.post('http://localhost:3000/api/billing/bills', billPayload, { headers })
    .subscribe({
      next: (res: any) => {
        console.log('Bill saved successfully:', res);
        alert(`✅ Payment confirmed! Bill #${res.bill.billNumber} saved.`);

        // Show success modal
        this.showPaymentModal = false;
        this.showSuccessModal = true;

        // Reset cashReceived & UPI QR
        this.cashReceived = 0;
        this.upiQrCode = null;
      },
      error: (err) => {
        console.error('Error saving bill:', err);
        alert(`❌ Failed to save bill: ${err.error?.message || err.message || 'Unknown error'}`);
      }
    });
}



  saveBillToStorage() {
    const bills = JSON.parse(localStorage.getItem('wallettracker_bills') || '[]');
    bills.push({ ...this.currentBill });
    localStorage.setItem('wallettracker_bills', JSON.stringify(bills));
  }

  printBill() {
    this.downloadBillAsPdf(true);
  }

  startNewBill() {
    this.showSuccessModal = false;
    this.clearBill();
    this.generateBillNumber();
    this.loadProducts(); // Refresh products
  }

  clearBill() {
    this.currentBill.items = [];
    this.currentBill.paymentMethod = '';
    this.currentBill.customerPhone = '';
    this.discountPercent = 0;
    this.calculateTotal();
    this.searchQuery = '';
    this.filteredProducts = this.availableProducts.slice(0, 6);
  }

  getPaymentMethodText(): string {
    switch (this.currentBill.paymentMethod) {
      case 'cash': return 'Cash Payment';
      case 'upi': return 'UPI Payment';
      case 'card': return 'Card Payment';
      default: return 'Select Payment Method';
    }
  }

  toggleBarcodeScanner() {
    alert('📷 Barcode Scanner\n\nIn a real app, this would:\n- Open camera\n- Scan product barcodes\n- Automatically add products to bill');
  }

  generateJsonBill(): any {
    return {
      products: this.currentBill.items.map(item => ({
        name: item.product.name,
        price: item.product.price
      })),
      total_amount: this.currentBill.total
    };
  }

  testJsonGeneration() {
    const jsonBill = this.generateJsonBill();
    console.log('Generated JSON Bill:', JSON.stringify(jsonBill, null, 2));
    alert(`Generated JSON Bill:\n\n${JSON.stringify(jsonBill, null, 2)}`);
  }

  generateUpiQrCode() {
    const pa = 'sbragul26@okicici';
    const pn = 'WalletTracker';
    const am = this.currentBill.total.toFixed(2);
    const cu = 'INR';
    const tr = this.currentBill.billNumber;
    const tn = `Bill ${this.currentBill.billNumber} - ${this.currentBill.items.length} items`;

    const upiUri = `upi://pay?pa=${encodeURIComponent(pa)}&pn=${encodeURIComponent(pn)}&am=${encodeURIComponent(am)}&cu=${encodeURIComponent(cu)}&tn=${encodeURIComponent(tn)}&tr=${encodeURIComponent(tr)}`;

    QRCode.toDataURL(upiUri, { 
      errorCorrectionLevel: 'M',
      scale: 4,
      margin: 2
    }, (error: Error | null | undefined, url: string) => {
      if (error) {
        console.error('Error generating UPI QR code:', error);
        this.upiQrCode = null;
        alert('Failed to generate UPI QR code. Please try again.');
      } else {
        this.upiQrCode = url;
      }
    });
  }

  generateTxtBill(): string {
    let txt = `----------------------------------------\n`;
    txt += `        WALLETTRACKER BILL\n`;
    txt += `----------------------------------------\n`;
    txt += `Bill #: ${this.currentBill.billNumber}\n`;
    txt += `Date: ${this.currentBill.timestamp.toLocaleString()}\n`;
    if (this.currentBill.customerPhone) {
      txt += `Customer Phone: ${this.currentBill.customerPhone}\n`;
    }
    txt += `----------------------------------------\n`;
    txt += `Items:\n`;
    this.currentBill.items.forEach(item => {
      txt += `${item.product.name} (${item.product.category})\n`;
      txt += `  Qty: ${item.quantity} x ₹${item.product.price.toFixed(2)}\n`;
      txt += `  Subtotal: ₹${item.subtotal.toFixed(2)}\n`;
    });
    txt += `----------------------------------------\n`;
    txt += `Subtotal: ₹${this.currentBill.subtotal.toFixed(2)}\n`;
    txt += `Discount (${this.discountPercent}%): ₹${this.currentBill.discount.toFixed(2)}\n`;
    txt += `Tax (18% GST): ₹${this.currentBill.tax.toFixed(2)}\n`;
    txt += `Total: ₹${this.currentBill.total.toFixed(2)}\n`;
    txt += `Payment Method: ${this.getPaymentMethodText()}\n`;
    if (this.currentBill.paymentMethod === 'cash' && this.cashReceived > 0) {
      txt += `Cash Received: ₹${this.cashReceived.toFixed(2)}\n`;
      txt += `Change Given: ₹${this.getChangeAmount().toFixed(2)}\n`;
    }
    txt += `----------------------------------------\n`;
    txt += `Thank you for shopping with us!\n`;
    return txt;
  }

  downloadBillAsTxt() {
    const txtContent = this.generateTxtBill();
    const blob = new Blob([txtContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill_${this.currentBill.billNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  downloadBillAsPdf(print = false) {
    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(18);
    doc.text('WALLETTRACKER BILL', 105, y, { align: 'center' });
    y += 15;

    doc.setFontSize(12);
    doc.text(`Bill #: ${this.currentBill.billNumber}`, 20, y);
    y += 10;
    doc.text(`Date: ${this.currentBill.timestamp.toLocaleString()}`, 20, y);
    y += 10;
    if (this.currentBill.customerPhone) {
      doc.text(`Customer Phone: ${this.currentBill.customerPhone}`, 20, y);
      y += 10;
    }

    doc.text('Items:', 20, y);
    y += 10;

    this.currentBill.items.forEach(item => {
      doc.text(`${item.product.name} (${item.product.category})`, 20, y);
      doc.text(`Qty: ${item.quantity} x ₹${item.product.price.toFixed(2)}`, 30, y + 5);
      doc.text(`Subtotal: ₹${item.subtotal.toFixed(2)}`, 30, y + 10);
      y += 20;
    });

    doc.text(`Subtotal: ₹${this.currentBill.subtotal.toFixed(2)}`, 20, y);
    y += 10;
    doc.text(`Discount (${this.discountPercent}%): ₹${this.currentBill.discount.toFixed(2)}`, 20, y);
    y += 10;
    doc.text(`Tax (18% GST): ₹${this.currentBill.tax.toFixed(2)}`, 20, y);
    y += 10;
    doc.setFontSize(14);
    doc.text(`Total: ₹${this.currentBill.total.toFixed(2)}`, 20, y);
    doc.setFontSize(12);
    y += 10;
    doc.text(`Payment Method: ${this.getPaymentMethodText()}`, 20, y);
    
    if (this.currentBill.paymentMethod === 'cash' && this.cashReceived > 0) {
      y += 10;
      doc.text(`Cash Received: ₹${this.cashReceived.toFixed(2)}`, 20, y);
      y += 10;
      doc.text(`Change Given: ₹${this.getChangeAmount().toFixed(2)}`, 20, y);
    }
    
    if (this.currentBill.paymentMethod === 'upi' && this.upiQrCode) {
      y += 15;
      doc.text('UPI Payment QR:', 20, y);
      y += 5;
      doc.addImage(this.upiQrCode, 'PNG', 20, y, 40, 40);
      y += 45;
    }
    
    y += 20;
    doc.text('Thank you for shopping with us!', 105, y, { align: 'center' });

    if (print) {
      doc.autoPrint();
      doc.output('dataurlnewwindow');
    } else {
      doc.save(`bill_${this.currentBill.billNumber}.pdf`);
    }
  }

  downloadBillAsJson() {
    const jsonContent = JSON.stringify(this.generateJsonBill(), null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill_${this.currentBill.billNumber}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}