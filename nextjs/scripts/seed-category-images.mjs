#!/usr/bin/env node
/**
 * Downloads category images from Pexels and saves to public/categories.
 * Requires PEXELS_API_KEY in .env.local or environment.
 * Run: node scripts/seed-category-images.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const outDir = join(rootDir, "public", "categories");

// Load .env.local if present
const envPath = join(rootDir, ".env.local");
if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
        const m = line.match(/^([^#=]+)=(.*)$/);
        if (m) {
            const key = m[1].trim();
            const val = m[2].trim().replace(/^["']|["']$/g, "");
            if (!process.env[key]) process.env[key] = val;
        }
    }
}

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
if (!PEXELS_API_KEY) {
    console.error("PEXELS_API_KEY required. Add to .env.local or environment.");
    process.exit(1);
}

const PHOTOS = {
    hatchback: 33326195,
    convertible: 5484546,
    wagon: 9000157,
    minivan: 20993514,
    van: 6169660,
    crossover: 13767773,
    roadster: 13437181,
    liftback: 23527210,
};

async function getPhotoUrl(id) {
    const res = await fetch(`https://api.pexels.com/v1/photos/${id}`, {
        headers: { Authorization: PEXELS_API_KEY },
    });
    if (!res.ok) throw new Error(`Pexels API ${res.status} for photo ${id}`);
    const json = await res.json();
    return json.src?.large2x || json.src?.original || json.src?.large;
}

async function downloadAndSave(filename, url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const path = join(outDir, filename);
    writeFileSync(path, buf);
    console.log("Saved:", path);
}

async function main() {
    mkdirSync(outDir, { recursive: true });

    for (const [name, id] of Object.entries(PHOTOS)) {
        try {
            const url = await getPhotoUrl(id);
            await downloadAndSave(`${name}.jpg`, url);
        } catch (err) {
            console.error(`Failed ${name} (${id}):`, err.message);
        }
    }
}

main();
