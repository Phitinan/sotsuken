import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";

import app from "./app.js";
import config from "./utils/config.js";
import logger from "./utils/logger.js";

dotenv.config();

const server = http.createServer(app);

// --- Connect to MongoDB first ---
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("MongoDB Atlas connected");

    // Start server only after successful DB connection
    server.listen(config.PORT, () => {
      logger.info(`Server running on port ${config.PORT}`);
    });
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process if DB fails
  });
