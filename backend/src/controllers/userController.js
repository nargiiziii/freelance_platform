import User from "../models/user.js";
import mongoose from "mongoose";

export const updateUser = async (req, res) => {
  try {
    const { name, email, avatar, bio } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, avatar, bio },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Ошибка обновления профиля" });
  }
};

export const addPortfolioItem = async (req, res) => {
  try {
    const { title, description, link, technologies, date } = req.body;
    const userId = req.user.id;

    console.log("userId из токена:", userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Некорректный userId" });
    }

    const portfolioItem = {
      title,
      description,
      link,
      technologies: JSON.parse(technologies),
      date,
      image: req.file ? req.file.filename : "",
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { $push: { portfolio: portfolioItem } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "Пользователь не найден" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Ошибка при добавлении проекта в портфолио:", err);
    res.status(500).json({ message: "Ошибка при добавлении проекта в портфолио" });
  }
};


// Получение пользователя по id (GET /users/:id)
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });
    res.json(user); // Возвращаем весь объект пользователя, включая portfolio
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};


// 📤 Пополнение баланса
export const topUpBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ message: "Некорректная сумма" });

    const user = await User.findById(userId);
    user.balance += amount;
    await user.save();

    res.json({ message: "Баланс пополнен", balance: user.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Получить всех фрилансеров
export const getFreelancers = async (req, res) => {
  try {
    const freelancers = await User.find({ role: "freelancer" }).select("-password"); // без пароля
    res.json(freelancers);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при получении фрилансеров" });
  }
};
