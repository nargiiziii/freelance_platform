import express from 'express';
import { verifyToken } from '../middleware/jwtMiddleware.js';

import {
  createProposal,
  acceptProposal,
  getProposalsByProject,
  acceptWorkSubmission,
  rejectProposal,
  submitWork,
  getMyProposals,
  downloadWorkFile,
} from "../controllers/proposalController.js";

const router = express.Router();

// Создание отклика на проект
router.post('/', verifyToken, createProposal);

// Принятие отклика
router.patch('/accept', verifyToken, acceptProposal);

// Получение откликов по проекту
router.get('/project/:projectId', verifyToken, getProposalsByProject);

// Отклонение отклика
router.patch("/reject", verifyToken, rejectProposal);

// Отправка работы фрилансером
router.post("/submit-work", verifyToken, submitWork);

// Получение всех откликов фрилансера
router.get("/my", verifyToken, getMyProposals);

// Скачивание отправленного файла
router.get("/download/:filename", downloadWorkFile);

// Принятие работы и выплата через escrow
router.post("/:proposalId/accept-work", verifyToken, acceptWorkSubmission);

export default router;
