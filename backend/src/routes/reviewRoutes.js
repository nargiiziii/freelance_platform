import express from "express";
import {
  createReview,
  getMyReviews,
  getUserReviews,
  hasUserReviewed
} from "../controllers/reviewController.js";
import { verifyToken } from "../middleware/jwtMiddleware.js";

const router = express.Router();

router.get("/my", verifyToken, getMyReviews);
router.get("/:userId", getUserReviews);
router.post("/", verifyToken, createReview);
router.get("/has-reviewed/:toUserId/:projectId", verifyToken, hasUserReviewed);


export default router;
