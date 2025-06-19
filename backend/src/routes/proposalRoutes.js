import express from 'express';
import { verifyToken } from '../middleware/jwtMiddleware.js'; // ✅ исправлено
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

// 🔐 Только авторизованные пользователи могут отправлять и обновлять предложения
router.post('/', verifyToken, createProposal);
router.patch('/accept', verifyToken, acceptProposal);
router.get('/project/:projectId', verifyToken, getProposalsByProject);
router.patch("/reject", verifyToken, rejectProposal);
router.post("/submit-work", verifyToken, submitWork);
router.get("/my", verifyToken, getMyProposals);
router.get("/download/:filename", downloadWorkFile);
router.post("/:proposalId/accept-work", verifyToken, acceptWorkSubmission);


export default router;
