import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes/userRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import overallReportRoutes from './routes/overrallReportRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:4200',
  credentials: true
}));
app.use(express.json());

// Debug logging for requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Body:`, req.body);
  next();
});

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/reports', overallReportRoutes); 
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log('\n📋 Available endpoints:');
  console.log('\n🔐 Auth:');
  console.log('  POST   /api/auth/register');
  console.log('  POST   /api/auth/login');
  console.log('  POST   /api/auth/google');
  console.log('  POST   /api/auth/github');
  console.log('  POST   /api/auth/refresh');
  console.log('  POST   /api/auth/logout');
  console.log('  GET    /api/auth/me');
  console.log('  POST   /api/auth/change-password');
  
  console.log('\n📦 Inventory:');
  console.log('  GET    /api/inventory/products');
  console.log('  POST   /api/inventory/products');
  console.log('  POST   /api/inventory/products/bulk');
  console.log('  PUT    /api/inventory/products/:id');
  console.log('  PUT    /api/inventory/products/:id/stock');
  console.log('  DELETE /api/inventory/products/:id');
  
  console.log('\n🧾 Billing:');
  console.log('  POST   /api/billing/bills');
  
  console.log('\n📊 Dashboard:');
  console.log('  GET    /api/dashboard/stats');
  console.log('  GET    /api/dashboard/top-selling');
  console.log('  GET    /api/dashboard/recent-transactions');
  console.log('  GET    /api/dashboard/complete');
  console.log('  GET    /api/dashboard/weekly-trend');
  
  console.log('\n📈 Reports:');
  console.log('  GET    /api/reports/today');
  console.log('  GET    /api/reports/overall');
  
  console.log('\n💚 Health:');
  console.log('  GET    /health\n');
});

export default app;