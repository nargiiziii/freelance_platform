import Chat from "../models/chat.js";
import Message from "../models/message.js";

// ✅ Создание чата (оставляем как есть)
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

// ✅ Получение всех чатов пользователя
export const getUserChats = async (req, res) => {
  const userId = req.user.id;

  const chats = await Chat.find({ members: userId })
    .populate("members", "name role")
    .populate({
      path: "lastMessage",
      select: "content sender createdAt",
    });

  // Для каждого чата посчитаем кол-во непрочитанных
  const enrichedChats = await Promise.all(
    chats.map(async (chat) => {
      const partner = chat.members.find((m) => m._id.toString() !== userId);
      const unreadCount = await Message.countDocuments({
        chatId: chat._id,
        sender: { $ne: userId },
        read: false,
      });

      return {
        _id: chat._id,
        members: chat.members,
        lastMessage: chat.lastMessage,
        unreadCount,
        partner, 
      };
    })
  );

  res.json(enrichedChats);
};


// ✅ Получение всех сообщений в чате
export const getChatMessages = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  // 🟩 Сделаем непрочитанные сообщения прочитанными
  await Message.updateMany(
    { chatId, sender: { $ne: userId }, read: false },
    { $set: { read: true } }
  );

  const messages = await Message.find({ chatId }).populate("sender", "name");
  res.json(messages);
};

// ✅ Отправка сообщения
export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const { chatId } = req.params;
    const sender = req.user.id;

    if (!content || !chatId) {
      return res.status(400).json({ message: "Текст и chatId обязательны" });
    }

    const newMsg = await Message.create({
      chatId,
      content,
      sender,
      read: false,
    });

    const chat = await Chat.findById(chatId);

    // Определяем получателя
    const receiver = chat.members.find((m) => m.toString() !== sender);

    // Обновляем чат
    chat.lastMessage = newMsg._id;
    if (!chat.unreadBy.includes(receiver)) {
      chat.unreadBy.push(receiver);
    }

    await chat.save();

    const populated = await newMsg.populate("sender", "name");
    res.status(201).json(populated);
  } catch (error) {
    // console.error("❌ Ошибка при отправке сообщения:", error);
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};


// ✅ Отметить все сообщения как прочитанные (по сокету или вручную)
export const markMessagesAsRead = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  try {
    // Отметить сообщения как прочитанные
    await Message.updateMany(
      { chatId, sender: { $ne: userId }, read: false },
      { $set: { read: true } }
    );

    // Удалить пользователя из unreadBy в чате
    await Chat.findByIdAndUpdate(chatId, {
      $pull: { unreadBy: userId },
    });

    res.json({ message: "Сообщения помечены как прочитанные" });
  } catch (error) {
    // console.error("❌ Ошибка при обновлении read:", error);
    res.status(500).json({ message: "Ошибка при обновлении" });
  }
};
