// Импорт библиотеки jsonwebtoken для работы с JWT
import jwt from "jsonwebtoken";
import User from "../models/user.js"; // ⬅️ Добавлен импорт модели

// Middleware для проверки access токена, полученного из cookie
export const verifyToken = async (req, res, next) => {
  const token = req.cookies.accessToken;
  console.log("Полученный токен из cookie:", token);

  if (!token) return res.status(401).json({ message: "Нет авторизации" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Находим пользователя по ID
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(401).json({ message: "Пользователь не найден" });

    // Проверка на блокировку
    if (user.isBlocked) {
      return res
        .status(403)
        .json({ message: "Hesabınız administrator tərəfindən bloklanıb." });
    }

    // Сохраняем ID и роль пользователя
    req.user = { id: user._id, role: user.role };
    next();
  } catch (error) {
    console.error("Ошибка при проверке токена:", error.message);

    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Токен истек, обновите access token" });
    }

    return res.status(401).json({ message: "Токен не валиден" });
  }
};

// Middleware для проверки роли администратора
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.id) {
    import("../models/user.js").then(({ default: User }) => {
      User.findById(req.user.id)
        .then((user) => {
          if (user && user.role === "admin") {
            next();
          } else {
            res.status(403).json({ message: "Только для администратора" });
          }
        })
        .catch((err) => {
          console.error("Ошибка поиска админа:", err.message);
          res.status(500).json({ message: "Ошибка проверки роли" });
        });
    });
  } else {
    res.status(401).json({ message: "Неавторизован" });
  }
};
