import path from "path";
import { fileURLToPath } from "url";
import express from "express";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../osm/railway_lines.geojson")
  );
});

export default router;