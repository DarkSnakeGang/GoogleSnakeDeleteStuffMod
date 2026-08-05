#!/usr/bin/env node
/**
 * Probe border paint sites and new-mode draw anchors for Visibility Mod.
 */
const fs = require("fs");
const path = require("path");
global.window = global;
eval(fs.readFileSync(path.join(__dirname, "modloader-helpers-snip.js"), "utf8"));

const c = fs.readFileSync(path.join(__dirname, "snake-current.js"), "utf8");

function dump(label, idx, len = 800) {
  if (idx < 0) {
    console.log(`=== ${label} MISSING ===\n`);
    return;
  }
  console.log(`=== ${label} @${idx} ===`);
  console.log(c.slice(idx, idx + len));
  console.log("");
}

function contexts(needle, n = 8, radius = 120) {
  let idx = 0,
    count = 0;
  console.log(`--- ${JSON.stringify(needle)} ---`);
  while ((idx = c.indexOf(needle, idx)) !== -1 && count < n) {
    console.log(
      `@${idx}: …${c
        .slice(Math.max(0, idx - radius), idx + needle.length + radius)
        .replace(/\s+/g, " ")}…`
    );
    idx++;
    count++;
  }
  console.log("");
}

console.log("===== BORDER =====\n");
contexts("#578A34", 10, 100);
contexts("d7(this.settings,this.settings.oa,3)", 8, 100);
contexts("d7(a.settings,a.settings.oa,3)", 8, 100);

const misc = findFunctionInCode(
  c,
  /render\(a,b\)$/,
  /this\.context\.fillRect\(0,0,this\.context\.canvas\.width,this\.context\.canvas\.height\);/,
  false
);
const bi = misc.indexOf("this.context.fillRect(0,0,this.context.canvas.width");
console.log("=== misc around full fillRect ===");
console.log(misc.slice(Math.max(0, bi - 400), bi + 350));
console.log("");

// Background function (non-infinity)
const bg = findFunctionInCode(
  c,
  /[$a-zA-Z0-9_]{0,6}=function\(a\)$/,
  /[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.fillRect\(0,0,[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.canvas\.width,[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.canvas\.height\);for/,
  false
);
console.log("=== background fn start ===");
console.log(bg.slice(0, 600));
console.log("");

console.log("===== SHIELD (21) draw candidates =====\n");
dump("$$E", c.search(/\$\$E=function/), 500);
contexts("settings,21", 6, 90);

// Look for shield-like board cell draws (type 7/5/11)
contexts("wa[d.y][d.x]===7", 4, 80);
dump("board tile render?", c.search(/this\.ka\.wa\[/), 200);

console.log("===== HOTDOG ez walls =====\n");
const wallIdx = c.search(/for\(let k of this\.wb\.Ca\.Aa\.values\(\)\)/);
dump("LbF walls loop", wallIdx, 2000);

console.log("===== LIGHT =====\n");
dump("light block", c.search(/if\(f7\(this\.settings,14\)\)\{var Ic=a/), 1200);

console.log("===== EAT / NOSE =====\n");
const body = findFunctionInCode(
  c,
  /[$a-zA-Z0-9_]{0,6}=function\(a,b,c,d,e\)$/,
  /(\([a-z]\?[a-z]\.[$a-zA-Z0-9_]{0,6}:[a-z]\.[$a-zA-Z0-9_]{0,6}\)\.render\([a-z],\n?[a-z],\n?[a-z],\n?[a-z],\n?[a-z]\*[a-z])(\),)/,
  false
);
const ei = body.indexOf(".render(Math.floor(");
console.log(body.slice(ei - 200, ei + 500));
