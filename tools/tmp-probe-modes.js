#!/usr/bin/env node
/**
 * Probe draw anchors for bridge/arrow/hotdog/gate/shield/light modes.
 */
const fs = require("fs");
const path = require("path");
const c = fs.readFileSync(path.join(__dirname, "snake-current.js"), "utf8");

function dump(label, startRe, len = 900) {
  const m = c.match(startRe);
  if (!m) {
    console.log(`=== ${label} MISSING ===\n`);
    return null;
  }
  const i = m.index;
  console.log(`=== ${label} @${i} ===`);
  console.log(c.slice(i, i + len));
  console.log("");
  return i;
}

function contexts(needle, n = 6, radius = 100) {
  let idx = 0,
    count = 0;
  console.log(`--- contexts for ${JSON.stringify(needle)} ---`);
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

// Known mode ints from pudding: GATE=19 etc — dump f7(settings,N) usage counts
for (const n of [14, 15, 16, 17, 18, 19, 20, 21]) {
  const re = new RegExp(`f7\\([^,]+\\.settings,${n}\\)`, "g");
  const hits = c.match(re) || [];
  console.log(`f7(settings,${n}): ${hits.length} hits`);
}

console.log("\n");

dump("zaF arrow tile draw", /zaF=function\(a,b,c,d,e,f,g,h\)\{/, 1100);
dump("AaF.render arrows", /AaF=class\{constructor\(a,b,c,d\)\{this\.wb=a;this\.settings=b;this\.ka=c;this\.oa=d\}render\(a\)\{/, 700);
dump("S$E fruit dir arrows", /S\$E=function\(a,b,c,d,e\)\{/, 900);
dump("i$E light circle blit", /i\$E=function\(a,b,c,d,e,f\)\{/, 500);
dump("TbF wrap light", /TbF=function\(a,b,c,d\)\{/, 400);
dump("SbF light point", /SbF=function\(a,b,c,d\)\{/, 200);
dump("px_circles asset", /px_circles\.png/, 200);

// Gate / bridge / shield — look for renderers tied to 19/20/21
contexts("settings,19", 10, 90);
contexts("settings,20", 10, 90);
contexts("settings,21", 10, 90);
contexts("settings,16", 8, 90); // arrow mode?
contexts("settings,15", 6, 90); // poison dir?
contexts("settings,18", 6, 90);

// Hotdog board shape: settings.ka===4||===5
contexts("settings.ka===4", 8, 80);
contexts("settings.ka===5", 6, 80);

// Find gate/bridge drawing via fillRect near l8 or Yfa (gate maps)
dump("lcF gate setup", /lcF=function\(a,b,c,d\)\{/, 600);
dump("mcF?", /mcF=function/, 400);

// Search for stroke/fill near gate visual
const gateAudio = c.indexOf('G9c:new _.x6(YaF.Bm,"GATE"');
console.log("GATE audio @", gateAudio);

// Find class that renders gates - look for .l8 or Yfa in render methods
const l8render = [...c.matchAll(/\.l8[\s\S]{0,80}drawImage|\.l8[\s\S]{0,80}fillRect|\.l8[\s\S]{0,80}stroke/g)];
console.log("l8 draw hits", l8render.length);
l8render.slice(0, 5).forEach((m) => console.log(m[0].slice(0, 120)));

const yfa = [...c.matchAll(/Yfa[\s\S]{0,100}(drawImage|fillRect|stroke|beginPath)/g)];
console.log("Yfa draw hits", yfa.length);
yfa.slice(0, 5).forEach((m) => console.log(m[0].slice(0, 150)));

// Shield: search for patterns that look like shield walls
contexts("setActive", 8, 100);
dump("class with setActive", /setActive\([^)]*\)\{/, 500);
