import Chat from "../models/chat.js";
import Message from "../models/message.js";

export const createChat = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.id;

  const existingChat = await Chat.findOne({
    members: { $all: [senderId, receiverId] },
  });

  if (existingChat) return res.json(existingChat);

  const newChat = await Chat.create({ members: [senderId, receiverId] });
  res.status(201).json(newChat);
};

export const getUserChats = async (req, res) => {
  const userId = req.user.id;
  const chats = await Chat.find({ members: userId }).populate("members", "name role");
  res.json(chats);
};

export const getChatMessages = async (req, res) => {
  const { chatId } = req.params;
  const messages = await Message.find({ chatId }).populate("sender", "name");
  res.json(messages);
};

export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const { chatId } = req.params; // ✅ получаем chatId из URL
    const sender = req.user.id;

    if (!content || !chatId) {
      return res.status(400).json({ message: "Текст и chatId обязательны" });
    }

    const newMsg = await Message.create({ chatId, content, sender });
    const populated = await newMsg.populate("sender", "name");

    res.status(201).json(populated);
  } catch (error) {
    console.error("❌ Ошибка при отправке сообщения:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};
