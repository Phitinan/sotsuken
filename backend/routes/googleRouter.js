import express from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
router.post("/google-login", async (req, res) => {
    // 1. Use the hardcoded string directly for the audience check as well
    const GOOGLE_ID = "989853536462-l2ltklq5bf2jddsbmoug3q94hs88dicr.apps.googleusercontent.com";
    const client = new OAuth2Client(GOOGLE_ID);

    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: "No token provided" });

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_ID, // Use the variable here too
        });

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ name, email, profile_pic: picture, provider: "google" });
        }

        const appToken = jwt.sign({ id: user._id }, process.env.SECRET, { expiresIn: "7d" });

        res.json({ id: user._id, name, email, profile_pic: picture, token: appToken });
    } catch (err) {
        // 2. This log will now tell us the exact reason for the 401
        console.error("Backend Auth Error:", err.message);
        res.status(401).json({ error: err.message });
    }
});

export default router;
