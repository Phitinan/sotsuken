import fs from "fs";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, "../osm/railway_lines.geojson");
const raw = fs.readFileSync(filePath, "utf8");
const geojson = JSON.parse(raw);

const API_URL = "http://localhost:4000/api/subtypes";

const VALID_RAILWAYS = [
  "rail",
  "light_rail",
  "subway",
  "monorail",
  "tram"
];

function normalizeLineName(raw) {
  if (!raw) return "";

  return raw
    // 1. Remove anything in () or （）
    .replace(/[\(（][^）\)]*[\)）]/g, "")

    // 2. Remove English railway descriptions
    .replace(/\b[A-Za-z].*Railway.*Line\b.*$/i, "")

    // 3. Remove everything after semicolon ;
    .replace(/;.*/g, "")

    // 4. Remove tunnel suffix
    .replace(/トンネル/g, "")

    // 5. Remove platform numbers (2番線, 12番線, etc.)
    .replace(/\d+番線/g, "")

    // 6. Cleanup whitespace
    .replace(/\s+/g, " ")
    .trim();
}


async function seed() {
  console.log("Seeding train lines only (no stations)...");
  const type = "toritetsu";

  const lineNames = new Set();

  for (const feature of geojson.features) {
    const props = feature.properties || {};

    // 1. Must be a valid railway LINE
    if (!VALID_RAILWAYS.includes(props.railway)) continue;

    // 2. Must be a LineString with real length
    if (feature.geometry?.type !== "LineString") continue;
    if (feature.geometry.coordinates.length < 2) continue;

    // 3. Must have operator (stations often don't)
    if (!props.operator) continue;

    // 4. Extract name exactly like frontend
    let name = props.name || props.line_name;
    name = normalizeLineName(name);

    if (!name) continue;
    lineNames.add(name);
  }

  console.log(`Found ${lineNames.size} unique railway lines`);

  for (const name of lineNames) {
    try {
      await axios.post(API_URL, {
        name,
        type
      });
      console.log(`✓ Inserted: ${name}`);
    } catch (err) {
      if (err.response?.status === 409) {
        console.log(`⏭ Skipped (exists): ${name}`);
        continue;
      }
      console.log(`✗ Failed: ${name}`, err.message);
      break;
    }
  }

  console.log("Done!");
}

seed();
