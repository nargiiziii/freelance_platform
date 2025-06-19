import express from 'express';
import { refreshToken } from '../controllers/refreshTokenController.js';

const router = express.Router();

//маршрут GET /auth/refresh для axios
router.get('/refresh', refreshToken);

export default router;
