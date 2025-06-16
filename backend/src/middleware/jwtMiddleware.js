// backend/src/middleware/jwtMiddleware.js
import jwt from "jsonwebtoken";

// 🛡 Middleware: проверка access токена из cookie
export const verifyToken = async (req, res, next) => {
  const token = req.cookies.accessToken;
  console.log("Полученный токен из cookie:", token);

  if (!token) return res.status(401).json({ message: "Нет авторизации" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Декодированный токен:", decoded);

    req.user = { id: decoded.id }; // ✅ доступно как req.user.id
    next();
  } catch (error) {
    console.error("Ошибка при проверке токена:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Токен истек, обновите access token" });
    }

    return res.status(401).json({ message: "Токен не валиден" });
  }
};
