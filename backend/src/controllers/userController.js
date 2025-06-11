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
    const { userId, title, description, link, technologies, date } = req.body;

    console.log("userId из запроса:", userId);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
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
