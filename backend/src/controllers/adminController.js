import User from "../models/user.js";
import Project from "../models/project.js";
import Proposal from "../models/proposal.js";
import Escrow from "../models/escrow.js";
import Review from "../models/review.js";

// 📊 Статистика для Dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const freelancers = await User.countDocuments({ role: "freelancer" });
    const employers = await User.countDocuments({ role: "employer" });
    const projects = await Project.countDocuments();
    const escrows = await Escrow.countDocuments();
    const completedProjects = await Project.countDocuments({
      status: "completed",
    });

    res.json({
      users,
      freelancers,
      employers,
      projects,
      escrows,
      completedProjects,
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка сервера", error });
  }
};

// 👥 Все пользователи
export const getAllUsers = async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
};

// 🚫 Блокировка пользователя
export const blockUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(
    id,
    { isBlocked: true },
    { new: true }
  );
  res.json(user);
};

// ✅ Разблокировка пользователя
export const unblockUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(
    id,
    { isBlocked: false },
    { new: true }
  );
  res.json(user);
};

// ❌ Удаление пользователя
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.json({ message: "Пользователь удалён" });
};

// 📂 Получение всех проектов
export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("employer", "name email")
      .populate("escrow")
      .populate("proposals");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Ошибка загрузки проектов", error });
  }
};

// Удалить проект
export const deleteProject = async (req, res) => {
  const { id } = req.params;
  try {
    await Project.findByIdAndDelete(id);
    res.json({ message: "Проект удалён" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении проекта", error });
  }
};

// 📄 Получение всех откликов
export const getAllProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find()
      .populate("freelancer", "name email")
      .populate({
        path: "project",
        select: "title employer",
        populate: { path: "employer", select: "name email" },
      });

    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: "Ошибка загрузки откликов", error });
  }
};

// Удалить отклик
export const deleteProposal = async (req, res) => {
  const { id } = req.params;
  try {
    await Proposal.findByIdAndDelete(id);
    res.json({ message: "Отклик удалён" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении отклика", error });
  }
};

// 📝 Получение всех escrow
export const getAllEscrows = async (req, res) => {
  try {
    const escrows = await Escrow.find({ type: { $ne: "topup" } })
      .populate("project", "title")
      .populate("employer", "name email")
      .populate("freelancer", "name email");
    res.json(escrows);
  } catch (error) {
    res.status(500).json({ message: "Ошибка загрузки escrow", error });
  }
};

//Принудительная выплата escrow
export const forceReleaseEscrow = async (req, res) => {
  const { id } = req.params;
  try {
    const escrow = await Escrow.findById(id);
    if (!escrow || escrow.status !== "funded") {
      return res.status(400).json({ message: "Escrow не может быть выплачен" });
    }

    const freelancer = await User.findById(escrow.freelancer);
    freelancer.balance += escrow.amount;
    escrow.status = "released";

    await freelancer.save();
    await escrow.save();

    res.json({ message: "Escrow выплачен фрилансеру" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при выплате", error });
  }
};

// Принудительное возвращение escrow
export const forceRefundEscrow = async (req, res) => {
  const { id } = req.params;
  try {
    const escrow = await Escrow.findById(id);
    if (!escrow || escrow.status !== "funded") {
      return res
        .status(400)
        .json({ message: "Escrow не может быть возвращён" });
    }

    const employer = await User.findById(escrow.employer);
    employer.balance += escrow.amount;
    escrow.status = "rejected";

    await employer.save();
    await escrow.save();

    res.json({ message: "Escrow возвращён работодателю" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при возврате", error });
  }
};

// 📝 Получение всех отзывов
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("fromUser", "name email")
      .populate("toUser", "name email")
      .populate("project", "title");
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Ошибка загрузки отзывов", error });
  }
};

// Удалить отзыв
export const deleteReview = async (req, res) => {
  const { id } = req.params;
  try {
    await Review.findByIdAndDelete(id);
    res.json({ message: "Отзыв удалён" });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении отзыва", error });
  }
};
