import express from "express";
import Hanabi from "../models/hanabiModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  
  const hanabi = await Hanabi.find();
  res.json(hanabi);
});

router.post("/", async (req, res) => {
  const { name, area, date, link, location } = req.body;

  const exists = await Hanabi.findOne({ name });
  if (exists) return res.json(exists);

  const hanabi = new Hanabi({ name, area, date, link, location });
  await hanabi.save();

  res.status(201).json(hanabi);
});

export default router;
