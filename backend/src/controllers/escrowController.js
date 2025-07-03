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
      return res.status(404).json({ message: "Layihə tapılmadı" });
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
    if (!escrow) return res.status(404).json({ message: "Escrow tapılmadı" });
    if (escrow.status !== "funded")
      return res.status(400).json({ message: "Escrow aktiv deyil" });

    const freelancer = await User.findById(escrow.freelancer);
    if (!freelancer)
      return res.status(404).json({ message: "Freelancer tapılmadı" });

    freelancer.balance += escrow.amount;
    freelancer.completedProjectsCount += 1;
    escrow.status = "released";

    await Promise.all([freelancer.save(), escrow.save()]);

    const project = await Project.findById(escrow.project);
    if (project) {
      project.status = "closed";
      await project.save();
    }

    res.json({ message: "Vəsait freelancerə göndərildi", escrow });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Функция для возврата средств работодателю (если работа не была принята)
export const refundFunds = async (req, res) => {
  try {
    const { escrowId } = req.params;

    const escrow = await Escrow.findById(escrowId);
    if (!escrow) return res.status(404).json({ message: "Escrow tapılmadı" });

    if (escrow.status !== "funded") {
      return res
        .status(400)
        .json({ message: "Vəsait artıq göndərilib və ya qaytarılıb" });
    }

    const employer = await User.findById(escrow.employer);
    if (!employer)
      return res.status(404).json({ message: "İşəgötürən tapılmadı" });

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
      proposal.status = "refunded";
      await proposal.save();
    }

    res.json({ message: "Vəsait işəgötürənə qaytarıldı", escrow });
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
        return (
          (e.status === "released" || e.status === "rejected") &&
          (isUserFreelancer || isUserEmployer)
        );
      })
      .map((e) => {
        const isUserFreelancer = String(e.freelancer._id) === userId;
        const isUserEmployer = String(e.employer._id) === userId;

        let type = "";
        let status = "";
        let direction = "outcome";

        if (e.type === "topup") {
          type = "Balans artırılması";
          status = "Uğurlu";
          direction = "income";
          return {
            date: e.createdAt,
            from: "—",
            to: "Balans artırılması",
            amount: e.amount,
            direction,
            type,
            status,
          };
        }

        if (e.status === "released") {
          type = "Ödəniş";
          status = "Uğurlu";
          if (isUserFreelancer) direction = "income";
        } else if (e.status === "rejected") {
          type = "Qaytarılma";
          status = "Ləğv edildi";
          if (isUserEmployer) direction = "income";
        }

        const signAmount =
          direction === "income" ? `+${e.amount}` : `-${e.amount}`;

        return {
          date: e.createdAt,
          from: e.employer.name,
          to: e.freelancer.name,
          amount: signAmount,
          direction,
          type,
          status,
        };
      });

    res.json(formatted);
  } catch (err) {
    console.error("Ошибка в getTransactionHistory:", err);
    res.status(500).json({ message: "Tarixçə yüklənərkən xəta baş verdi" });
  }
};

// Пополнение баланса и добавление в историю
export const topUpBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Məbləğ düzgün daxil edilməyib" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "İstifadəçi tapılmadı" });

    // Обновляем баланс
    user.balance += amount;
    await user.save();

    // Добавляем запись в историю через Escrow
    await Escrow.create({
      employer: userId,
      freelancer: userId,
      amount,
      status: "released",
      type: "topup", // ✅ ключевое отличие
    });

    res
      .status(200)
      .json({ message: "Balans uğurla artırıldı", newBalance: user.balance });
  } catch (err) {
    console.error("Ошибка при пополнении:", err);
    res.status(500).json({ message: "Balansı artırmaq mümkün olmadı" });
  }
};
