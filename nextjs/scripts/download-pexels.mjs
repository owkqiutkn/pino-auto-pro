#!/usr/bin/env node
/**
 * Download Pexels photos by ID to public/categories.
 * Uses PEXELS_API_KEY from .env.local (no S3 URLs, no expiry).
 *
 * Usage:
 *   node scripts/download-pexels.mjs <id> <outputName> [id2 outputName2 ...]
 *   node scripts/download-pexels.mjs --defaults  # download coupe,sedan,suv,truck
 *
 * Example:
 *   node scripts/download-pexels.mjs 33326195 coupe.jpg 5484546 sedan.jpg
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const outDir = join(rootDir, "public", "categories");

// Load .env.local
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

// Default (id, filename) for coupe, sedan, suv, truck - replace with your Pexels IDs
const DEFAULTS = {
    coupe: 33326195,
    sedan: 5484546,
    suv: 9000157,
    truck: 20993514,
};

function getPhotoUrl(id) {
    return fetch(`https://api.pexels.com/v1/photos/${id}`, {
        headers: { Authorization: PEXELS_API_KEY },
    })
        .then((res) => {
            if (!res.ok) throw new Error(`Pexels API ${res.status} for photo ${id}`);
            return res.json();
        })
        .then((json) => json.src?.large2x || json.src?.original || json.src?.large);
}

async function downloadAndSave(url, filepath) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Download failed ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(filepath, buf);
    console.log("Saved:", filepath);
}

async function main() {
    mkdirSync(outDir, { recursive: true });

    const args = process.argv.slice(2);
    let pairs = [];

    if (args[0] === "--defaults") {
        pairs = Object.entries(DEFAULTS).map(([base, id]) => [`${base}.jpg`, id]);
    } else if (args.length >= 2 && args.length % 2 === 0) {
        for (let i = 0; i < args.length; i += 2) {
            const id = parseInt(args[i], 10);
            const filename = args[i + 1];
            if (isNaN(id) || !filename) {
                console.error("Invalid pair:", args[i], args[i + 1]);
                process.exit(1);
            }
            pairs.push([filename, id]);
        }
    } else {
        console.error(`
Usage:
  node scripts/download-pexels.mjs <id> <outputName> [id2 outputName2 ...]
  node scripts/download-pexels.mjs --defaults

Examples:
  node scripts/download-pexels.mjs 33326195 coupe.jpg 5484546 sedan.jpg
  node scripts/download-pexels.mjs --defaults
`);
        process.exit(1);
    }

    for (const [filename, id] of pairs) {
        try {
            const url = await getPhotoUrl(id);
            const filepath = join(outDir, filename);
            await downloadAndSave(url, filepath);
        } catch (err) {
            console.error(`Failed ${filename} (${id}):`, err.message);
        }
    }
}

main();
