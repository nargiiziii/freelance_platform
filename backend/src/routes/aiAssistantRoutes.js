import express from "express";
import { askGemini } from "../controllers/aiAssistantController.js";

const router = express.Router();

router.post("/", askGemini);

export default router;
