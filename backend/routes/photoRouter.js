import express from "express";
import requireAuth from "../middleware/requireAuth.js";   
import Spot from "../models/spotModel.js";
import multer from "multer";
import { storage } from "../config/cloudinary.js";

const upload = multer({ storage });
const router = express.Router();

router.post(
  "/:spotId/photos",
  requireAuth,
  upload.array("photos", 5),  
  async (req, res) => {
    try {
      const { spotId } = req.params;

      const spot = await Spot.findById(spotId);
      if (!spot) return res.status(404).json({ error: "Spot not found" });

      if (!req.user) {
        return res.status(403).json({ error: "Login to add photos" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: "No photos uploaded" });
      }

      const uploadedPhotos = req.files.map(file => ({
        url: file.path,            
        publicId: file.filename,   
        uploaded_by: req.user._id,
      }));

      spot.photos.push(...uploadedPhotos);
      await spot.save();   
      res.status(201).json(spot);
    } catch (error) {
      console.error("Error uploading photos:", error);
      res.status(500).json({ error: "Server Error" });
    }
  }
);

export default router;
