// Импорт библиотеки jsonwebtoken для работы с JWT
import jwt from "jsonwebtoken";

// Middleware для проверки access токена, полученного из cookie
export const verifyToken = async (req, res, next) => {
  // Получение access токена из cookie запроса
  const token = req.cookies.accessToken;
  console.log("Полученный токен из cookie:", token);

  // Если токен отсутствует, возвращаем ошибку авторизации
  if (!token) return res.status(401).json({ message: "Нет авторизации" });

  try {
    // Проверка и расшифровка токена с использованием секретного ключа
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Сохранение идентификатора пользователя в объект запроса для дальнейшего использования
    req.user = { id: decoded.id }; // Доступ к пользователю в дальнейших маршрутах через req.user.id

    // Переход к следующему middleware или обработчику маршрута
    next();
  } catch (error) {
    // Логирование ошибки, если токен недействителен или истек
    console.error("Ошибка при проверке токена:", error.message);

    // Обработка случая, если токен истёк
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Токен истек, обновите access token" });
    }

    // Обработка других ошибок токена (например, неправильный токен)
    return res.status(401).json({ message: "Токен не валиден" });
  }
};


export const isAdmin = (req, res, next) => {
  if (req.user && req.user.id) {
    // Получаем пользователя из базы
    import("../models/user.js").then(({ default: User }) => {
      User.findById(req.user.id).then((user) => {
        if (user && user.role === "admin") {
          next();
        } else {
          res.status(403).json({ message: "Только для администратора" });
        }
      }).catch((err) => {
        console.error("Ошибка поиска админа:", err.message);
        res.status(500).json({ message: "Ошибка проверки роли" });
      });
    });
  } else {
    res.status(401).json({ message: "Неавторизован" });
  }
};
