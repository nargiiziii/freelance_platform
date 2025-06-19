// Импортируем express для создания маршрутизатора
import express from 'express';

import {
  registerUser,
  loginUser,
  getProfile,
  logoutUser,
} from '../controllers/authController.js';

import { verifyToken } from '../middleware/jwtMiddleware.js';

const router = express.Router(); 

// Маршрут для регистрации нового пользователя
router.post('/register', registerUser);

// Маршрут для входа пользователя в систему (логин)
router.post('/login', loginUser);

// Маршрут для выхода пользователя из системы
router.post('/logout', logoutUser);

// Защищённый маршрут: получение данных профиля текущего пользователя
router.get('/profile', verifyToken, getProfile);

export default router; 
