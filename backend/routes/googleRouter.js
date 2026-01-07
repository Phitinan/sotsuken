import express from "express";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
router.post("/google-login", async (req, res) => {
    console.log("GOOGLE LOGIN HIT");
    const GOOGLE_ID = "989853536462-l2ltklq5bf2jddsbmoug3q94hs88dicr.apps.googleusercontent.com";
    const client = new OAuth2Client(GOOGLE_ID);

    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: "No token provided" });
        console.log("Google token received:", token?.slice(0, 30));

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: GOOGLE_ID, // Use the variable here too
        });

        const payload = ticket.getPayload();
        console.log("Google payload:", payload);
        const { email, name } = payload;

        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ name, email});
        }

        const appToken = jwt.sign({ _id: user._id }, process.env.SECRET, { expiresIn: "7d" });
        console.log(user._id);

        res.json({ id: user._id, name, email , token: appToken });
    } catch (err) {
        // 2. This log will now tell us the exact reason for the 401
        console.error("Backend Auth Error:", err.message);
        res.status(401).json({ error: err.message });
    }
});

export default router;
