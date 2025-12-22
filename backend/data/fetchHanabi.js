import axios from "axios";
import { load } from "cheerio";
import fs from "fs";

async function scrapePage(mm, dd, page = 1) {
  const mmStr = String(mm).padStart(2, "0");
  const ddStr = String(dd).padStart(2, "0");

  const url =
    page === 1
      ? `https://hanabi.walkerplus.com/calendar/${mmStr}${ddStr}/`
      : `https://hanabi.walkerplus.com/calendar/${mmStr}${ddStr}/${page}.html`;

  console.log("Checking:", url);

  try {
    const res = await axios.get(url);
    const $ = load(res.data);

    // Each event is actually inside an <a> containing both s_name and thumb_list
    const events = [];

    $("a").each((i, el) => {
      const sName = $(el).find("div.s_name h2.name").text().trim();
      if (!sName) return; // skip links without a festival

      const thumb = $(el).find("div.thumb_list");
      const area = thumb.find("div.txt_area .area").text().trim();
      const date = thumb.find("div.txt_area .detail").text().trim();
      const link = $(el).attr("href") 
      ? `https://hanabi.walkerplus.com${$(el).attr("href")}`
      : null;

      events.push({
        name: sName,
        area,
        date,
        link
      });
    });

    return events.length ? events : null;
  } catch (err) {
    console.log("Error fetching page:", url, err.message);
    return null;
  }
}


async function scrapeDay(mm, dd) {
  let allEvents = [];
  let page = 1;

  while (true) {
    const events = await scrapePage(mm, dd, page);
    if (!events || !events.length) break;

    allEvents.push(...events);
    page++;
  }

  return allEvents;
}

async function run() {
  const all = [];

  for (let m = 1; m <= 12; m++) {
    for (let d = 1; d <= 31; d++) {
      const events = await scrapeDay(m, d);
      if (events && events.length) {
        all.push(...events);
        console.log(`Day ${m}-${d} → ${events.length} festivals`);
      }
    }
  }

  fs.writeFileSync("./hanabi_calendar.json", JSON.stringify(all, null, 2), "utf-8");
  console.log("Done → total festivals:", all.length);
}

run();
