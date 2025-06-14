import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser'; // 👈 добавлено
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js';

import authRoutes from './src/routes/authRoutes.js';
import refreshRoutes from './src/routes/refreshTokenRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import proposalRoutes from './src/routes/proposalRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use(cookieParser()); // 👈 обязательно для чтения токенов из cookie
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/auth', refreshRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/proposals', proposalRoutes);

app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
