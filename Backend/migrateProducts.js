import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

async function migrateProducts() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    const result = await Product.updateMany(
      {}, // all products
      {
        $set: {
          category: 'Uncategorized',
          barcode: '',
          costPrice: 0,
          minStockAlert: 5
        }
      }
    );

    console.log(`✅ Migration completed: ${result.modifiedCount} products updated.`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Migration error:', err);
  }
}

migrateProducts();
