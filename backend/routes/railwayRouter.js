import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/railway-lines", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../osm/railway_lines.geojson")
  );
});

export default router;