import Bill from '../models/Bill.js';
import Product from '../models/Product.js';

const dashboardController = {
  // Helper function to get today's report data (exact same logic as getTodayReport)
  async getTodayReportData(userId) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 1️⃣ Get all bills for today, filtered by userId
    const bills = await Bill.find({
      timestamp: { $gte: startOfDay, $lte: endOfDay }
    }).populate('items.productId');

    if (bills.length === 0) {
      return res.status(200).json({
        summary: {
          totalSales: 0,
          transactionCount: 0,
          avgTransactionValue: 0,
          totalItemsSold: 0
        },
        paymentBreakdown: {
          cash: 0,
          upi: 0,
          card: 0,
          cashPercentage: 0,
          upiPercentage: 0,
          cardPercentage: 0
        },
        topSellingItems: [],
        transactions: []
      });
    }

    // 2️⃣ Calculate summary
    const totalSales = bills.reduce((sum, b) => sum + b.total, 0);
    const transactionCount = bills.length;
    const avgTransactionValue = totalSales / transactionCount;

    const totalItemsSold = bills.reduce(
      (sum, b) => sum + b.items.reduce((s, i) => s + i.quantity, 0),
      0
    );

    // 3️⃣ Payment breakdown
     const breakdown = { cash: 0, upi: 0, card: 0 };
    bills.forEach(b => {
      const method = b.paymentMethod?.toLowerCase();
      if (breakdown[method] !== undefined) {
        breakdown[method] += b.total;
      }
    });

    const total = breakdown.cash + breakdown.upi + breakdown.card;
    const paymentBreakdown = {
      ...breakdown,
      cashPercentage: total ? ((breakdown.cash / total) * 100).toFixed(1) : 0,
      upiPercentage: total ? ((breakdown.upi / total) * 100).toFixed(1) : 0,
      cardPercentage: total ? ((breakdown.card / total) * 100).toFixed(1) : 0
    };


    // 4️⃣ Top-selling items
    const productMap = {};
    bills.forEach(bill => {
      bill.items.forEach(item => {
        const product = item.productId;
        if (!product) return;
        const key = product._id.toString();
        if (!productMap[key]) {
          productMap[key] = {
            name: product.name,
            category: product.category,
            soldQuantity: 0,
            revenue: 0
          };
        }
        productMap[key].soldQuantity += item.quantity;
        productMap[key].revenue += item.subtotal;
      });
    });

    const topSellingItems = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 5️⃣ Transaction history
    const transactions = bills
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(bill => ({
        billNumber: bill.billNumber,
        time: bill.timestamp,
        amount: bill.total,
        paymentMethod: bill.paymentMethod,
        itemCount: bill.items.reduce((s, i) => s + i.quantity, 0)
      }));

    return {
      summary: {
        totalSales,
        transactionCount,
        avgTransactionValue,
        totalItemsSold
      },
      paymentBreakdown,
      topSellingItems,
      transactions
    };
  },

  // Get Dashboard Statistics
  getDashboardStats: async (req, res) => {
    try {
      const userId = req.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Get today's data
      const todayData = await dashboardController.getTodayReportData(userId);

      // Yesterday's Sales for salesGrowth
      const yesterdayBills = await Bill.find({
        userId,
        timestamp: { $gte: yesterday, $lt: today }
      });
      const yesterdaySales = yesterdayBills.reduce((sum, bill) => sum + bill.total, 0);
      const salesGrowth = yesterdaySales > 0 
        ? ((todayData.summary.totalSales - yesterdaySales) / yesterdaySales * 100).toFixed(1)
        : 0;

      // Low Stock Count
      const lowStockProducts = await Product.find({
        userId,
        quantity: { $lte: 10 }
      });

      res.json({
        success: true,
        data: {
          todaySales: todayData.summary.totalSales,
          salesGrowth: parseFloat(salesGrowth),
          todayTransactions: todayData.summary.transactionCount,
          avgTransactionValue: todayData.summary.avgTransactionValue,
          totalItemsSold: todayData.summary.totalItemsSold,
          lowStockCount: lowStockProducts.length,
          paymentBreakdown: todayData.paymentBreakdown
        }
      });
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
        error: error.message
      });
    }
  },

  // Get Top Selling Items Today
  getTopSellingItems: async (req, res) => {
    try {
      const userId = req.user.id;
      const todayData = await dashboardController.getTodayReportData(userId);

      res.json({ 
        success: true, 
        data: todayData.topSellingItems 
      });
    } catch (error) {
      console.error('❌ Error fetching top selling items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch top selling items',
        error: error.message
      });
    }
  },

  // Get Recent Transactions
  getRecentTransactions: async (req, res) => {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 5;

      const todayData = await dashboardController.getTodayReportData(userId);

      // Return limited transactions
      const limitedTransactions = todayData.transactions.slice(0, limit);

      res.json({ 
        success: true, 
        data: limitedTransactions 
      });
    } catch (error) {
      console.error('❌ Error fetching recent transactions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recent transactions',
        error: error.message
      });
    }
  },

  // Get Complete Dashboard Data
  getCompleteDashboard: async (req, res) => {
    try {
      const userId = req.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Get today's data
      const todayData = await dashboardController.getTodayReportData(userId);

      // Yesterday's Sales for salesGrowth
      const yesterdayBills = await Bill.find({
        userId,
        timestamp: { $gte: yesterday, $lt: today }
      });
      const yesterdaySales = yesterdayBills.reduce((sum, bill) => sum + bill.total, 0);
      const salesGrowth = yesterdaySales > 0 
        ? ((todayData.summary.totalSales - yesterdaySales) / yesterdaySales * 100).toFixed(1)
        : 0;

      // Low Stock Count
      const lowStockProducts = await Product.find({
        userId,
        quantity: { $lte: 10 }
      });

      res.json({
        success: true,
        data: {
          stats: {
            todaySales: todayData.summary.totalSales,
            salesGrowth: parseFloat(salesGrowth),
            todayTransactions: todayData.summary.transactionCount,
            avgTransactionValue: todayData.summary.avgTransactionValue,
            totalItemsSold: todayData.summary.totalItemsSold,
            lowStockCount: lowStockProducts.length,
            paymentBreakdown: todayData.paymentBreakdown
          },
          topSellingItems: todayData.topSellingItems,
          recentTransactions: todayData.transactions
        }
      });
    } catch (error) {
      console.error('❌ Error fetching complete dashboard:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard data',
        error: error.message
      });
    }
  },

  // Get Weekly Sales Trend
  getWeeklySalesTrend: async (req, res) => {
    try {
      const userId = req.user.id;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const bills = await Bill.find({
        userId,
        timestamp: { $gte: weekAgo, $lt: today }
      });

      const dailySales = {};
      for (let i = 0; i < 7; i++) {
        const date = new Date(weekAgo);
        date.setDate(date.getDate() + i);
        const dateKey = date.toISOString().split('T')[0];
        dailySales[dateKey] = { date: dateKey, sales: 0, transactions: 0 };
      }

      bills.forEach(bill => {
        const dateKey = bill.timestamp.toISOString().split('T')[0];
        if (dailySales[dateKey]) {
          dailySales[dateKey].sales += bill.total;
          dailySales[dateKey].transactions += 1;
        }
      });

      res.json({ 
        success: true, 
        data: Object.values(dailySales) 
      });
    } catch (error) {
      console.error('❌ Error fetching weekly sales trend:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch weekly sales trend',
        error: error.message
      });
    }
  }
};

export default dashboardController;