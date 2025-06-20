// Импорт моделей проекта, отклика и пользователя
import Project from "../models/project.js";
import Proposal from "../models/proposal.js";
import User from "../models/user.js";

// Функция для получения проектов, над которыми работает текущий фрилансер
export const getFreelancerProjects = async (req, res) => {
  try {
    const freelancerId = req.user._id;

    const proposals = await Proposal.find({
      freelancer: freelancerId,
      status: "accepted",
    }).populate({ path: "project", strictPopulate: false });

    const activeProjects = proposals
      .filter(
        (p) =>
          p.project &&
          typeof p.project.status === "string" &&
          ["in_progress", "submitted", "closed"].includes(p.project.status)
      )
      .map((p) => p.project);

    res.status(200).json(activeProjects);
  } catch (err) {
    console.error("❌ Ошибка getFreelancerProjects:", err.stack);
    res.status(500).json({
      message: "Ошибка сервера при получении проектов фрилансера",
    });
  }
};

// Функция для создания нового проекта (наниматель создаёт задание)
export const createProject = async (req, res) => {
  try {
    const { title, description, skillsRequired, budget, category } = req.body;
    const employerId = req.user.id;

    const employer = await User.findById(employerId);
    if (!employer) return res.status(404).json({ message: "Пользователь не найден" });

    if (employer.balance < budget) {
      return res.status(400).json({ message: "Недостаточно средств для публикации проекта." });
    }

    const project = new Project({
      title,
      description,
      skillsRequired,
      budget,
      employer: employerId,
      status: "open",
      category,
    });

    await project.save();

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Функция для получения проектов текущего нанимателя (личный кабинет)
export const getEmployerProjects = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { employer: req.user.id };
    if (status) filter.status = status;

    const projects = await Project.find(filter)
      .populate("escrow")
      .populate({
        path: "proposals",
        populate: {
          path: "freelancer",
          select: "name email avatar rating",
        },
      })
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Функция для получения всех открытых проектов (фрилансер ищет работу)
export const getOpenProjects = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { status: "open" };
    if (category) filter.category = category;

    const projects = await Project.find(filter).populate("employer", "name");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Функция для отправки выполненной работы фрилансером
export const submitWork = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { submittedFileUrl } = req.body;

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

// Функция для завершения проекта и выплаты средств фрилансеру
export const completeProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate("escrow");
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Изменяем статус проекта
    project.status = "closed";
    await project.save();

    // Выпускаем средства из escrow
    const escrow = project.escrow;
    if (escrow) {
      escrow.status = "released";
      await escrow.save();

      // Начисляем средства фрилансеру
      await User.findByIdAndUpdate(escrow.freelancer, {
        $inc: { balance: escrow.amount },
      });
    }

    res.json({ message: "Project completed and funds released", project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Функция для получения одного проекта по ID (детали проекта)
export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("escrow")
      .populate({
        path: "proposals",
        populate: {
          path: "freelancer",
          select: "name email avatar rating",
        },
      });

    if (!project) return res.status(404).json({ message: "Проект не найден" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Функция для обновления проекта (редактирование нанимателем)
export const updateProjectById = async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, employer: req.user.id },
      req.body,
      { new: true }
    );
    if (!project) return res.status(404).json({ message: "Проект не найден" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Функция для удаления проекта (наниматель удаляет свой проект)
export const deleteProjectById = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      employer: req.user.id,
    });
    if (!project) return res.status(404).json({ message: "Проект не найден" });
    res.json({ message: "Проект удалён" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
