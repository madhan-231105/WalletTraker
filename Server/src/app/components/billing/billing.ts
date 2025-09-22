import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  barcode?: string;
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
                <div class="qr-placeholder">
                  📱 QR Code
                  <small>Customer scans to pay</small>
                </div>
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
  discountPercent = 0;
  cashReceived = 0;
  showPaymentModal = false;
  showSuccessModal = false;

  // Mock products data
  availableProducts: Product[] = [
    { id: 'P001', name: 'Bluetooth Headphones', price: 1299.00, stock: 25, category: 'Electronics', barcode: '1234567890' },
    { id: 'P002', name: 'Phone Case', price: 299.00, stock: 50, category: 'Accessories', barcode: '2345678901' },
    { id: 'P003', name: 'USB Cable', price: 149.00, stock: 30, category: 'Accessories', barcode: '3456789012' },
    { id: 'P004', name: 'Power Bank', price: 899.00, stock: 15, category: 'Electronics', barcode: '4567890123' },
    { id: 'P005', name: 'Screen Guard', price: 199.00, stock: 8, category: 'Accessories', barcode: '5678901234' },
    { id: 'P006', name: 'Wireless Mouse', price: 699.00, stock: 20, category: 'Electronics', barcode: '6789012345' },
    { id: 'P007', name: 'Keyboard', price: 1199.00, stock: 12, category: 'Electronics', barcode: '7890123456' },
    { id: 'P008', name: 'Webcam', price: 1599.00, stock: 5, category: 'Electronics', barcode: '8901234567' }
  ];

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

  constructor(private router: Router) {}

  ngOnInit() {
    this.generateBillNumber();
    this.filteredProducts = this.availableProducts.slice(0, 6); // Show first 6 products initially
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

    const existingItem = this.currentBill.items.find(item => item.product.id === product.id);
    
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
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.cashReceived = 0;
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

    // Update stock quantities
    this.currentBill.items.forEach(item => {
      const product = this.availableProducts.find(p => p.id === item.product.id);
      if (product) {
        product.stock -= item.quantity;
      }
    });

    // Close payment modal and show success
    this.closePaymentModal();
    this.showSuccessModal = true;

    // Save bill to localStorage (mock API)
    this.saveBillToStorage();
  }

  saveBillToStorage() {
    const bills = JSON.parse(localStorage.getItem('wallettracker_bills') || '[]');
    bills.push({ ...this.currentBill });
    localStorage.setItem('wallettracker_bills', JSON.stringify(bills));
  }

  printBill() {
    this.downloadBillAsPdf();
  }

  startNewBill() {
    this.showSuccessModal = false;
    this.clearBill();
    this.generateBillNumber();
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
    // Mock barcode scanner
    alert('📷 Barcode Scanner\n\nIn a real app, this would:\n- Open camera\n- Scan product barcodes\n- Automatically add products to bill');
  }

  // Generating TXT bill
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

  // Generating LaTeX bill
  generateLatexBill(): string {
    let latex = `\\documentclass[a4paper,12pt]{article}
\\usepackage{geometry}
\\geometry{left=2cm,right=2cm,top=2cm,bottom=2cm}
\\usepackage{booktabs}
\\usepackage{array}
\\usepackage{parskip}
\\usepackage{times}
\\begin{document}

\\begin{center}
{\\Large \\textbf{WALLETTRACKER BILL}} \\\\
\\vspace{0.5cm}
Bill \\#: ${this.currentBill.billNumber} \\\\
Date: ${this.currentBill.timestamp.toLocaleString()} \\\\
`;
    if (this.currentBill.customerPhone) {
      latex += `Customer Phone: ${this.currentBill.customerPhone} \\\\
`;
    }
    latex += `\\end{center}
\\vspace{0.5cm}

\\begin{tabular}{>{\\raggedright\\arraybackslash}p{6cm} r r r}
\\toprule
\\textbf{Item} & \\textbf{Qty} & \\textbf{Price} & \\textbf{Subtotal} \\\\
\\midrule
`;
    this.currentBill.items.forEach(item => {
      latex += `${item.product.name} (${item.product.category}) & ${item.quantity} & ₹${item.product.price.toFixed(2)} & ₹${item.subtotal.toFixed(2)} \\\\
`;
    });
    latex += `\\bottomrule
\\end{tabular}

\\vspace{0.5cm}
\\begin{tabular}{lr}
Subtotal & ₹${this.currentBill.subtotal.toFixed(2)} \\\\
Discount (${this.discountPercent}\\%) & ₹${this.currentBill.discount.toFixed(2)} \\\\
Tax (18\\% GST) & ₹${this.currentBill.tax.toFixed(2)} \\\\
\\textbf{Total} & \\textbf{₹${this.currentBill.total.toFixed(2)}} \\\\
Payment Method & ${this.getPaymentMethodText()} \\\\
`;
    if (this.currentBill.paymentMethod === 'cash' && this.cashReceived > 0) {
      latex += `Cash Received & ₹${this.cashReceived.toFixed(2)} \\\\
Change Given & ₹${this.getChangeAmount().toFixed(2)} \\\\
`;
    }
    latex += `\\end{tabular}

\\vspace{1cm}
\\begin{center}
Thank you for shopping with us!
\\end{center}

\\end{document}`;
    return latex;
  }

  downloadBillAsPdf() {
    const latexContent = this.generateLatexBill();
    const blob = new Blob([latexContent], { type: 'text/latex' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill_${this.currentBill.billNumber}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}