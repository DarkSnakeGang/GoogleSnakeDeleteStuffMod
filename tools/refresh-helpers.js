#!/usr/bin/env node
/**
 * Refresh ModLoader helpers used by verify-visi.js.
 * Re-downloads snake-mod-loader-web.js and re-extracts findFunctionInCode /
 * assertReplace / diagnoseRegexError into modloader-helpers-snip.js.
 *
 * Usage:
 *   node tools/refresh-helpers.js
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const HELPERS_URL =
  "https://raw.githubusercontent.com/DarkSnakeGang/GoogleSnakeModsWebsite/main/snake-mod-loader-web.js";
const outLoader = path.join(__dirname, "snake-mod-loader-web.js");
const outSnip = path.join(__dirname, "modloader-helpers-snip.js");

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchText(res.headers.location).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      })
      .on("error", reject);
  });
}

function extractHelpers(loader) {
  const start = loader.indexOf("window.findFunctionInCode = function");
  if (start < 0) throw new Error("findFunctionInCode not found in loader");

  const endMarkers = [
    "window.appendCodeWithinSnakeModule",
    "window.swapInSnakeGlobal",
    "window.makeUrlStandard",
  ];
  let end = -1;
  for (const m of endMarkers) {
    const i = loader.indexOf(m, start);
    if (i > start) {
      end = i;
      break;
    }
  }
  // Include through diagnoseRegexError at minimum
  const diag = loader.indexOf("window.diagnoseRegexError", start);
  if (diag < 0) throw new Error("diagnoseRegexError not found");

  // Prefer cutting after swapInSnakeGlobal function body if present
  let sliceEnd = end > 0 ? end : loader.length;
  const swap = loader.indexOf("window.swapInSnakeGlobal", start);
  if (swap > 0) {
    const afterSwap = loader.indexOf("\n}", swap);
    if (afterSwap > 0) sliceEnd = Math.max(sliceEnd, afterSwap + 2);
  }

  let snip = loader.slice(start, sliceEnd).trim() + "\n";
  // Ensure diagnose is included
  if (!snip.includes("window.diagnoseRegexError")) {
    const diagEnd = loader.indexOf("\n}", loader.indexOf("throw new Error('Line break error!", diag));
    snip =
      loader.slice(start, loader.indexOf("window.appendCodeWithinSnakeModule", start) || diagEnd + 2).trim() +
      "\n";
  }
  return snip;
}

async function main() {
  console.log(`Fetching ${HELPERS_URL}`);
  const loader = await fetchText(HELPERS_URL);
  fs.writeFileSync(outLoader, loader);
  console.log(`Wrote ${outLoader} (${loader.length} chars)`);

  const snip = extractHelpers(loader);
  fs.writeFileSync(outSnip, snip);
  console.log(`Wrote ${outSnip} (${snip.length} chars)`);
  console.log("Done. Run: node tools/verify-visi.js");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
