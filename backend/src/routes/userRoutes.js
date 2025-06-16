import express from 'express';
import multer from 'multer';
import {
  updateUser,
  addPortfolioItem,
  getUser
} from '../controllers/userController.js';
import { verifyToken } from '../middleware/jwtMiddleware.js'; // ✅ Исправлено

const router = express.Router();

// 📂 Настройка хранения файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ Маршруты
router.put('/:id', updateUser);

// ✅ Добавляем проверку токена перед загрузкой портфолио
router.post('/portfolio', verifyToken, upload.single('image'), addPortfolioItem);

// ✅ Получение пользователя по ID
router.get('/:id', getUser);

export default router;
