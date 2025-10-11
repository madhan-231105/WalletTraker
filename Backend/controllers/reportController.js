import Bill from '../models/Bill.js';
import Product from '../models/Product.js';

export const getTodayReport = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // 1️⃣ Get all bills for today
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

    // ✅ Response
    res.status(200).json({
      summary: {
        totalSales,
        transactionCount,
        avgTransactionValue,
        totalItemsSold
      },
      paymentBreakdown,
      topSellingItems,
      transactions
    });
  } catch (error) {
    console.error('❌ Error generating today report:', error);
    res.status(500).json({ message: 'Failed to generate report', error: error.message });
  }
};
