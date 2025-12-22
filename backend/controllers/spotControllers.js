import Spot from "../models/spotModel.js";
import mongoose from "mongoose";

// GET /spots
export const getAllSpots = async (req, res) => {
  try {
    const { type, tags } = req.query; // optional filters
    let filter = {};

    if (type) filter.type = type;
    if (tags) filter.tags = { $in: tags.split(",") };

    const spots = await Spot.find(filter)
      .sort({ createdAt: -1 })
      .populate("created_by", "name email profile_pic");

    res.status(200).json(spots);
  } catch (error) {
    console.error("Error fetching spots:", error);
    res.status(500).json({ error: "Failed to get spots" });
  }
};

// GET /spots/:spotId
export const getSpotById = async (req, res) => {
  const { spotId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(spotId)) {
    return res.status(404).json({ error: "No such spot" });
  }

  try {
    const spot = await Spot.findById(spotId).populate("created_by", "name email profile_pic");
    if (!spot) {
      return res.status(404).json({ error: "No such spot" });
    }
    res.status(200).json(spot);
  } catch (error) {
    console.error("Error fetching spot:", error);
    res.status(500).json({ error: "Failed to get spot" });
  }
};

// POST /spots
export const createSpot = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { name, type, subtype, description, location, shootingConditions,peakSeason,recommendedFocalLength,tripodUsage,accessTime,accessFees,accessRules, } = req.body;

    if (!name || !type || !location?.coordinates) {
      return res.status(400).json({ error: "Missing required fields: name, type, or location" });
    }

    const newSpot = new Spot({
      name,
      type,
      subtype,
      description,
      location,
      shootingConditions,
      peakSeason,
      recommendedFocalLength,
      tripodUsage,
      accessTime,
      accessFees,
      accessRules,
      created_by: user_id,
    });

    await newSpot.save();
    res.status(201).json(newSpot);
  } catch (error) {
    console.error("Error creating spot:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// PUT /spots/:spotId
export const updateSpot = async (req, res) => {
  const { spotId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(spotId)) {
    return res.status(404).json({ error: "No such spot" });
  }

  try {
    const spot = await Spot.findById(spotId);
    if (!spot) {
      return res.status(404).json({ error: "No such spot" });
    }

    // Only creator or admin can update
    if (spot.created_by.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to update this spot" });
    }

    Object.assign(spot, req.body); // update fields
    await spot.save();

    res.status(200).json(spot);
  } catch (error) {
    console.error("Error updating spot:", error);
    res.status(500).json({ error: "Server Error" });
  }
};

// DELETE /spots/:spotId
export const deleteSpot = async (req, res) => {
  const { spotId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(spotId)) {
    return res.status(404).json({ error: "No such spot" });
  }

  try {
    const spot = await Spot.findById(spotId);
    if (!spot) {
      return res.status(404).json({ error: "No such spot" });
    }

    // Only creator or admin can delete
    if (spot.created_by.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to delete this spot" });
    }

    await spot.remove();
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting spot:", error);
    res.status(500).json({ error: "Server Error" });
  }
};


