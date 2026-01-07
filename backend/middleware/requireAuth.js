import 'dotenv/config';
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const requireAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  console.log("Auth header:", req.headers.authorization);

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];

  try {
    
    const decoded = jwt.verify(token, process.env.SECRET);
    console.log("SECRET:", decoded);
    const user = await User.findById(decoded._id).select("_id name email role ");

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(401).json({ error: "Request is not authorized" });
  }
};

export default requireAuth;
