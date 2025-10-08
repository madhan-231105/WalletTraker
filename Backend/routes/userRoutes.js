import express from 'express';
import {
  registerUser,
  loginUser,
  socialLogin,
  getMe,
  verifyToken
} from '../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', socialLogin);
router.post('/github', socialLogin);
router.get('/me', verifyToken, getMe);

router.post('/refresh', (req, res) => {
  res.status(501).json({ message: 'Refresh token not implemented' });
});
router.post('/logout', (req, res) => {
  res.status(501).json({ message: 'Logout not implemented' });
});
router.post('/change-password', (req, res) => {
  res.status(501).json({ message: 'Change password not implemented' });
});

export default router;