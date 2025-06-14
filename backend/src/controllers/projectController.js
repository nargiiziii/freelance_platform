// backend/src/controllers/projectController.js
import Project from "../models/project.js";

// Создать проект (employer)
export const createProject = async (req, res) => {
  try {
    const { title, description, skillsRequired, budget } = req.body;
    const employer = req.user.id;

    const project = new Project({
      title,
      description,
      skillsRequired,
      budget,
      employer,
    });

    await project.save();

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Получить проекты текущего нанимателя
export const getEmployerProjects = async (req, res) => {
  try {
    const projects = await Project.find({ employer: req.user.id }).populate(
      "proposals"
    );
    console.log("Найдено проектов:", projects.length);
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Получить все открытые проекты для фрилансера
export const getOpenProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: "open" });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
