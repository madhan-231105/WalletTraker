//billingrouter.js
import express from 'express';
import { startSession } from 'mongoose';
import Bill from '../models/Bill.js';
import Product from '../models/Product.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { createBill } from '../controllers/billingController.js';

const router = express.Router();

/**
 * POST /api/billing/bills
 * Save a new bill with atomic stock updates
 */
router.post('/bills', authenticateToken, async (req, res) => {
  const session = await startSession();
  session.startTransaction();
router.post('/bills', authenticateToken, createBill);

  try {
    // ✅ Step 1: Extract and validate bill data
    const {
      billNumber,
      items,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      customerPhone,
      timestamp,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Bill must contain at least one item');
    }

    const billData = {
      billNumber,
      items,
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      customerPhone: customerPhone || '',
      timestamp: new Date(timestamp),
      user: req.user.id,
    };

    // ✅ Step 2: Validate and update product stock atomically
    for (const item of billData.items) {
      // Support both { productId } and { product: {_id: ...} }
      const productId = item.productId || item.product?._id || item.product;

      if (!productId) {
        throw new Error(`Missing product ID in bill item`);
      }

      const product = await Product.findById(productId).session(session);
      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      // Deduct stock and update timestamp
      product.stock -= item.quantity;
      product.updatedAt = new Date();
      await product.save({ session });
    }

    // ✅ Step 3: Save the bill after successful stock updates
    const bill = new Bill(billData);
    await bill.save({ session });

    // ✅ Step 4: Commit the transaction
    await session.commitTransaction();
    res.status(201).json({
      message: 'Bill saved successfully',
      bill: { ...bill.toObject(), _id: bill._id.toString() },
    });
  } catch (error) {
    // Rollback any changes
    await session.abortTransaction();
    console.error('Error saving bill:', error);
    res.status(500).json({
      message: 'Failed to save bill',
      error: error.message,
    });
  } finally {
    session.endSession();
  }
});

export default router;
