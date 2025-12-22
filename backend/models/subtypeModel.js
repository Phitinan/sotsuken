import mongoose from "mongoose";

const SubtypeSchema = new mongoose.Schema({
  type: { type: String, required: true },
  name: { type: String, required: true }
});

const Subtype = mongoose.model("Subtype", SubtypeSchema);

export default Subtype;
