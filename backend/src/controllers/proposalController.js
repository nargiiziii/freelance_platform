// backend/src/controllers/proposalController.js
import Proposal from "../models/proposal.js";
import Project from "../models/project.js";
import Escrow from "../models/escrow.js";
import User from "../models/user.js";
import fs from "fs";

import path from "path";
import multer from "multer";

// Multer для загрузки файла
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // путь к папке
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Отклонение отклика
export const rejectProposal = async (req, res) => {
  try {
    const { proposalId } = req.body;
    const proposal = await Proposal.findById(proposalId).populate("project");

    if (!proposal)
      return res.status(404).json({ message: "Proposal not found" });

    const userId = req.user._id || req.user.id;
    if (proposal.project.employer.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    proposal.status = "rejected";
    await proposal.save();

    // Преобразуем в обычный объект и добавляем escrow
    const proposalWithEscrow = proposal.toObject();

    res.status(200).json({ proposal: proposalWithEscrow });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Загрузка работы
export const submitWork = [
  upload.single("workFile"),
  async (req, res) => {
    try {
      const { projectId } = req.body;
      const freelancerId = req.user._id || req.user.id;

      const proposal = await Proposal.findOne({
        project: projectId,
        freelancer: freelancerId,
        status: "accepted",
      });

      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      proposal.status = "submitted";
      proposal.workFile = req.file.filename;
      await proposal.save();

      // ⬇️ Вот ключ: перезагружаем proposal с project.escrow
      const updatedProposal = await Proposal.findById(proposal._id)
        .populate({
          path: "project",
          populate: {
            path: "escrow", // ✅ ПОЛНОСТЬЮ подтяни escrow
          },
        })
        .populate({
          path: "freelancer",
          select: "name",
        });

  
      if (proposal.project) {
        const project = await Project.findById(proposal.project);
        project.status = "submitted";
        await project.save();
      }

      return res.status(200).json({
        message: "Work submitted",
        proposal: updatedProposal,
      });
    } catch (err) {
      console.error("❌ submitWork error:", err);
      return res.status(500).json({ message: err.message });
    }
  },
];

export const getMyProposals = async (req, res) => {
  try {
    const freelancerId = req.user._id || req.user.id;
    const proposals = await Proposal.find({ freelancer: freelancerId })
      .populate("project", "title status")
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const downloadWorkFile = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.resolve("uploads", filename);

  // 🛡 Проверка: существует ли файл
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Файл не найден" });
  }

  res.download(filePath);
};

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
    if (!proposal)
      return res.status(404).json({ message: "Proposal not found" });

    const project = proposal.project;
    const userId = req.user._id || req.user.id;

    if (project.status !== "open") {
      return res
        .status(400)
        .json({ message: "Проект уже в работе или закрыт" });
    }

    if (
      !project.employer ||
      project.employer.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Не авторизованы" });
    }

    const employer = await User.findById(userId);
    if (!employer || employer.balance < proposal.price) {
      return res
        .status(400)
        .json({ message: "Недостаточно средств на балансе" });
    }

    employer.balance -= proposal.price;
    await employer.save();

    proposal.status = "accepted";
    await proposal.save();

    await Proposal.updateMany(
      { project: project._id, _id: { $ne: proposal._id } },
      { status: "rejected" }
    );
    project.status = "in_progress";

    const escrow = await Escrow.create({
      project: project._id,
      employer: userId,
      freelancer: proposal.freelancer,
      amount: proposal.price,
      status: "funded",
    });

    project.escrow = escrow._id;
    await project.save();

    res.status(200).json({ proposal });
  } catch (err) {
    console.error("Ошибка в acceptProposal:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

export const getProposalsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const proposals = await Proposal.find({ project: projectId })
      .populate("freelancer", "name avatar")
      .populate({
        path: "project",
        populate: { path: "escrow" }, // 🔥 ключевой момент!
      });

    res.json(proposals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
