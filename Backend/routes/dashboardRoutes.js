// routes/dashboardRoutes.js
import express from 'express';
const router = express.Router();
import dashboardController from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

// All routes require authentication
router.use(authenticateToken);

// Get dashboard statistics only
router.get('/stats', dashboardController.getDashboardStats);

// Get top selling items
router.get('/top-selling', dashboardController.getTopSellingItems);

// Get recent transactions
router.get('/recent-transactions', dashboardController.getRecentTransactions);

// Get complete dashboard data (recommended - single API call)
router.get('/complete', dashboardController.getCompleteDashboard);

// Get weekly sales trend
router.get('/weekly-trend', dashboardController.getWeeklySalesTrend);

export default router