// Импорт моделей и зависимостей
import Proposal from "../models/proposal.js";
import Project from "../models/project.js";
import Escrow from "../models/escrow.js";
import User from "../models/user.js";
import fs from "fs";
import path from "path";
import multer from "multer";

// Настройка хранилища для загрузки файлов (используется в submitWork)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Папка для сохранения файлов
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Контроллер для отклонения отклика фрилансера
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

    const proposalWithEscrow = proposal.toObject();

    res.status(200).json({ proposal: proposalWithEscrow });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Контроллер для загрузки выполненной работы фрилансером
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

      const updatedProposal = await Proposal.findById(proposal._id)
        .populate({
          path: "project",
          populate: { path: "escrow" },
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
      return res.status(500).json({ message: err.message });
    }
  },
];

// Контроллер для получения всех откликов фрилансера
export const getMyProposals = async (req, res) => {
  try {
    const freelancerId = req.user._id || req.user.id;
    const proposals = await Proposal.find({ freelancer: freelancerId })
      .populate({
        path: "project",
        populate: [
          { path: "escrow" },
          { path: "employer", select: "name _id" }, 
        ],
      })
      .sort({ createdAt: -1 });

    res.json(proposals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Контроллер для скачивания загруженного файла работы
export const downloadWorkFile = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.resolve("uploads", filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "Файл не найден" });
  }

  res.download(filePath);
};

// Контроллер для создания нового отклика фрилансера на проект
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

// Контроллер для принятия отклика работодателем и создания Escrow
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
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
};

// Контроллер для получения всех откликов на конкретный проект
export const getProposalsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const proposals = await Proposal.find({ project: projectId })
      .populate({
        path: "project",
        populate: {
          path: "escrow",
        },
      })
      .populate("freelancer");

    res.status(200).json(proposals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Контроллер для принятия выполненной работы работодателем и выплаты через Escrow
export const acceptWorkSubmission = async (req, res) => {
  try {
    const { proposalId } = req.params;

    const proposal = await Proposal.findById(proposalId).populate("project");
    if (!proposal)
      return res.status(404).json({ message: "Proposal not found" });

    const project = proposal.project;
    const userId = req.user._id || req.user.id;

    if (
      !project.employer ||
      project.employer.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const escrow = await Escrow.findOne({ project: project._id });
    if (!escrow) return res.status(404).json({ message: "Escrow not found" });

    if (escrow.status !== "funded") {
      return res
        .status(400)
        .json({ message: "Escrow already released or refunded" });
    }

    const freelancer = await User.findById(escrow.freelancer);
    if (!freelancer)
      return res.status(404).json({ message: "Freelancer not found" });

    freelancer.balance += escrow.amount;
    freelancer.completedProjectsCount += 1;
    escrow.status = "released";
    project.status = "closed";
    console.log("✅ Увеличиваем completedProjectsCount для:", freelancer._id);

    await Promise.all([freelancer.save(), escrow.save(), project.save()]);

    res.status(200).json({ message: "Work accepted and paid" });
  } catch (err) {
    console.error("❌ Ошибка в acceptWorkSubmission:", err.message);
    res.status(500).json({ message: err.message || "Ошибка при оплате" });
  }
};
