import Chat from "../models/chat.js";
import Message from "../models/message.js";

// Функция для создания чата между двумя пользователями
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

// Функция для получения всех чатов, в которых участвует текущий пользователь
export const getUserChats = async (req, res) => {
  const userId = req.user.id;

  try {
    const chats = await Chat.find({ members: userId })
      .populate("members", "name role avatar")
      .populate({
        path: "lastMessage",
        select: "content sender createdAt",
      })
      .lean(); // Чтобы можно было модифицировать объекты

    const enrichedChats = await Promise.all(
      chats.map(async (chat) => {
        const partner = chat.members.find(
          (m) => String(m._id) !== String(userId)
        );

        const unreadCount = await Message.countDocuments({
          chatId: chat._id,
          sender: { $ne: userId },
          read: false,
        });

        return {
          ...chat,
          partner: {
            _id: partner._id,
            name: partner.name,
            avatar: partner.avatar,
            role: partner.role,
          },
          unreadCount,
        };
      })
    );

    res.json(enrichedChats);
  } catch (error) {
    console.error("Ошибка получения чатов:", error);
    res.status(500).json({ message: "Не удалось загрузить чаты" });
  }
};



// Функция для получения всех сообщений из конкретного чата
export const getChatMessages = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  // Отметка всех входящих сообщений как прочитанных
  await Message.updateMany(
    { chatId, sender: { $ne: userId }, read: false },
    { $set: { read: true } }
  );

  const messages = await Message.find({ chatId }).populate("sender", "name");
  res.json(messages);
};

// Функция для отправки сообщения в чат
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

    // Определяем получателя и обновляем список непрочитанных
    const receiver = chat.members.find((m) => m.toString() !== sender);

    chat.lastMessage = newMsg._id;
    if (!chat.unreadBy.includes(receiver)) {
      chat.unreadBy.push(receiver);
    }

    await chat.save();

    const populated = await newMsg.populate("sender", "name");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: "Внутренняя ошибка сервера" });
  }
};

// Функция для отметки всех сообщений в чате как прочитанных
export const markMessagesAsRead = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;

  try {
    // Отметить сообщения как прочитанные
    await Message.updateMany(
      { chatId, sender: { $ne: userId }, read: false },
      { $set: { read: true } }
    );

    // Удалить пользователя из списка непрочитавших в чате
    await Chat.findByIdAndUpdate(chatId, {
      $pull: { unreadBy: userId },
    });

    res.json({ message: "Сообщения помечены как прочитанные" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при обновлении" });
  }
};
