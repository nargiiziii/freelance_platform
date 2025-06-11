import express from "express";
import Project from "../models/project.js";
import User from "../models/user.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    const { title, description, employerId } = req.body;

    // 1. Создать проект
    const newProject = await Project.create({ title, description, employerId });

    // 2. Увеличить счётчик у работодателя
    await User.findByIdAndUpdate(employerId, {
      $inc: { postedProjectsCount: 1 }
    });

    res.status(201).json(newProject);
  } catch (err) {
    console.error("Ошибка при создании проекта:", err);
    res.status(500).json({ message: "Ошибка сервера" });
  }
});

export default router;
