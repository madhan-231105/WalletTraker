import express from 'express';
import { getTodayReport } from '../controllers/reportController.js';
import { verifyToken } from '../controllers/userController.js';

const router = express.Router();

router.get('/today', verifyToken, getTodayReport);

export default router;
