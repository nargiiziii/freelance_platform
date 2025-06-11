import express from 'express';
import multer from 'multer';
import {
  updateUser,
  addPortfolioItem,
  getUser // ✅ импортируем getUser
} from '../controllers/userController.js';

const router = express.Router();

// Настройка хранения файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // папка для сохранения
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// 👇 Маршруты
router.put('/:id', updateUser);
router.post('/portfolio', upload.single('image'), addPortfolioItem);

// ✅ Добавлен маршрут для получения пользователя по ID
router.get('/:id', getUser);

export default router;
