import fs from "fs";
import axios from "axios";

// Load original JSON
const festivals = JSON.parse(fs.readFileSync("./hanabi_calendar.json", "utf-8"));

async function getLatLng(mapUrl) {
  try {
    const res = await axios.get(mapUrl);
    const html = res.data;

    const match = html.match(/q=([0-9.\-]+),([0-9.\-]+)/);

    if (!match) return null;

    return {
      lat: parseFloat(match[1]),
      lng: parseFloat(match[2]),
    };
  } catch (err) {
    console.log("❌ Error fetching", mapUrl);
    return null;
  }
}

async function run() {
  const updated = [];

  for (let f of festivals) {
    const mapUrl = f.link + "map.html";
    console.log("🔍", mapUrl);

    const coords = await getLatLng(mapUrl);

    let geoLocation = null;

    if (coords) {
      geoLocation = {
        type: "Point",
        coordinates: [coords.lng, coords.lat],  // IMPORTANT: [lng, lat]
      };
      console.log(" → saved GEO:", geoLocation.coordinates);
    }

    updated.push({
      ...f,
      location: geoLocation,
    });

    await new Promise((r) => setTimeout(r, 600));
  }

  fs.writeFileSync(
    "./hanabi_with_coords.json",
    JSON.stringify(updated, null, 2)
  );

  console.log("✅ Done. File: hanabi_with_coords.json");
}

run();
