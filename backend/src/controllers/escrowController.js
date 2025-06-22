import Escrow from "../models/escrow.js";
import Project from "../models/project.js";
import User from "../models/user.js"; // Модель пользователя

// Функция для создания escrow (работодатель замораживает средства)
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

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { escrow: escrow._id },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Проект не найден" });
    }

    res.status(201).json(escrow);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Функция для выпуска средств фрилансеру после принятия работы
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
    freelancer.completedProjectsCount += 1;
    escrow.status = "released";

    await Promise.all([freelancer.save(), escrow.save()]);

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

// Функция для возврата средств работодателю (если работа не была принята)
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

    // Возврат средств работодателю
    employer.balance += escrow.amount;
    await employer.save();

    // Изменение статуса escrow
    escrow.status = "rejected";
    await escrow.save();

    // Обновление статуса проекта на "closed"
    const project = await Project.findById(escrow.project);
    if (project) {
      project.status = "closed";
      await project.save();
    }

    // Обновление статуса отклика (proposal) как отклонённого
    const Proposal = (await import("../models/proposal.js")).default;
    const proposal = await Proposal.findOne({
      project: escrow.project,
      freelancer: escrow.freelancer,
    });

    if (proposal) {
      proposal.status = "rejected";
      await proposal.save();
    }

    res.json({ message: "Средства возвращены работодателю", escrow });
  } catch (err) {
    console.error("Ошибка при возврате средств:", err);
    res.status(500).json({ message: err.message });
  }
};

// Функция для получения истории транзакций текущего пользователя
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
        const isUserFreelancer = String(e.freelancer._id) === userId;
        const isUserEmployer = String(e.employer._id) === userId;

        // Только завершённые или отменённые показываем
        return (e.status === "released" || e.status === "rejected") &&
               (isUserFreelancer || isUserEmployer);
      })
      .map((e) => {
        const isUserFreelancer = String(e.freelancer._id) === userId;
        const isUserEmployer = String(e.employer._id) === userId;

        const from = e.employer.name;
        const to = e.freelancer.name;

        let direction = "outcome"; // по умолчанию, если ты отправлял

        if (e.status === "released" && isUserFreelancer) direction = "income";
        if (e.status === "rejected" && isUserEmployer) direction = "income";

        const signAmount = direction === "income" ? `+${e.amount}` : `-${e.amount}`;

        return {
          date: e.createdAt.toLocaleDateString(),
          from,
          to,
          amount: signAmount,
          status:
            e.status === "released"
              ? "Завершено"
              : e.status === "rejected"
              ? "Возврат"
              : "Неизвестно",
          direction,
        };
      });

    res.json(formatted);
  } catch (err) {
    console.error("Ошибка в getTransactionHistory:", err);
    res.status(500).json({ message: "Ошибка при получении истории" });
  }
};

