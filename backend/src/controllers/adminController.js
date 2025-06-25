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
    const completedProjects = await Project.countDocuments({ status: "completed" });

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
  const user = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
  res.json(user);
};

// ✅ Разблокировка пользователя
export const unblockUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
  res.json(user);
};

// ❌ Удаление пользователя
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.json({ message: "Пользователь удалён" });
};
