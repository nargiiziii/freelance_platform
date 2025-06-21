import express from "express";
import {
  createReview,
  getMyReviews,
  getUserReviews,
} from "../controllers/reviewController.js";
import { verifyToken } from "../middleware/jwtMiddleware.js";

const router = express.Router();

router.get("/my", verifyToken, getMyReviews);
router.get("/:userId", getUserReviews);
router.post("/", verifyToken, createReview);

export default router;
