import express from 'express';
import { registerUser, loginUser, getProfile } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/jwtMiddleware.js';

const router = express.Router();

// Регистрация
router.post('/register', registerUser);

// Логин
router.post('/login', loginUser);

// 🔐 Защищённый маршрут — получить профиль
router.get('/profile', authMiddleware, getProfile);

export default router;
