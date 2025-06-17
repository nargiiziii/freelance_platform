import express from "express";
import {
  createChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  markMessagesAsRead, // 👈 добавили
} from "../controllers/messageController.js";
import { verifyToken } from "../middleware/jwtMiddleware.js";

const router = express.Router();

// ✅ Создание чата
router.post("/create", verifyToken, createChat);

// ✅ Получение всех чатов пользователя
router.get("/chats", verifyToken, getUserChats);

// ✅ Получение сообщений по chatId
router.get("/chats/:chatId/messages", verifyToken, getChatMessages);

// ✅ Отправка сообщения
router.post("/chats/:chatId/send", verifyToken, sendMessage);

// ✅ Пометить сообщения как прочитанные
router.patch("/chats/:chatId/read", verifyToken, markMessagesAsRead); // 👈 новая строка

export default router;
