import express from 'express';
import { refreshToken } from '../controllers/refreshTokenController.js';

const router = express.Router();

router.post('/refresh_token', refreshToken);

export default router;
