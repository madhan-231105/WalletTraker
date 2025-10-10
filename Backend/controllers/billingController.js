import mongoose from 'mongoose';
import Bill from '../models/Bill.js';
import Product from '../models/Product.js';

export const createBill = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { billNumber, items, subtotal, tax, discount, total, paymentMethod, customerPhone, timestamp } = req.body;

    console.log('📦 Request body:', JSON.stringify(req.body, null, 2));

    // Validate required fields
    if (!billNumber || !items || !Array.isArray(items) || items.length === 0 || !total) {
      throw new Error('billNumber, items (non-empty array), and total are required');
    }

    const enrichedItems = await Promise.all(
      items.map(async (item, index) => {
        console.log(`🔍 Processing item[${index}]:`, JSON.stringify(item, null, 2));

        // Extract productId from possible formats
        let productId;
        if (item.productId) {
          productId = item.productId; // Direct productId
        } else if (item.product) {
          if (typeof item.product === 'string') {
            productId = item.product; // Product is a string ID
          } else if (typeof item.product === 'object' && item.product._id) {
            productId = item.product._id; // Product is an object with _id
          } else {
            throw new Error(`Item[${index}] has invalid product format: ${JSON.stringify(item.product)}`);
          }
        } else {
          throw new Error(`Item[${index}] is missing productId or product`);
        }

        console.log(`🔍 Extracted productId for item[${index}]:`, productId, 'Type:', typeof productId);

        // Validate ObjectId
        if (!mongoose.isValidObjectId(productId)) {
          throw new Error(`Invalid productId in item[${index}]: ${productId}`);
        }

        // Fetch product from database
        const product = await Product.findById(productId).session(session);

        if (!product) {
          throw new Error(`Product not found for item[${index}]: ${productId}`);
        }

        console.log(`✅ Found product for item[${index}]:`, product.name, 'with ID:', product._id);

        // Validate stock
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name} (Available: ${product.stock}, Requested: ${item.quantity})`);
        }

        // Reduce stock
        product.stock -= item.quantity;
        product.updatedAt = new Date();
        await product.save({ session });

        // Return enriched item
        return {
          productId: product._id, // Ensure ObjectId
          quantity: item.quantity,
          subtotal: item.subtotal || product.price * item.quantity,
        };
      })
    );

    console.log('✅ Enriched items:', JSON.stringify(enrichedItems, null, 2));

    // Prepare bill data
    const billData = {
      billNumber,
      items: enrichedItems,
      subtotal,
      tax: tax || 0,
      discount: discount || 0,
      total,
      paymentMethod,
      customerPhone: customerPhone || null,
      timestamp: timestamp ? new Date(timestamp) : new Date(),
      user: req.user?.id || null,
    };

    console.log('📝 Creating bill with data:', JSON.stringify(billData, null, 2));

    // Create bill
    const bill = await Bill.create([billData], { session });

    await session.commitTransaction();

    console.log('✅ Bill created successfully:', bill[0]._id);

    return res.status(201).json({
      message: 'Bill created successfully',
      bill: bill[0],
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('❌ Error creating bill:', error.message);
    console.error('❌ Stack:', error.stack);

    return res.status(error.name === 'ValidationError' ? 400 : 500).json({
      message: 'Failed to create bill',
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};