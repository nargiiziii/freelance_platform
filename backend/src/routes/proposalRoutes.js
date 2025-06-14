import express from 'express';
import { createProposal, updateProposalStatus } from '../controllers/proposalController.js';
import {authMiddleware} from '../middleware/jwtMiddleware.js';

const router = express.Router();

router.post('/', authMiddleware, createProposal);
router.patch('/status', authMiddleware, updateProposalStatus);

export default router;
