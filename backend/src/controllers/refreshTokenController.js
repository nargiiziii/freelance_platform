import User from "../models/user.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// Генерация токенов
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m", // более безопасно — короткий срок
  });

  const refreshToken = crypto.randomBytes(64).toString("hex");

  return { accessToken, refreshToken };
};

// Контроллер обновления токенов
export const refreshToken = async (req, res) => {
  // 📦 Читаем refresh token из cookie
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Нет refresh токена" });
  }

  try {
    const user = await User.findOne({ refreshToken });

    if (!user) {
      return res.status(403).json({ message: "Неверный refresh токен" });
    }

    const tokens = generateTokens(user._id);

    user.refreshToken = tokens.refreshToken;
    await user.save();

    res
      .cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // ✅ включаем только в продакшене
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000, // 15 минут
      })
      .cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // ✅
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
      })
      .json({ message: "Токены обновлены" });
  } catch (error) {
    console.error("Ошибка при обновлении токена:", error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};
