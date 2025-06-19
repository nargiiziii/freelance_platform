import express from "express";
import {
  createChat,
  getUserChats,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
} from "../controllers/messageController.js";

import { verifyToken } from "../middleware/jwtMiddleware.js";

const router = express.Router();

// Маршрут для создания нового чата (доступен только авторизованным пользователям)
router.post("/create", verifyToken, createChat);

// Маршрут для получения всех чатов текущего пользователя
router.get("/chats", verifyToken, getUserChats);

// Маршрут для получения всех сообщений в конкретном чате по chatId
router.get("/chats/:chatId/messages", verifyToken, getChatMessages);

// Маршрут для отправки сообщения в определённый чат
router.post("/chats/:chatId/send", verifyToken, sendMessage);

// Маршрут для пометки сообщений в чате как прочитанных
router.patch("/chats/:chatId/read", verifyToken, markMessagesAsRead);

export default router;
