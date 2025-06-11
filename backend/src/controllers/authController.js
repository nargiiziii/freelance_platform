import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import multer from "multer";

// Настройка multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  const refreshToken = crypto.randomBytes(64).toString("hex");
  return { accessToken, refreshToken };
};

export const registerUser = [
  upload.single("avatar"), // multer middleware
  async (req, res) => {
    try {
      const { role, name, email, password, bio } = req.body;

      const skills = req.body.skills ? JSON.parse(req.body.skills) : [];
      const portfolio = req.body.portfolio
        ? JSON.parse(req.body.portfolio)
        : [];

      const avatar = req.file
        ? req.file.path.replace(/\\/g, "/").replace(/^\/+/, "")
        : null;

      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({ message: "Пользователь уже существует" });

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      const newUser = new User({
        role,
        name,
        email,
        passwordHash,
        avatar,
        bio,
        skills,
        portfolio,
        rating: 0,
        reviews: [],
      });

      const tokens = generateTokens(newUser._id);
      newUser.refreshToken = tokens.refreshToken;
      await newUser.save();

      res.status(201).json({
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
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  },
];

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Неверный email или пароль" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      return res.status(400).json({ message: "Неверный email или пароль" });

    const tokens = generateTokens(user._id);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
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
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.userId;
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
