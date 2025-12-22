import fs from "fs";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load subtype JSON
const filePath = path.join(__dirname, "../data/hanabi.json");
const raw = fs.readFileSync(filePath, "utf8");
const hanabiData = JSON.parse(raw);
const API_BASE = import.meta.env.VITE_API_BASE;

const API_URL = `${API_BASE}/api/hanabi`;

async function seed() {
  console.log("Seeding hanabi...");

  for (const festival of hanabiData) {
    const { name, area, date, link, location } = festival;

    try {
      await axios.post(API_URL, {
        name,
        area,
        date,
        link,
        location
      });
      console.log(`✓ Inserted: ${name}`);
    } catch (err) {
      console.log(`✗ Failed: ${name}`, err.message);
    }
  }


  console.log("Done!");
}

seed();
