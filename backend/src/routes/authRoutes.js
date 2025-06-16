import express from 'express';
import {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/jwtMiddleware.js'; // ✅ правильный импорт

const router = express.Router();

// Регистрация
router.post('/register', registerUser);

// Логин
router.post('/login', loginUser);

// Выход
router.post('/logout', logoutUser);

// 🔐 Защищённый маршрут — получить профиль
router.get('/profile', verifyToken, getProfile); // ✅ исправлено

export default router;
