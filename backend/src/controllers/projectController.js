// backend/src/controllers/projectController.js
import Project from "../models/project.js";
import Proposal from "../models/proposal.js";
import User from "../models/user.js"; // 💡 было нужно для completeProject

export const getFreelancerProjects = async (req, res) => {
  try {
    const freelancerId = req.user._id;

    const proposals = await Proposal.find({
      freelancer: freelancerId,
      status: "accepted",
    }).populate("project");

    const activeProjects = proposals
      .filter(
        (p) =>
          p.project &&
          ["in_progress", "submitted", "completed"].includes(p.project.status)
      )
      .map((p) => p.project);

    res.json(activeProjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
      status: "open",
      // escrow пока не создаём здесь — создашь позже, когда фрилансер примет предложение
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
    const projects = await Project.find({ employer: req.user.id }).populate({
      path: "proposals",
      populate: [
        { path: "freelancer", select: "name" },
        {
          path: "project",
          populate: { path: "escrow" }, // 🔥 ЭТО ГЛАВНОЕ!
        },
      ],
    });

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

export const submitWork = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { submittedFileUrl } = req.body; // например, ссылка на работу

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.submittedFileUrl = submittedFileUrl;
    project.status = "submitted";
    await project.save();

    res.json({ message: "Work submitted", project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const completeProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("escrow");
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Завершение проекта
    project.status = "completed";
    await project.save();

    // Выплата из escrow
    const escrow = project.escrow;
    if (escrow) {
      escrow.status = "released";
      await escrow.save();

      // Пополнение баланса фрилансера
      await User.findByIdAndUpdate(escrow.freelancer, {
        $inc: { balance: escrow.amount },
      });
    }

    res.json({ message: "Project completed and funds released", project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
