import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE = "https://aihot.virxact.com";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 aihot-skill/0.2.0";

async function getJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${url}`);
  }
  return res.json();
}

const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
const [daily, selected] = await Promise.all([
  getJson(`${BASE}/api/public/daily`),
  getJson(`${BASE}/api/public/items?mode=selected&since=${encodeURIComponent(since)}&take=50`),
]);

const payload = {
  generatedAt: new Date().toISOString(),
  source: BASE,
  date: daily.date,
  daily,
  selectedItems: selected.items || [],
};

const outPath = path.join(process.cwd(), "aihot-latest.json");
await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(`updated ${outPath}`);
