import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js';

import authRoutes from './src/routes/authRoutes.js';
import refreshRoutes from './src/routes/refreshTokenRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import proposalRoutes from './src/routes/proposalRoutes.js';
import escrowRoutes from "./src/routes/escrowRoutes.js";
import messageRoutes from "./src/routes/messageRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Кросс-домен + КУКИ
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"], // 👈 обязательно PATCH здесь!
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Парсим JSON и cookies
app.use(cookieParser());
app.use(express.json());

// ✅ Папка для загруженных файлов
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Подключаем БД
connectDB();

// ✅ Подключаем роуты
app.use('/api/auth', authRoutes);
app.use('/api/auth', refreshRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/proposals', proposalRoutes);
app.use("/api/escrow", escrowRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Проверка сервера
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// ✅ Запуск
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
