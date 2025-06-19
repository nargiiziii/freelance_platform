// Импорт модели пользователя и mongoose для работы с базой данных
import User from "../models/user.js";
import mongoose from "mongoose";

// Контроллер для обновления профиля пользователя (имя, email, аватар, био)
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

// Контроллер для добавления одного элемента в портфолио пользователя
export const addPortfolioItem = async (req, res) => {
  try {
    const { title, description, link, technologies, date } = req.body;
    const userId = req.user.id;

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

// Контроллер для получения информации о пользователе по ID
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Пользователь не найден" });
    res.json(user); // Возвращаем весь объект пользователя, включая portfolio
  } catch (err) {
    res.status(500).json({ message: "Ошибка сервера" });
  }
};

// Контроллер для пополнения баланса текущего пользователя
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

// Контроллер для получения списка фрилансеров, с возможностью фильтрации по категории
export const getFreelancers = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { role: "freelancer" };
    if (category) {
      filter.category = { $regex: new RegExp(`^${category}$`, "i") }; // фильтрация без учёта регистра
    }

    const freelancers = await User.find(filter).select("-password");
    res.json(freelancers);
  } catch (err) {
    res.status(500).json({ message: "Ошибка при получении фрилансеров" });
  }
};
