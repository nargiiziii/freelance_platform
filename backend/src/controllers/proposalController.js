// backend/src/controllers/proposalController.js
import Proposal from "../models/proposal.js";
import Project from "../models/project.js";
import Escrow from "../models/escrow.js";
import User from "../models/user.js";

export const createProposal = async (req, res) => {
  try {
    const { projectId, coverLetter, price } = req.body;
    const freelancer = req.user.id;

    const proposal = new Proposal({
      project: projectId,
      freelancer,
      coverLetter,
      price,
    });
    await proposal.save();
    await Project.findByIdAndUpdate(projectId, {
      $push: { proposals: proposal._id },
    });

    res.status(201).json(proposal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const acceptProposal = async (req, res) => {
  try {
    const { proposalId } = req.body;

    const proposal = await Proposal.findById(proposalId).populate("project");

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    const project = proposal.project;
    const userId = req.user._id || req.user.id;

    // 🧠 Защита: нельзя принять отклик, если проект уже закрыт
    if (project.status !== "open") {
      return res.status(400).json({ message: "This project has already been taken by another freelancer." });
    }

    // ✅ Проверка на владельца проекта
    if (!project.employer || project.employer.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to accept this proposal" });
    }

    // ✅ Убедимся, что фрилансер указан
    if (!proposal.freelancer) {
      return res.status(400).json({ message: "Proposal has no freelancer assigned" });
    }

    // ✅ Принять этот отклик
    proposal.status = "accepted";
    await proposal.save();

    // ❌ Отклонить все остальные
    await Proposal.updateMany(
      { project: project._id, _id: { $ne: proposal._id } },
      { status: "rejected" }
    );

    // ✅ Обновить статус проекта
    project.status = "in_progress";
    await project.save();

    // ✅ Создать escrow
    const escrow = await Escrow.create({
      project: project._id,
      employer: userId,
      freelancer: proposal.freelancer,
      amount: proposal.price,
      status: "funded",
    });

    // 💾 Привязать escrow к проекту
    project.escrow = escrow._id;
    await project.save();

res.status(200).json({ proposal }); // ✅ именно это ждёт фронт
  } catch (err) {
    console.error("❌ Ошибка в acceptProposal:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};


export const getProposalsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const proposals = await Proposal.find({ project: projectId })
      .populate("freelancer", "name avatar")
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
