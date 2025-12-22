import fs from "fs";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load subtype JSON
const filePath = path.join(__dirname, "../data/subtypes.json");
const raw = fs.readFileSync(filePath, "utf8");
const subtypeData = JSON.parse(raw);
const API_BASE = import.meta.env.VITE_API_BASE;

const API_URL = `${API_BASE}/api/subtypes`;

async function seed() {
  console.log("Seeding subtypes...");

  for (const type of Object.keys(subtypeData)) {
    for (const name of subtypeData[type]) {
      try {
        await axios.post(API_URL, { type, name });
        console.log(`✓ Inserted: ${type} → ${name}`);
      } catch (err) {
        console.log(`✗ Failed: ${type} → ${name}`, err.message);
      }
    }
  }

  console.log("Done!");
}

seed();
