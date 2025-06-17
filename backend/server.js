import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './src/config/db.js';

import authRoutes from './src/routes/authRoutes.js';
import refreshRoutes from './src/routes/refreshTokenRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import uploadRoutes from './src/routes/uploadRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import proposalRoutes from './src/routes/proposalRoutes.js';
import escrowRoutes from './src/routes/escrowRoutes.js';
import messageRoutes from './src/routes/messageRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ Оборачиваем Express в HTTP-сервер
const server = http.createServer(app);

// ✅ Настройка Socket.IO
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
});

// ✅ Храним активные соединения
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔌 Новый сокет:", socket.id);

  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    console.log(`👤 Пользователь ${userId} подключился`);
  });

  socket.on("typing", ({ chatId, sender, receiver }) => {
    const receiverSocket = onlineUsers.get(receiver);
    if (receiverSocket) {
      io.to(receiverSocket).emit("typing", { chatId, sender });
    }
  });

  socket.on("stopTyping", ({ chatId, sender, receiver }) => {
    const receiverSocket = onlineUsers.get(receiver);
    if (receiverSocket) {
      io.to(receiverSocket).emit("stopTyping", { chatId, sender });
    }
  });

  socket.on("newMessage", ({ message, receiver }) => {
    const receiverSocket = onlineUsers.get(receiver);
    if (receiverSocket) {
      io.to(receiverSocket).emit("messageReceived", message);
    }
  });

  socket.on("markAsRead", ({ chatId, reader }) => {
    socket.broadcast.emit("messageRead", { chatId, reader });
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
    }
    console.log("❌ Сокет отключён:", socket.id);
  });
});

// ✅ CORS + КУКИ
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Парсинг JSON и cookies
app.use(cookieParser());
app.use(express.json());

// ✅ Папка для загрузок
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Подключение к БД
connectDB();

// ✅ Роуты
app.use('/api/auth', authRoutes);
app.use('/api/auth', refreshRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/messages', messageRoutes);

// ✅ Проверка сервера
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// ✅ Запуск сервера
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
