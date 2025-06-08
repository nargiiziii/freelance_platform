// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // импортируем cors
import connectDB from './src/config/db.js'; // путь до твоего db.js

dotenv.config();

const app = express();
console.log('process.env.PORT:', process.env.PORT);
const PORT = process.env.PORT || 3000;

// Настраиваем CORS, чтобы разрешить запросы с фронтенда на localhost:5173
app.use(cors({
  origin: 'http://localhost:5173',  // Адрес твоего React фронтенда
  credentials: true,                 // Если нужны куки или авторизация
}));

app.use(express.json());

// Подключение к базе данных
connectDB();

// Твои маршруты
import authRoutes from './src/routes/authRoutes.js';
import refreshRoutes from './src/routes/refreshTokenRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/auth', refreshRoutes);

app.get('/', (req, res) => {
  res.send('Backend is running');
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
