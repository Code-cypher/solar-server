import { Router } from 'express';
import verifyToken from '../middleware/authMiddleware.js';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
  changePassword
} from '../controllers/authController.js';

const authRouter = Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.get('/me', verifyToken, getCurrentUser);
authRouter.put('/profile', verifyToken, updateUserProfile);
authRouter.put('/change-password', verifyToken, changePassword);

export default authRouter;
