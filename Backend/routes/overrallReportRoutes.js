import express from 'express';
import { getOverallReport } from '../controllers/overallreportController.js';
import { verifyToken } from '../controllers/userController.js';

const router = express.Router();

router.get('/overall', verifyToken, getOverallReport);

export default router;