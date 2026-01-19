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
const API_BASE = ""

const API_URL = `http://localhost:4000/api/subtypes`;

async function seed() {
  console.log("Seeding hanabi...");
  const type = "hanabi"

  for (const festival of hanabiData) {
    const { name} = festival;


    try {
      await axios.post(API_URL, {
        name,
        type        
      });
      console.log(`✓ Inserted: ${name}`);
    } catch (err) {
        if (err.response?.status === 409) {
          console.log(`⏭ Skipped (exists): ${festival.name}`);
          continue;
        }      
      console.log(`✗ Failed: ${name}`, err.message);
      break;
    }
  }


  console.log("Done!");
}

seed();
