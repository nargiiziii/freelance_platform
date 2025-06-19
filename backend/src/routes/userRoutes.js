import express from 'express';
import multer from 'multer';
import {
  updateUser,
  addPortfolioItem,
  getUser,
  topUpBalance,
  getFreelancers
} from '../controllers/userController.js';
import { verifyToken } from '../middleware/jwtMiddleware.js';

const router = express.Router();

// Настройка хранения файлов для загрузки
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

// Обновление данных пользователя
router.put('/:id', updateUser);

// Загрузка элемента портфолио (требует токен)
router.post('/portfolio', verifyToken, upload.single('image'), addPortfolioItem);

// Получение пользователя по ID
router.get('/:id', getUser);

// Пополнение баланса (требует токен)
router.post("/top-up", verifyToken, topUpBalance);

// Получение списка всех фрилансеров
router.get('/freelancers/all', getFreelancers);

export default router;
