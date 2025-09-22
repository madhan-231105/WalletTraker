// inventory/inventory.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  costPrice: number;
  stock: number;
  minStockAlert: number;
  category: string;
  barcode: string;
  createdAt: Date;
  updatedAt: Date;
  image?: string;
}

interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  timestamp: Date;
  user: string;
}

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="inventory-container">
      <!-- Header -->
      <header class="inventory-header">
        <div class="header-left">
          <button class="back-btn" routerLink="/dashboard">
            ← Dashboard
          </button>
          <h1>📦 Inventory Management</h1>
        </div>
        <div class="header-right">
          <button class="add-product-btn" (click)="openAddProductModal()">
            ➕ Add Product
          </button>
          <button class="stock-alert-btn" [class.has-alerts]="lowStockProducts.length > 0">
            ⚠️ Alerts ({{ lowStockProducts.length }})
          </button>
        </div>
      </header>

      <!-- Toolbar -->
      <div class="inventory-toolbar">
        <div class="search-section">
          <input 
            type="text" 
            [(ngModel)]="searchQuery"
            (input)="filterProducts()"
            placeholder="🔍 Search products, categories, or barcodes..."
            class="search-input"
          >
          <select [(ngModel)]="selectedCategory" (change)="filterProducts()" class="category-filter">
            <option value="">All Categories</option>
            <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
          </select>
        </div>
        
        <div class="view-controls">
          <button 
            class="view-btn" 
            [class.active]="viewMode === 'grid'"
            (click)="viewMode = 'grid'"
          >
            📱 Grid
          </button>
          <button 
            class="view-btn" 
            [class.active]="viewMode === 'table'"
            (click)="viewMode = 'table'"
          >
            📋 Table
          </button>
        </div>
      </div>

      <!-- Inventory Stats -->
      <section class="inventory-stats">
        <div class="stat-box">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <h3>Total Products</h3>
            <p>{{ products.length }}</p>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <h3>Total Value</h3>
            <p>₹{{ getTotalInventoryValue() | number:'1.0-0' }}</p>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-icon">⚠️</div>
          <div class="stat-info">
            <h3>Low Stock</h3>
            <p>{{ lowStockProducts.length }}</p>
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-icon">📈</div>
          <div class="stat-info">
            <h3>Categories</h3>
            <p>{{ categories.length }}</p>
          </div>
        </div>
      </section>

      <!-- Products Display -->
      <main class="inventory-main">
        <!-- Grid View -->
        <div class="products-grid" *ngIf="viewMode === 'grid'">
          <div 
            class="product-card" 
            *ngFor="let product of filteredProducts"
            [class.low-stock]="product.stock <= product.minStockAlert"
          >
            <div class="product-image">
              <div class="image-placeholder">📦</div>
              <div class="stock-badge" [class.low]="product.stock <= product.minStockAlert">
                {{ product.stock }}
              </div>
            </div>
            
            <div class="product-details">
              <h4>{{ product.name }}</h4>
              <p class="product-description">{{ product.description }}</p>
              <div class="product-meta">
                <span class="category">{{ product.category }}</span>
                <span class="barcode">{{ product.barcode }}</span>
              </div>
              
              <div class="price-info">
                <div class="prices">
                  <span class="cost-price">Cost: ₹{{ product.costPrice | number:'1.2-2' }}</span>
                  <span class="sell-price">Sell: ₹{{ product.price | number:'1.2-2' }}</span>
                </div>
                <div class="profit-margin">
                  Margin: {{ getProfit(product) | number:'1.0-0' }}%
                </div>
              </div>
              
              <div class="stock-info">
                <div class="stock-level">
                  <span>Stock: {{ product.stock }}</span>
                  <div class="stock-bar">
                    <div 
                      class="stock-fill" 
                      [style.width.%]="getStockPercentage(product)"
                      [class.low]="product.stock <= product.minStockAlert"
                    ></div>
                  </div>
                </div>
                <small>Min: {{ product.minStockAlert }}</small>
              </div>
            </div>
            
            <div class="product-actions">
              <button class="action-btn edit" (click)="editProduct(product)">
                ✏️ Edit
              </button>
              <button class="action-btn stock" (click)="openStockModal(product)">
                📦 Stock
              </button>
              <button class="action-btn delete" (click)="deleteProduct(product.id)">
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Table View -->
        <div class="products-table" *ngIf="viewMode === 'table'">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Barcode</th>
                <th>Cost Price</th>
                <th>Sell Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                *ngFor="let product of filteredProducts"
                [class.low-stock-row]="product.stock <= product.minStockAlert"
              >
                <td>
                  <div class="product-cell">
                    <strong>{{ product.name }}</strong>
                    <small>{{ product.description }}</small>
                  </div>
                </td>
                <td>{{ product.category }}</td>
                <td class="barcode-cell">{{ product.barcode }}</td>
                <td>₹{{ product.costPrice | number:'1.2-2' }}</td>
                <td>₹{{ product.price | number:'1.2-2' }}</td>
                <td>
                  <div class="stock-cell">
                    <span class="stock-number" [class.low]="product.stock <= product.minStockAlert">
                      {{ product.stock }}
                    </span>
                    <small>Min: {{ product.minStockAlert }}</small>
                  </div>
                </td>
                <td>
                  <span 
                    class="status-badge" 
                    [class.in-stock]="product.stock > product.minStockAlert"
                    [class.low-stock]="product.stock <= product.minStockAlert && product.stock > 0"
                    [class.out-of-stock]="product.stock === 0"
                  >
                    {{ getStockStatus(product) }}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="table-btn edit" (click)="editProduct(product)">✏️</button>
                    <button class="table-btn stock" (click)="openStockModal(product)">📦</button>
                    <button class="table-btn delete" (click)="deleteProduct(product.id)">🗑️</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="filteredProducts.length === 0">
          <div class="empty-icon">📦</div>
          <h3>No Products Found</h3>
          <p *ngIf="searchQuery || selectedCategory">Try adjusting your search or filter criteria.</p>
          <p *ngIf="!searchQuery && !selectedCategory">Start by adding your first product to the inventory.</p>
          <button class="empty-action-btn" (click)="openAddProductModal()">
            ➕ Add Your First Product
          </button>
        </div>
      </main>

      <!-- Add/Edit Product Modal -->
      <div class="modal-overlay" *ngIf="showProductModal" (click)="closeProductModal()">
        <div class="product-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ editingProduct ? '✏️ Edit Product' : '➕ Add New Product' }}</h3>
            <button class="close-btn" (click)="closeProductModal()">×</button>
          </div>
          
          <form [formGroup]="productForm" (ngSubmit)="saveProduct()" class="product-form">
            <div class="form-grid">
              <div class="form-group">
                <label for="name">Product Name *</label>
                <input 
                  id="name" 
                  type="text" 
                  formControlName="name"
                  placeholder="Enter product name"
                  class="form-control"
                  [class.error]="productForm.get('name')?.invalid && productForm.get('name')?.touched"
                >
              </div>

              <div class="form-group">
                <label for="category">Category *</label>
                <select 
                  id="category" 
                  formControlName="category"
                  class="form-control"
                  [class.error]="productForm.get('category')?.invalid && productForm.get('category')?.touched"
                >
                  <option value="">Select Category</option>
                  <option *ngFor="let category of categories" [value]="category">{{ category }}</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label for="description">Description</label>
                <textarea 
                  id="description" 
                  formControlName="description"
                  placeholder="Enter product description"
                  class="form-control"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-group">
                <label for="barcode">Barcode *</label>
                <div class="barcode-input">
                  <input 
                    id="barcode" 
                    type="text" 
                    formControlName="barcode"
                    placeholder="Scan or enter barcode"
                    class="form-control"
                    [class.error]="productForm.get('barcode')?.invalid && productForm.get('barcode')?.touched"
                  >
                  <button type="button" class="scan-btn" (click)="scanBarcode()">📷</button>
                </div>
              </div>

              <div class="form-group">
                <label for="costPrice">Cost Price *</label>
                <input 
                  id="costPrice" 
                  type="number" 
                  formControlName="costPrice"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  class="form-control"
                  [class.error]="productForm.get('costPrice')?.invalid && productForm.get('costPrice')?.touched"
                >
              </div>

              <div class="form-group">
                <label for="price">Selling Price *</label>
                <input 
                  id="price" 
                  type="number" 
                  formControlName="price"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  class="form-control"
                  [class.error]="productForm.get('price')?.invalid && productForm.get('price')?.touched"
                >
              </div>

              <div class="form-group">
                <label for="stock">Initial Stock *</label>
                <input 
                  id="stock" 
                  type="number" 
                  formControlName="stock"
                  placeholder="0"
                  min="0"
                  class="form-control"
                  [class.error]="productForm.get('stock')?.invalid && productForm.get('stock')?.touched"
                >
              </div>

              <div class="form-group">
                <label for="minStockAlert">Min Stock Alert *</label>
                <input 
                  id="minStockAlert" 
                  type="number" 
                  formControlName="minStockAlert"
                  placeholder="5"
                  min="0"
                  class="form-control"
                  [class.error]="productForm.get('minStockAlert')?.invalid && productForm.get('minStockAlert')?.touched"
                >
              </div>
            </div>

            <div class="profit-preview" *ngIf="productForm.get('costPrice')?.value && productForm.get('price')?.value">
              <div class="profit-info">
                <span>Profit Margin: </span>
                <strong>{{ calculateProfit() | number:'1.1-1' }}%</strong>
                <span>(₹{{ calculateProfitAmount() | number:'1.2-2' }} per item)</span>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="modal-btn secondary" (click)="closeProductModal()">
                Cancel
              </button>
              <button 
                type="submit" 
                class="modal-btn primary" 
                [disabled]="productForm.invalid || isSaving"
              >
                {{ isSaving ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product') }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Stock Adjustment Modal -->
      <div class="modal-overlay" *ngIf="showStockModal" (click)="closeStockModal()">
        <div class="stock-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>📦 Adjust Stock - {{ selectedProduct?.name }}</h3>
            <button class="close-btn" (click)="closeStockModal()">×</button>
          </div>
          
          <div class="stock-content">
            <div class="current-stock">
              <span class="stock-label">Current Stock:</span>
              <span class="stock-value">{{ selectedProduct?.stock }}</span>
            </div>

            <div class="stock-adjustment">
              <div class="adjustment-type">
                <label>
                  <input type="radio" [(ngModel)]="stockAdjustmentType" value="add">
                  ➕ Add Stock
                </label>
                <label>
                  <input type="radio" [(ngModel)]="stockAdjustmentType" value="remove">
                  ➖ Remove Stock
                </label>
                <label>
                  <input type="radio" [(ngModel)]="stockAdjustmentType" value="set">
                  📝 Set Stock
                </label>
              </div>

              <div class="adjustment-input">
                <label for="adjustmentQuantity">
                  {{ stockAdjustmentType === 'set' ? 'Set to:' : 'Quantity:' }}
                </label>
                <input 
                  id="adjustmentQuantity"
                  type="number" 
                  [(ngModel)]="stockAdjustmentQuantity"
                  placeholder="Enter quantity"
                  min="0"
                  class="form-control"
                >
              </div>

              <div class="adjustment-reason">
                <label for="adjustmentReason">Reason:</label>
                <select 
                  id="adjustmentReason"
                  [(ngModel)]="stockAdjustmentReason" 
                  class="form-control"
                >
                  <option value="">Select reason</option>
                  <option value="Purchase">New Purchase</option>
                  <option value="Return">Customer Return</option>
                  <option value="Damage">Damage/Loss</option>
                  <option value="Theft">Theft</option>
                  <option value="Correction">Stock Correction</option>
                  <option value="Transfer">Transfer</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div class="new-stock-preview" *ngIf="stockAdjustmentQuantity">
                <span>New Stock Level: </span>
                <strong>{{ getNewStockLevel() }}</strong>
              </div>
            </div>

            <div class="modal-actions">
              <button class="modal-btn secondary" (click)="closeStockModal()">
                Cancel
              </button>
              <button 
                class="modal-btn primary" 
                (click)="adjustStock()"
                [disabled]="!stockAdjustmentQuantity || !stockAdjustmentReason"
              >
                Adjust Stock
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./inventory.css']
})
export class InventoryComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = ['Electronics', 'Accessories', 'Computers', 'Mobile', 'Gaming'];
  lowStockProducts: Product[] = [];
  
  searchQuery = '';
  selectedCategory = '';
  viewMode: 'grid' | 'table' = 'grid';
  
  showProductModal = false;
  showStockModal = false;
  editingProduct: Product | null = null;
  selectedProduct: Product | null = null;
  isSaving = false;

  stockAdjustmentType: 'add' | 'remove' | 'set' = 'add';
  stockAdjustmentQuantity: number = 0;
  stockAdjustmentReason = '';

  productForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      category: ['', Validators.required],
      barcode: ['', Validators.required],
      costPrice: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      minStockAlert: [5, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    // Load from localStorage or initialize with mock data
    const savedProducts = localStorage.getItem('wallettracker_products');
    if (savedProducts) {
      this.products = JSON.parse(savedProducts);
    } else {
      // Initialize with mock products
      this.products = [
        {
          id: 'P001',
          name: 'Bluetooth Headphones',
          description: 'Wireless stereo headphones with noise cancellation',
          price: 1299.00,
          costPrice: 800.00,
          stock: 25,
          minStockAlert: 5,
          category: 'Electronics',
          barcode: '1234567890123',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'P002',
          name: 'Phone Case',
          description: 'Protective case for smartphones',
          price: 299.00,
          costPrice: 150.00,
          stock: 50,
          minStockAlert: 10,
          category: 'Accessories',
          barcode: '2345678901234',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'P003',
          name: 'USB Cable',
          description: 'High-speed USB charging cable',
          price: 149.00,
          costPrice: 75.00,
          stock: 3,
          minStockAlert: 15,
          category: 'Accessories',
          barcode: '3456789012345',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      this.saveProducts();
    }
    
    this.filterProducts();
    this.updateLowStockProducts();
  }

  saveProducts() {
    localStorage.setItem('wallettracker_products', JSON.stringify(this.products));
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchQuery || 
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.barcode.includes(this.searchQuery);
      
      const matchesCategory = !this.selectedCategory || product.category === this.selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }

  updateLowStockProducts() {
    this.lowStockProducts = this.products.filter(p => p.stock <= p.minStockAlert);
  }

  openAddProductModal() {
    this.editingProduct = null;
    this.productForm.reset({
      stock: 0,
      minStockAlert: 5
    });
    this.showProductModal = true;
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.productForm.patchValue(product);
    this.showProductModal = true;
  }

  closeProductModal() {
    this.showProductModal = false;
    this.editingProduct = null;
    this.productForm.reset();
  }

  saveProduct() {
    if (this.productForm.invalid) return;

    this.isSaving = true;
    const formValue = this.productForm.value;

    if (this.editingProduct) {
      // Update existing product
      const index = this.products.findIndex(p => p.id === this.editingProduct!.id);
      if (index !== -1) {
        this.products[index] = {
          ...this.products[index],
          ...formValue,
          updatedAt: new Date()
        };
      }
    } else {
      // Add new product
      const newProduct: Product = {
        id: 'P' + Date.now(),
        ...formValue,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.products.push(newProduct);
    }

    this.saveProducts();
    this.filterProducts();
    this.updateLowStockProducts();
    
    setTimeout(() => {
      this.isSaving = false;
      this.closeProductModal();
    }, 500);
  }

  deleteProduct(productId: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.products = this.products.filter(p => p.id !== productId);
      this.saveProducts();
      this.filterProducts();
      this.updateLowStockProducts();
    }
  }

  openStockModal(product: Product) {
    this.selectedProduct = product;
    this.stockAdjustmentType = 'add';
    this.stockAdjustmentQuantity = 0;
    this.stockAdjustmentReason = '';
    this.showStockModal = true;
  }

  closeStockModal() {
    this.showStockModal = false;
    this.selectedProduct = null;
  }

  adjustStock() {
    if (!this.selectedProduct || !this.stockAdjustmentQuantity || !this.stockAdjustmentReason) return;

    const product = this.products.find(p => p.id === this.selectedProduct!.id);
    if (!product) return;

    let newStock = product.stock;
    
    switch (this.stockAdjustmentType) {
      case 'add':
        newStock += this.stockAdjustmentQuantity;
        break;
      case 'remove':
        newStock = Math.max(0, newStock - this.stockAdjustmentQuantity);
        break;
      case 'set':
        newStock = this.stockAdjustmentQuantity;
        break;
    }

    product.stock = newStock;
    product.updatedAt = new Date();

    // Record stock movement
    this.recordStockMovement(product, this.stockAdjustmentType, this.stockAdjustmentQuantity, this.stockAdjustmentReason);

    this.saveProducts();
    this.filterProducts();
    this.updateLowStockProducts();
    this.closeStockModal();
  }

  recordStockMovement(product: Product, type: string, quantity: number, reason: string) {
    const movements = JSON.parse(localStorage.getItem('wallettracker_stock_movements') || '[]');
    const movement: StockMovement = {
      id: 'SM' + Date.now(),
      productId: product.id,
      productName: product.name,
      type: type.toUpperCase() as 'IN' | 'OUT' | 'ADJUSTMENT',
      quantity: quantity,
      reason: reason,
      timestamp: new Date(),
      user: 'Current User'
    };
    movements.push(movement);
    localStorage.setItem('wallettracker_stock_movements', JSON.stringify(movements));
  }

  getNewStockLevel(): number {
    if (!this.selectedProduct || !this.stockAdjustmentQuantity) return 0;
    
    switch (this.stockAdjustmentType) {
      case 'add':
        return this.selectedProduct.stock + this.stockAdjustmentQuantity;
      case 'remove':
        return Math.max(0, this.selectedProduct.stock - this.stockAdjustmentQuantity);
      case 'set':
        return this.stockAdjustmentQuantity;
      default:
        return this.selectedProduct.stock;
    }
  }

  scanBarcode() {
    // Mock barcode scanning
    const mockBarcode = '123456789' + Math.floor(Math.random() * 10000);
    this.productForm.patchValue({ barcode: mockBarcode });
    alert('📷 Barcode scanned: ' + mockBarcode);
  }

  calculateProfit(): number {
    const costPrice = this.productForm.get('costPrice')?.value || 0;
    const sellPrice = this.productForm.get('price')?.value || 0;
    if (costPrice === 0) return 0;
    return ((sellPrice - costPrice) / costPrice) * 100;
  }

  calculateProfitAmount(): number {
    const costPrice = this.productForm.get('costPrice')?.value || 0;
    const sellPrice = this.productForm.get('price')?.value || 0;
    return sellPrice - costPrice;
  }

  getTotalInventoryValue(): number {
    return this.products.reduce((total, product) => total + (product.price * product.stock), 0);
  }

  getProfit(product: Product): number {
    if (product.costPrice === 0) return 0;
    return ((product.price - product.costPrice) / product.costPrice) * 100;
  }

  getStockPercentage(product: Product): number {
    const maxStock = Math.max(product.minStockAlert * 3, 100);
    return Math.min((product.stock / maxStock) * 100, 100);
  }

  getStockStatus(product: Product): string {
    if (product.stock === 0) return 'Out of Stock';
    if (product.stock <= product.minStockAlert) return 'Low Stock';
    return 'In Stock';
  }}