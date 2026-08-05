#!/usr/bin/env node
/**
 * Probe Visibility-critical anchors in a snake.js build.
 * Use this first when Google ships a new game version — see which
 * findFunctionInCode / assertReplace targets still exist before editing Init.
 *
 * Usage:
 *   node tools/probe-anchors.js
 *   node tools/probe-anchors.js current
 *   node tools/probe-anchors.js 5
 *   node tools/probe-anchors.js path/to/snake.js
 *
 * Downloads to tools/snake-current.js when given a version name (current / N).
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const ROOT = path.resolve(__dirname, "..");
const cachePath = path.join(__dirname, "snake-current.js");
const arg = process.argv[2] || "current";

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

async function loadSnake() {
  if (fs.existsSync(arg) && fs.statSync(arg).isFile()) {
    return { code: fs.readFileSync(arg, "utf8"), label: arg };
  }
  const version = arg;
  const url = `https://googlesnakemods.com/v/${version}/snake.js`;
  console.log(`Fetching ${url} ...`);
  const code = await fetchText(url);
  fs.writeFileSync(cachePath, code);
  console.log(`Cached ${cachePath} (${code.length} chars)\n`);
  return { code, label: `v/${version}` };
}

/** Anchors aligned with VisibilityInit.js alterSnakeCode (keep in sync when editing Init). */
const ANCHORS = [
  {
    name: "bodyParts.rightEye/die ternary",
    regex:
      /(\([a-z]\?[a-z]\.[$a-zA-Z0-9_]{0,6}:[a-z]\.[$a-zA-Z0-9_]{0,6}\)\.render\([a-z],\n?[a-z],\n?[a-z],\n?[a-z],\n?[a-z]\*[a-z])(\),)/,
  },
  {
    name: "bodyParts.leftEye pair",
    regex:
      /(\(([$a-zA-Z0-9_]{0,6}\?[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}:[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6})\)\.render\([$a-zA-Z0-9_]{0,6},\n?[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},\n?[$a-zA-Z0-9_*]{0,6}\),\(\2\)\.render\([$a-zA-Z0-9_]{0,6},\n?[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},\n?[$a-zA-Z0-9_*]{0,6}\)\))/,
  },
  {
    name: "bodyParts.eatAnim Math.floor",
    regex:
      /\([$a-zA-Z0-9_]{0,6}\?[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}:[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\)\.render\(Math\.floor\([$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\)/,
  },
  {
    name: "bodyParts.tongue",
    regex:
      /(\([$a-zA-Z0-9_]{0,6}\?[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}:[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\)\.render\([$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6})(\)\))/,
  },
  {
    name: "sig bodyParts =function(a,b,c,d,e)",
    regex: /[$a-zA-Z0-9_]{0,6}=function\(a,b,c,d,e\)\{/,
  },
  {
    name: "fruit.drawImage -size/2",
    regex:
      /this\.[$a-zA-Z0-9_]{0,6}\.drawImage\([$a-zA-Z0-9_]{0,6},0,0,[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},-[$a-zA-Z0-9_]{0,6}\/2,-[$a-zA-Z0-9_]{0,6}\/2,[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\)/,
  },
  {
    name: "fruit.drawImage -(size/2)",
    regex:
      /this\.[$a-zA-Z0-9_]{0,6}\.drawImage\([$a-zA-Z0-9_]{0,6},0,0,[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6},-\([$a-zA-Z0-9_]{0,6}\/2\),-\([$a-zA-Z0-9_]{0,6}\/2\),[$a-zA-Z0-9_]{0,6},[$a-zA-Z0-9_]{0,6}\)/,
  },
  {
    name: "sig fruit render(a,b)",
    regex: /render\([a-zA-Z0-9_$]+,[a-zA-Z0-9_$]+\)\{var [a-z]=[a-z]\.pos\.clone/,
  },
  {
    name: "walls Ca.Aa.values",
    regex: /this\.[$a-zA-Z0-9_]{0,6}\.Ca\.Aa\.values\(\)/,
  },
  {
    name: "sokoban inside settings,7",
    regex: /[$a-zA-Z0-9_]{0,6}\([a-z]\.settings,7\)&&![a-z]\)\{[a-z]=new/,
  },
  {
    name: "sokoban box drawImage 128,0,128",
    regex:
      /drawImage\([$a-zA-Z0-9_]{0,6}\([$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\)\.[$a-zA-Z0-9_]{0,6}\.canvas,128,0,128,128,/,
  },
  {
    name: "sokoban goal *128",
    regex:
      /drawImage\([$a-zA-Z0-9_]{0,6}\([$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\)\.[$a-zA-Z0-9_]{0,6}\.canvas,[$a-zA-Z0-9_]{0,6}\*128,0,128,128,/,
  },
  {
    name: "shadow destination-atop",
    regex: /globalCompositeOperation="destination-atop"/,
  },
  {
    name: "background fillRect+for (DaF-style)",
    regex:
      /[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.fillRect\(0,0,[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.canvas\.width,[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\.canvas\.height\);for/,
  },
  {
    name: "misc this.context.fillRect border",
    regex: /this\.context\.fillRect\(0,0,this\.context\.canvas\.width,this\.context\.canvas\.height\);/,
  },
  {
    name: "sig misc render(a,b) clearRect",
    regex: /render\(a,b\)\{this\.[$a-zA-Z0-9_]{0,6}\.lj&&/,
  },
  {
    name: "lock particles render()",
    regex: /render\(\)\{for\((?:var|let|const) [a-z] of this\.[$a-zA-Z0-9_]{0,6}\.hb\.particles\)/,
  },
  {
    name: "keys drawImage 128*type",
    regex:
      /this\.[$a-zA-Z0-9_]{0,6}\.drawImage\(this\.[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6}\(\),128\*[a-z]\.type,0,128,128,/,
  },
  {
    name: "bodyLines quadraticCurveTo",
    regex: /quadraticCurveTo/,
  },
  {
    name: "sig bodyLines render(a,b,c)",
    regex: /render\(a,b,c\)\{/,
  },
  {
    name: "portals Math.cos(*2*Math.PI)",
    regex: /Math\.cos\([$a-zA-Z0-9_]{0,6}\*2\*Math\.PI\)/,
  },
  {
    name: "eat/tick flash inside",
    regex:
      /if\([$a-zA-Z0-9_]{0,6}\|\|[$a-zA-Z0-9_]{0,6}\){(?:var|let|const) [$a-zA-Z0-9_]{0,6}=[$a-zA-Z0-9_]{0,6}\.[$a-zA-Z0-9_]{0,6};[$a-zA-Z0-9_]{0,6}\|\|\([$a-zA-Z0-9_]{0,6}=!0/,
  },
  {
    name: "sig tick()",
    regex: /\}tick\(\)\{/,
  },
  {
    name: "mines mine.png ctor",
    regex:
      /this\.[a-zA-Z0-9_$]{1,8}=new [a-zA-Z0-9_$]{1,8}\(this\.[a-zA-Z0-9_$]{1,8},"snake_arcade\/mine\.png",10,this\.[a-zA-Z0-9_$]{1,8},"snake_arcade\/pixel\/px_mine\.png"\)/,
  },
  {
    name: "statue angle call",
    regex: /[$a-zA-Z0-9_]{0,6}\(this,[a-z],[a-z],[a-z]\.[$a-zA-Z0-9_]{0,6}\.angle,[a-z]\.[$a-zA-Z0-9_]{0,6}\)/,
  },
  {
    name: "arrows zaF 8-arg save",
    regex:
      /[$a-zA-Z0-9_]{1,6}=function\([$a-zA-Z0-9_]{1,6},[$a-zA-Z0-9_]{1,6},[$a-zA-Z0-9_]{1,6},[$a-zA-Z0-9_]{1,6},[$a-zA-Z0-9_]{1,6},[$a-zA-Z0-9_]{1,6},[$a-zA-Z0-9_]{1,6},[$a-zA-Z0-9_]{1,6}\)\{[$a-zA-Z0-9_.]{1,6}\.ka\.save\(\)/,
  },
  {
    name: "shields S$E fruit bars",
    regex:
      /[$a-zA-Z0-9_$]{1,6}=function\([$a-zA-Z0-9_]{1,6},[$a-zA-Z0-9_]{1,6},[$a-zA-Z0-9_]{1,6},[$a-zA-Z0-9_]{1,6},[$a-zA-Z0-9_]{1,6}=!1\)\{var [$a-zA-Z0-9_]{1,6}=Math\.round\([$a-zA-Z0-9_.]{1,20}\/5\)/,
  },
  {
    name: "gates BbF Yfa",
    regex:
      /[$a-zA-Z0-9_]{1,6}=function\([$a-zA-Z0-9_]{1,6},[$a-zA-Z0-9_]{1,6}\)\{for\(let [$a-zA-Z0-9_]{1,6} of [$a-zA-Z0-9_.]{1,20}\.Yfa\)/,
  },
  {
    name: "bridges obF setLineDash grid",
    regex:
      /[$a-zA-Z0-9_]{1,6}=function\([$a-zA-Z0-9_]{1,6},[$a-zA-Z0-9_]{1,6},[$a-zA-Z0-9_]{1,6},[$a-zA-Z0-9_]{1,6}\)\{[$a-zA-Z0-9_]{1,6}\.ka\.save\(\);[$a-zA-Z0-9_]{1,6}===0&&[$a-zA-Z0-9_]{1,6}===0\|\|/,
  },
  {
    name: "light mode TbF head glow",
    regex: /TbF\([$a-zA-Z0-9_]{1,6},[$a-zA-Z0-9_.]{1,20},[$a-zA-Z0-9_.]{1,20},Math\.max\(/,
  },
  {
    name: "border CSS background-color index 3",
    regex:
      /_\.on\([$a-zA-Z0-9_.()]{1,40},"background-color",[$a-zA-Z0-9_]{1,6}\([$a-zA-Z0-9_.]{1,20},[$a-zA-Z0-9_.]{1,20},3\)\)/,
  },
  {
    name: "hotdog wall .ez",
    regex: /k\.ez&&\(k\.Cm\|\|k\.ez\.Wea===0\)/,
  },
  {
    name: "eat.png sprite ctor",
    regex: /this\.[$a-zA-Z0-9_]{1,6}=new [$a-zA-Z0-9_]{1,6}\([$a-zA-Z0-9_.]{1,20},\n?"[^"]*eat\.png"/,
  },
  {
    name: "DOM class jNB0Ic (mod badge)",
    regex: /jNB0Ic/,
    optional: true,
    note: "usually only in HTML, not snake.js",
  },
];

async function main() {
  const { code, label } = await loadSnake();
  let ok = 0;
  let miss = 0;

  console.log(`Probing ${label} (${code.length} chars)\n`);
  console.log(`${"STATUS".padEnd(8)} ${"ANCHOR"}`);
  console.log("-".repeat(72));

  for (const a of ANCHORS) {
    const matches = code.match(a.regex);
    const hit = matches && matches.length > 0;
    if (hit) {
      ok++;
      const sample = matches[0].replace(/\s+/g, " ").slice(0, 70);
      console.log(`OK       ${a.name}`);
      console.log(`         → ${sample}${matches[0].length > 70 ? "…" : ""}`);
    } else if (a.optional) {
      console.log(`SKIP     ${a.name}${a.note ? ` (${a.note})` : ""}`);
    } else {
      miss++;
      console.log(`MISS     ${a.name}${a.note ? ` (${a.note})` : ""}`);
    }
  }

  console.log("-".repeat(72));
  console.log(`ok=${ok}  miss=${miss}  total=${ANCHORS.length}`);
  if (miss) {
    console.log("\nUpdate VisibilityInit.js regexes for each MISS, then:");
    console.log("  node tools/verify-visi.js");
    console.log("  python VisiBuilder.py");
  }
  process.exit(miss ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
