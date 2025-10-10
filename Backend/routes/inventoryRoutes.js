import express from 'express';
import { getProducts, createProduct, createProductsBulk, deleteProduct,updateProduct,updateStock  } from '../controllers/inventoryController.js';
import { verifyToken } from '../controllers/userController.js';

const router = express.Router();

router.get('/products', verifyToken, getProducts);
router.post('/products', verifyToken, createProduct);
router.post('/products/bulk', verifyToken, createProductsBulk);
router.put('/products/:id', verifyToken, updateProduct);          // Edit product
router.put('/products/:id/stock', verifyToken, updateStock);      // Update stock
router.delete('/products/:id', verifyToken, deleteProduct);       // Delete product

export default router;