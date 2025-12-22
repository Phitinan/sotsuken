// scripts/generateLineList.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES modules don’t have __dirname by default
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Choose your “main type” mapping
const MAIN_TYPE = "toritetsu";

// 2. Load JSON file
const linesJsonPath = path.join(__dirname, "/lines.json");
const linesJson = JSON.parse(fs.readFileSync(linesJsonPath, "utf-8"));

// 3. Extract names
const lineNames = linesJson
  .map(line => line.name_kanji || line.name_romaji || line.name_kanji)
  .filter(Boolean)
  .sort();

// 4. Deduplicate
const unique = Array.from(new Set(lineNames));

// 5. Build output object
const output = {
  [MAIN_TYPE]: unique
};

// 6. Write JS file
const outJs = "export default " + JSON.stringify(output, null, 2) + ";\n";

const outPath = path.join(__dirname, "../subtypes_from_piuccio.js");
fs.writeFileSync(outPath, outJs, "utf-8");

console.log("Done. Wrote", unique.length, "lines to", outPath);
