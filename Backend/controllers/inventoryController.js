import mongoose from 'mongoose';
import Product from '../models/Product.js';
import StockMovement from '../models/StockMovement.js';
import { verifyToken } from './userController.js';

// Middleware to validate ObjectId
export const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!id || id === 'undefined' || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Valid Product ID is required' });
  }
  next();
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ userId: req.user.id });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, costPrice, stock, minStockAlert, category, barcode, image } = req.body;
    if (!name || !price || !costPrice || !stock || !minStockAlert || !category || !barcode) {
      return res.status(400).json({ message: 'Name, price, costPrice, stock, minStockAlert, category, and barcode are required' });
    }

    const product = await Product.create({
      name,
      description: description || '',
      price,
      costPrice,
      stock,
      minStockAlert,
      category,
      barcode,
      userId: req.user.id,
      image
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

export const createProductsBulk = async (req, res) => {
  try {
    const products = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'Array of products is required' });
    }

    const productsWithUserId = products.map(product => ({
      ...product,
      userId: req.user.id
    }));

    const operations = productsWithUserId.map(product => ({
      updateOne: {
        filter: { _id: product._id || new mongoose.Types.ObjectId() },
        update: { $set: product },
        upsert: true
      }
    }));

    await Product.bulkWrite(operations);

    res.status(200).json({ message: 'Products bulk updated/created successfully' });
  } catch (error) {
    console.error('Bulk create/update products error:', error);
    res.status(500).json({ message: 'Error updating/creating products', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (!product.userId.equals(req.user.id))
      return res.status(403).json({ message: 'Unauthorized to delete this product' });

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully', product });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, costPrice, stock, minStockAlert, category, barcode, image } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (!product.userId.equals(req.user.id))
      return res.status(403).json({ message: 'Unauthorized to update this product' });

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.costPrice = costPrice !== undefined ? costPrice : product.costPrice;
    product.stock = stock !== undefined ? stock : product.stock;
    product.minStockAlert = minStockAlert !== undefined ? minStockAlert : product.minStockAlert;
    product.category = category || product.category;
    product.barcode = barcode || product.barcode;
    product.image = image || product.image;

    await product.save();
    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    let { type, quantity, reason } = req.body;

    if (!type || !quantity || !reason) {
      return res.status(400).json({ message: 'Type, quantity, and reason are required' });
    }

    quantity = Number(quantity);
    if (isNaN(quantity) || quantity < 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number' });
    }

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (!product.userId.equals(req.user.id))
      return res.status(403).json({ message: 'Unauthorized to update stock' });

    let newStock;
    switch (type) {
      case 'IN':
        newStock = product.stock + quantity;
        break;
      case 'OUT':
        newStock = Math.max(0, product.stock - quantity);
        break;
      case 'ADJUSTMENT':
        newStock = quantity;
        break;
      default:
        return res.status(400).json({ message: 'Invalid stock adjustment type' });
    }

    // Update only the stock field, avoiding full document validation
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { stock: newStock },
      { new: true } // return updated document
    );

    // Log stock movement
    await StockMovement.create({
      productId: updatedProduct._id,
      productName: updatedProduct.name,
      type,
      quantity,
      reason,
      user: req.user.id
    });

    res.json({ message: 'Stock updated successfully', product: updatedProduct });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Failed to update stock', error: error.message });
  }
};
