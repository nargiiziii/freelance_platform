import Escrow from "../models/escrow.js";
import Project from "../models/project.js";
import User from "../models/user.js"; // ⬅️ добавь импорт

// 🔐 Создать escrow (работодатель инициирует заморозку)
export const createEscrow = async (req, res) => {
  try {
    const { projectId, freelancerId, amount } = req.body;
    const employer = req.user.id;

    const escrow = await Escrow.create({
      project: projectId,
      employer,
      freelancer: freelancerId,
      amount,
    });

    // Связываем escrow с проектом
    await Project.findByIdAndUpdate(projectId, { escrow: escrow._id });

    res.status(201).json(escrow);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 💸 Выпустить средства фрилансеру
export const releaseFunds = async (req, res) => {
  try {
    const { escrowId } = req.params;

    const escrow = await Escrow.findById(escrowId);
    if (!escrow) return res.status(404).json({ message: "Escrow не найден" });
    if (escrow.status !== "funded")
      return res.status(400).json({ message: "Escrow неактивен" });

    const freelancer = await User.findById(escrow.freelancer);
    if (!freelancer)
      return res.status(404).json({ message: "Фрилансер не найден" });

    freelancer.balance += escrow.amount;
    escrow.status = "released";

    await Promise.all([freelancer.save(), escrow.save()]);
    // ⬇️ Обновим статус проекта на closed
    const project = await Project.findById(escrow.project);
    if (project) {
      project.status = "closed";
      await project.save();
    }

    res.json({ message: "Средства отправлены фрилансеру", escrow });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ↩️ Вернуть средства работодателю
export const refundFunds = async (req, res) => {
  try {
    const { escrowId } = req.params;

    const escrow = await Escrow.findById(escrowId);
    if (!escrow) return res.status(404).json({ message: "Escrow не найден" });

    if (escrow.status !== "funded") {
      return res
        .status(400)
        .json({ message: "Средства уже выпущены или возвращены" });
    }

    const employer = await User.findById(escrow.employer);
    if (!employer)
      return res.status(404).json({ message: "Работодатель не найден" });

    employer.balance += escrow.amount;
    await employer.save();

    escrow.status = "refunded";
    await escrow.save();

    res.json({ message: "Средства возвращены работодателю", escrow });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
