import Escrow from "../models/escrow.js";
import Project from "../models/project.js";

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

    escrow.status = "released";
    await escrow.save();

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

    escrow.status = "refunded";
    await escrow.save();

    res.json({ message: "Средства возвращены работодателю", escrow });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
