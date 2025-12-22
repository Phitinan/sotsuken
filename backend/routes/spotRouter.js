import express from "express";
import {
  getAllSpots,
  getSpotById,
  createSpot,
  updateSpot,
  deleteSpot,
} from "../controllers/spotControllers.js";

import requireAuth from "../middleware/requireAuth.js";

const router = express.Router();

// Public routes
router.get("/", getAllSpots);
router.get("/:spotId", getSpotById);

// Protected routes (require auth)
router.use(requireAuth);

router.post("/", createSpot);
router.put("/:spotId", updateSpot);
router.delete("/:spotId", deleteSpot);

export default router;
