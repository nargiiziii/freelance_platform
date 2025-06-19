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

    // ⬅️ Вернуть деньги
    employer.balance += escrow.amount;
    await employer.save();

    // ⬅️ Изменить статус escrow
    escrow.status = "rejected";
    await escrow.save();

    // ✅ Обновить статус проекта
    const project = await Project.findById(escrow.project);
    if (project) {
      project.status = "closed"; // или "closed"
      await project.save();
    }

    // ✅ Обновить статус отклика
    const Proposal = (await import("../models/proposal.js")).default;
    const proposal = await Proposal.findOne({
      project: escrow.project,
      freelancer: escrow.freelancer,
    });

    if (proposal) {
      proposal.status = "rejected"; // или "rejected"
      await proposal.save();
    }

    res.json({ message: "Средства возвращены работодателю", escrow });
  } catch (err) {
    console.error("Ошибка при возврате средств:", err);
    res.status(500).json({ message: err.message });
  }
};


// 📄 Получить историю транзакций пользователя (улучшено)

export const getTransactionHistory = async (req, res) => {
  try {
    const userId = String(req.user.id);

    const escrows = await Escrow.find({
      $or: [{ employer: userId }, { freelancer: userId }],
    })
      .populate("employer", "name _id")
      .populate("freelancer", "name _id")
      .sort({ createdAt: -1 });

    const formatted = escrows
      .filter((e) => {
        // ⚠️ Фрилансер видит только завершённые переводы
        const isUserFreelancer = String(e.freelancer._id) === userId;
        if (isUserFreelancer && e.status !== "released") return false;
        return true;
      })
      .map((e) => {
        const isUserEmployer = String(e.employer._id) === userId;
        const isUserFreelancer = String(e.freelancer._id) === userId;

        const from = e.employer.name;
        const to = e.freelancer.name;

        let direction = "outcome";

        // ✅ Фрилансер получил деньги
        if (e.status === "released" && isUserFreelancer) {
          direction = "income";
        }

        // ✅ Работодатель получил возврат
        if (e.status === "rejected" && isUserEmployer) {
          direction = "income";
        }

        const signAmount = direction === "income" ? `+${e.amount}` : `-${e.amount}`;

        return {
          date: e.createdAt.toLocaleDateString(),
          from,
          to,
          amount: signAmount,
          status:
            e.status === "funded"
              ? "Успешно"
              : e.status === "pending"
              ? "В процессе"
              : e.status === "released"
              ? "Завершено"
              : e.status === "rejected"
              ? "Возврат"
              : "Спор",
          direction,
        };
      });

    res.json(formatted);
  } catch (err) {
    console.error("Ошибка в getTransactionHistory:", err);
    res.status(500).json({ message: "Ошибка при получении истории" });
  }
};
