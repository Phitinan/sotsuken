import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js"; // <-- note the .js extension

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "photospots",               // Cloudinary folder
    allowed_formats: ["jpg", "jpeg", "png"], // accepted file types
    transformation: [{ width: 1200, crop: "limit" }], // optional resizing
  },
});

const parser = multer({ storage });

export default parser;
