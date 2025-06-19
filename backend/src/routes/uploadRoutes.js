// Импорт зависимостей
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Получение текущего пути
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Создание роутера
const router = express.Router();

// Настройка хранения файлов
const storage = multer.diskStorage({
  // Папка для загрузки
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  // Название файла с таймстемпом
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/\s+/g, '_'); 
    cb(null, `${timestamp}-${safeName}`);
  },
});

// Middleware для загрузки одного файла
const upload = multer({ storage });

// Обработка загрузки и ответ с URL
router.post('/', upload.single('image'), (req, res) => {
  res.json({ url: `/uploads/${req.file.filename}` });
});

// Экспорт роутера
export default router;
