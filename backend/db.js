// json-server dynamic DB aggregator. Combines separate JSON files into a single API.
// Usage: json-server backend/db.js --port 3000 --delay 300
// Note: Prefers backend/db.json if present (so you can keep all data in one file).

const path = require('path');
const fs = require('fs');

function readJson(filename) {
  const file = path.join(__dirname, filename);
  try {
    const raw = fs.readFileSync(file, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`[db.js] Warning: cannot read ${filename}. Using empty array/object.`, e.message);
    // When we don't know the expected shape, return an empty object; callers will coerce as needed
    return {};
  }
}

function pickArray(value) {
  if (Array.isArray(value)) return value;
  // Support both formats:
  // 1) Plain array files (e.g., categories.json as [...])
  // 2) json-server style objects (e.g., ads.json as { "ads": [...] })
  if (value && Array.isArray(value.ads)) return value.ads;
  return [];
}

module.exports = () => {
  // Force using ads.json only for the ads collection (no fallback, no db.json)
  const ads = pickArray(readJson('ads.json'));
  console.log('[db.js] Using ads from ads.json (forced)');

  // Other optional collections loaded from their own files
  const categories = pickArray(readJson('categories.json'));
  const cities = pickArray(readJson('cities.json'));
  const users = pickArray(readJson('users.json'));

  return {
    ads,
    categories,
    cities,
    users,
    favorites: []
  };
};
