import express from 'express';
import { createProposal, acceptProposal, getProposalsByProject } from '../controllers/proposalController.js';
import { verifyToken } from '../middleware/jwtMiddleware.js'; // ✅ исправлено
const router = express.Router();

// 🔐 Только авторизованные пользователи могут отправлять и обновлять предложения
router.post('/', verifyToken, createProposal);
router.patch('/accept', verifyToken, acceptProposal);
router.get('/project/:projectId', verifyToken, getProposalsByProject);

export default router;
