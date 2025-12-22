import mongoose from "mongoose";

const HanabiSchema = new mongoose.Schema({
  name: { type: String, required: true },
  area: String,
  date: String,
  link: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  }
});

export default mongoose.model("Hanabi", HanabiSchema);

