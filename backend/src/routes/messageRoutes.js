import express from "express";
import {
  createChat,
  getUserChats,
  getChatMessages,
  sendMessage,
} from "../controllers/messageController.js";
import { verifyToken } from "../middleware/jwtMiddleware.js";

const router = express.Router();

router.post("/create", verifyToken, createChat);
router.get("/chats", verifyToken, getUserChats);
router.get("/chats/:chatId/messages", verifyToken, getChatMessages);
router.post("/chats/:chatId/send", verifyToken, sendMessage);

export default router;
