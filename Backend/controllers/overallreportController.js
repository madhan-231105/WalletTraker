import Bill from '../models/Bill.js';
import Product from '../models/Product.js';

export const getOverallReport = async (req, res) => {
  try {
    // 1️⃣ Fetch all bills and products
    const bills = await Bill.find().populate('items.productId');
    const products = await Product.find();

    // 2️⃣ Handle empty data
    if (!bills.length && !products.length) {
      return res.status(200).json({
        inventoryReport: [],
        inventorySummary: { totalProducts: 0, outOfStock: 0, lowStock: 0 },
        paymentBreakdown: {
          cash: 0, upi: 0, card: 0,
          cashPercentage: 0, upiPercentage: 0, cardPercentage: 0
        },
        topProducts: [],
        transactions: [],
        totalRevenue: 0
      });
    }

    // 3️⃣ Inventory summary
    const totalProducts = products.length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length;

    // 4️⃣ Total revenue (all received amounts)
  const totalRevenue = bills.reduce((sum, b) => sum + (b.total || 0), 0);

    // 5️⃣ Payment breakdown
    const breakdown = { cash: 0, upi: 0, card: 0 };
    bills.forEach(b => {
      const method = ['cash', 'upi', 'card'].includes(b.paymentMethod?.toLowerCase())
        ? b.paymentMethod.toLowerCase()
        : null;
      if (method) breakdown[method] += (b.total || 0);
    });

    const totalPayment = breakdown.cash + breakdown.upi + breakdown.card;
    const paymentBreakdown = {
      ...breakdown,
      cashPercentage: totalPayment ? Number(((breakdown.cash / totalPayment) * 100).toFixed(1)) : 0,
      upiPercentage: totalPayment ? Number(((breakdown.upi / totalPayment) * 100).toFixed(1)) : 0,
      cardPercentage: totalPayment ? Number(((breakdown.card / totalPayment) * 100).toFixed(1)) : 0
    };

    // 6️⃣ Top-selling products
    const productMap = {};
    bills.forEach(bill => {
      bill.items?.forEach(item => {
        const product = item.productId;
        if (!product) return;
        const key = product._id.toString();
        if (!productMap[key]) {
          productMap[key] = { name: product.name, category: product.category, unitsSold: 0, revenue: 0 };
        }
        productMap[key].unitsSold += item.quantity;
        productMap[key].revenue += item.subtotal || 0;
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 7️⃣ Transaction history
    const transactions = bills
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .map(bill => ({
        billNumber: bill.billNumber,
        time: bill.timestamp,
        amount: bill.total || 0,
        paymentMethod: bill.paymentMethod || 'unknown',
        itemCount: bill.items?.reduce((s, i) => s + i.quantity, 0) || 0
      }));

    // 8️⃣ Inventory report
    const inventoryReport = products.map(product => ({
      id: product._id,
      name: product.name,
      category: product.category,
      stock: product.stock
    }));

    // 9️⃣ Response
    res.status(200).json({
      inventoryReport,
      inventorySummary: { totalProducts, outOfStock, lowStock },
      paymentBreakdown,
      topProducts,
      transactions,
      totalRevenue
    });

  } catch (error) {
    console.error('❌ Error generating overall report:', error);
    res.status(500).json({ message: 'Failed to generate overall report', error: error.message });
  }
};
