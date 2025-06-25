import Review from "../models/review.js";
import Project from "../models/project.js";

// Создание отзыва
export const createReview = async (req, res) => {
  try {
    const { toUser, projectId, rating, comment } = req.body;
    const fromUser = req.user.id;

    const existingReview = await Review.findOne({
      fromUser,
      toUser,
      project: projectId,
    });
    if (existingReview) {
      return res.status(400).json({
        message:
          "Вы уже оставили отзыв для этого пользователя по данному проекту",
      });
    }

    const project = await Project.findById(projectId);
    if (!project || project.status !== "closed") {
      return res
        .status(400)
        .json({ message: "Проект не завершён или не найден" });
    }

    const review = await Review.create({
      fromUser,
      toUser,
      project: projectId,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Получение отзывов пользователя
export const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("📥 Получение отзывов для пользователя:", userId);
    const reviews = await Review.find({ toUser: userId })
      .populate("fromUser", "name _id")
      .sort({ createdAt: -1 });
    console.log("📤 Найдено отзывов:", reviews.length);

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Получение всех отзывов, отправленных текущим пользователем
export const getMyReviews = async (req, res) => {
  try {
    const fromUser = req.user.id;
    const reviews = await Review.find({ fromUser }) // 💥 здесь исправление
      .populate("toUser", "name _id") // можно заменить fromUser → toUser
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
