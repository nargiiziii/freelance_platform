// Импорт модели пользователя из базы данных
import User from "../models/user.js";

// Импорт библиотеки для создания JWT токенов
import jwt from "jsonwebtoken";

// Импорт модуля для генерации случайных значений
import crypto from "crypto";

// Функция генерации новых access и refresh токенов
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m", // короткий срок жизни access токена для безопасности
  });

  const refreshToken = crypto.randomBytes(64).toString("hex"); // безопасный длинный refresh токен

  return { accessToken, refreshToken };
};

// Контроллер для обновления токенов при истечении access токена
export const refreshToken = async (req, res) => {
  // Получаем refresh токен из cookies
  const refreshToken = req.cookies.refreshToken;

  // Если токена нет, возвращаем ошибку 401
  if (!refreshToken) {
    return res.status(401).json({ message: "Нет refresh токена" });
  }

  try {
    // Ищем пользователя с таким refresh токеном
    const user = await User.findOne({ refreshToken });

    // Если пользователь не найден — токен невалиден
    if (!user) {
      return res.status(403).json({ message: "Неверный refresh токен" });
    }

    // Генерируем новую пару токенов
    const tokens = generateTokens(user._id);

    // Обновляем refresh токен в базе
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Отправляем новые токены в cookie
    res
      .cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // безопасно только в продакшене
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000, // 15 минут
      })
      .cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      })
      .json({ message: "Токены обновлены" });
  } catch (error) {
    // В случае любой ошибки возвращаем ошибку сервера
    console.error("Ошибка при обновлении токена:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
