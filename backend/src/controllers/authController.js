// Импорты моделей и библиотек
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import multer from "multer";

// Настройка хранилища файлов для загрузки аватара пользователя
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// ✅ Обновлённая функция генерации токенов: теперь включает и role
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = crypto.randomBytes(64).toString("hex");
  return { accessToken, refreshToken };
};

// Контроллер регистрации нового пользователя
export const registerUser = [
  upload.single("avatar"), // Обработка загрузки аватара
  async (req, res) => {
    try {
      const { role, name, email, password, bio, category } = req.body;
      const skills = req.body.skills ? JSON.parse(req.body.skills) : [];
      const portfolio = req.body.portfolio
        ? JSON.parse(req.body.portfolio)
        : [];

      const avatar = req.file
        ? req.file.path.replace(/\\/g, "/").replace(/^\/+/, "")
        : null;

      // Проверка: существует ли пользователь с таким email
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: "Пользователь уже существует" });

      // Хэширование пароля
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Создание нового пользователя
      const newUser = new User({
        role,
        name,
        email,
        passwordHash,
        avatar,
        bio,
        skills,
        portfolio,
        category,
        rating: 0,
        reviews: [],
      });

      // ✅ Генерация токенов и сохранение refresh токена
      const { accessToken, refreshToken } = generateTokens(
        newUser._id,
        newUser.role
      );
      newUser.refreshToken = refreshToken;
      await newUser.save();

      // Установка httpOnly cookies и ответ с данными пользователя
      res
        .cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
          maxAge: 15 * 60 * 1000,
        })
        .cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          sameSite: "Lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        })
        .status(201)
        .json({
          user: {
            id: newUser._id,
            role: newUser.role,
            name: newUser.name,
            email: newUser.email,
            avatar: newUser.avatar,
            bio: newUser.bio,
            skills: newUser.skills,
            portfolio: newUser.portfolio,
            rating: newUser.rating,
            reviews: newUser.reviews,
          },
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  },
];

// Контроллер входа пользователя в систему
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя по email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Неверный email или пароль" });

    if (user.isBlocked) {
      return res
        .status(403)
        .json({ message: "Hesabınız administrator tərəfindən bloklanıb." });
    }

    // Проверка пароля
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Неверный email или пароль" });

    // ✅ Генерация токенов с role и сохранение refresh токена
    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    user.refreshToken = refreshToken;
    user.lastSeen = new Date();
    await user.save();

    // Установка cookies и отправка данных пользователя
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        user: {
          id: user._id,
          role: user.role,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          skills: user.skills,
          portfolio: user.portfolio,
          rating: user.rating,
          reviews: user.reviews,
        },
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Контроллер получения профиля текущего пользователя
export const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Нет авторизации" });
    }

    const userId = req.user.id;
    const user = await User.findById(userId).select("-passwordHash");

    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    const userObj = user.toObject();
    userObj.id = userObj._id;
    delete userObj._id;

    res.json(userObj);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Контроллер выхода пользователя из системы
export const logoutUser = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    const user = await User.findOne({ refreshToken });
    if (user) {
      user.refreshToken = "";
      await user.save();
    }
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  res.status(200).json({ message: "Вы вышли из системы" });
};
