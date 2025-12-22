import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  profile_pic: { type: String },
}, { timestamps: true, versionKey: false });

export default mongoose.model("User", userSchema);
