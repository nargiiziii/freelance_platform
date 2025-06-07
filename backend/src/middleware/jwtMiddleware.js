import jwt from 'jsonwebtoken'; // 💡 Добавь ЭТО

export const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log('Полученный токен:', token);

  if (!token) return res.status(401).json({ message: 'Нет авторизации' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Декодированный токен:', decoded);

    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('Ошибка при проверке токена:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Токен истек, обновите access token' });
    }
    return res.status(401).json({ message: 'Токен не валиден' });
  }
};
