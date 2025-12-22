import express from "express";
import requireAuth from "../middleware/requireAuth.js";

import {
  getSpotReviews,
  addSpotReview,
  updateSpotReview,
  deleteSpotReview
} from "../controllers/reviewControllers.js";

import {
  getSeasonReports,
  addSeasonReport,
  updateSeasonReport,
  deleteSeasonReport
} from "../controllers/reportControllers.js";

const router = express.Router();

/* Reviews */
router.get("/spots/:spotId/reviews", getSpotReviews);
router.post("/spots/:spotId/reviews", requireAuth, addSpotReview);
router.put("/spots/:spotId/reviews/:reviewId", requireAuth, updateSpotReview);
router.delete("/spots/:spotId/reviews/:reviewId", requireAuth, deleteSpotReview);

/* Season reports */
router.get("/spots/:spotId/season-reports", getSeasonReports);
router.post("/spots/:spotId/season-reports", requireAuth, addSeasonReport);
router.put(
  "/spots/:spotId/season-reports/:reportId",
  requireAuth,
  updateSeasonReport
);
router.delete(
  "/spots/:spotId/season-reports/:reportId",
  requireAuth,
  deleteSeasonReport
);

export default router;
