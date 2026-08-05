#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const c = fs.readFileSync(path.join(__dirname, "snake-current.js"), "utf8");

function dumpAt(label, idx, len = 1500) {
  if (idx < 0) {
    console.log(`=== ${label} MISSING ===\n`);
    return;
  }
  console.log(`=== ${label} @${idx} ===`);
  console.log(c.slice(idx, idx + len));
  console.log("");
}

function findFn(name) {
  // match Name=function(...){  OR var Name=function
  const re = new RegExp(`(?:var )?${name}=function\\([^)]*\\)\\{`);
  const m = c.match(re);
  return m ? m.index : -1;
}

for (const name of [
  "BbF",
  "pbF",
  "AbF",
  "S$E",
  "mdF",
  "FcF",
  "tbF",
  "ubF",
  "sbF",
  "rbF",
  "vbF",
  "dbF",
  "cbF",
  "zaF",
  "AaF",
  "i$E",
  "TbF",
  "SbF",
  "$$E",
]) {
  const idx = findFn(name.replace(/\$/g, "\\$"));
  // retry without escape issues
  const idx2 = c.search(new RegExp(`(?:var )?${name.replace(/\$/g, "\\$")}=function`));
  console.log(`${name}: ${idx2}`);
}

console.log("\n");

dumpAt("BbF", c.search(/BbF=function/), 2000);
dumpAt("pbF", c.search(/pbF=function/), 2000);
dumpAt("AbF", c.search(/AbF=function/), 900);
dumpAt("S$E", c.search(/S\$E=function/), 1400);
dumpAt("$$E", c.search(/\$\$E=function/), 900);
dumpAt("mdF", c.search(/mdF=function/), 1200);

// Gate/bridge draw sites from earlier offset
dumpAt("gate Yfa loop ~100136", 100136, 700);
dumpAt("bridge wa.values ~100687", 100687, 700);

// Hotdog: FcF + wall ez property drawing - walls already drawn by LbF/statue path?
// Search for .ez in render-related stroke/fill
const ezDraw = [];
let i = 0;
while ((i = c.indexOf(".ez", i)) !== -1) {
  const snip = c.slice(i, i + 80);
  if (/stroke|fill|draw|line|beginPath|globalAlpha/.test(c.slice(Math.max(0, i - 200), i + 200))) {
    ezDraw.push(i);
  }
  i++;
  if (ezDraw.length > 20) break;
}
console.log("ez near draw counts first offsets:", ezDraw.slice(0, 15));

// Find render that draws hotdog walls - search UbF / walls with ez
dumpAt("UbF", c.search(/UbF=function/), 400);

// Look at wall render LbF for ez
dumpAt("LbF.render walls", c.search(/LbF=class\{constructor/), 200);
const lbfr = c.search(/LbF=class\{[\s\S]*?render\(a\)\{/);
dumpAt("LbF class start", c.search(/LbF=class/), 100);
// Find walls render containing .ez or T0
const wallRenderIdx = c.search(/for\(let k of this\.wb\.Ca\.Aa\.values\(\)\)/);
dumpAt("walls render loop", wallRenderIdx, 1800);

// Light draw call site in main renderer
dumpAt("light snake TbF call", c.search(/TbF\(od,od\.wb\.oa\.Kb/), 900);
dumpAt("light apple i$E loop", c.search(/for\(let Nd of cd\.wb\.wa\.ka\)\{let he=Math\.max/), 700);

// Find where AaF is constructed / assigned (ob)
const aafCtor = c.search(/new AaF\(/);
dumpAt("new AaF", aafCtor, 200);
const bbFcall = [...c.matchAll(/BbF\(/g)].map((m) => m.index);
console.log("BbF call sites", bbFcall);
const pbFcall = [...c.matchAll(/pbF\(/g)].map((m) => m.index);
console.log("pbF call sites", pbFcall);
