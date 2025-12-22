import express from "express";
import mongoose from "mongoose";
import Subtype from "../models/subtypeModel.js";

const router = express.Router();

router.get("/:type", async (req, res) => {
  const type = req.params.type;
  const list = await Subtype.find({ type }).sort({ name: 1 });
  res.json(list.map(s => s.name));
});

router.post("/", async (req, res) => {
  const { type, name } = req.body;

  const exists = await Subtype.findOne({ type, name });
  if (exists) return res.json(exists);

  const subtype = new Subtype({ type, name });
  await subtype.save();

  res.status(201).json(subtype);
});

export default router;
