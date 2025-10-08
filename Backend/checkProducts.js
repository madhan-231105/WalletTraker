import mongoose from 'mongoose';
import Product from './models/Product.js'; // adjust path if needed
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;

async function checkProducts() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Fetch some products
    const products = await Product.find().limit(5); // get 5 products for inspection
    console.log('Sample products:', products);

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ MongoDB error:', err);
  }
}

checkProducts();
