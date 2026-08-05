#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const c = fs.readFileSync(path.join(__dirname, "snake-current.js"), "utf8");

function dump(label, idx, len) {
  if (idx < 0) {
    console.log("=== " + label + " MISSING ===\n");
    return;
  }
  console.log("=== " + label + " @" + idx + " ===");
  console.log(c.slice(idx, idx + len));
  console.log("");
}

dump("obF bridges", c.search(/obF=function/), 1800);
dump("bridge active draw full", 100687, 1600);

const idxs = [];
let i = 0;
while ((i = c.indexOf("settings,14", i)) !== -1) {
  idxs.push(i);
  i++;
}
console.log("settings,14 count", idxs.length);
idxs.forEach((ix) =>
  console.log("@" + ix + ": " + c.slice(ix - 50, ix + 140).replace(/\s+/g, " "))
);

for (const op of [
  "destination-in",
  "source-in",
  "destination-out",
  "lighter",
  "multiply",
  "source-atop",
  "destination-atop",
]) {
  const hits = [];
  let j = 0;
  while ((j = c.indexOf('"' + op + '"', j)) !== -1 && hits.length < 8) {
    hits.push(j);
    j++;
  }
  console.log(op, hits);
  hits.slice(0, 3).forEach((h) =>
    console.log("  ", c.slice(h - 60, h + 80).replace(/\s+/g, " "))
  );
}

dump(
  "px_circles ctor",
  c.search(/snake_arcade\/pixel\/px_circles\.png/),
  600
);

dump(
  "hotdog spawn walls",
  c.search(/f7\(this\.settings,17\)\)for\(mdF/),
  1000
);
dump("hotdog spawn alt", 145850, 1100);

// Find signature of render(a,b) that contains both BbF and TbF (main compositor)
dump(
  "main render containing light+gates",
  c.search(/render\(a,b\)\{this\.[$a-zA-Z0-9_]{0,6}\.lj&&/),
  200
);

// Find AaF.render signature for findFunctionInCode
const aaf = c.search(/AaF=class\{constructor/);
dump("AaF class", aaf, 500);

// Find helper class for gates CbF - no render, uses BbF
// Find qbF - bridges helper, uses pbF/obF

dump("qbF class", c.search(/qbF=class/), 300);
dump("CbF class", c.search(/CbF=class/), 300);

// Fruit render signature for S$E gate
dump(
  "fruit render with S$E",
  c.search(/f7\(this\.settings,15\)&&b\.Oba&&S\$E/),
  80
);
const fruitRender = c.search(
  /render\(a,b\)\{var c=b\.pos\.clone\(\);c\.x=c\.x\*this\.wb/
);
dump("fruit W$E.render", fruitRender - 80, 200);

// Wall LbF.render signature
dump(
  "LbF.render sig",
  c.search(/LbF=class\{[\s\S]{0,400}?render\(a\)\{/),
  100
);
const lbfr = c.indexOf("render(a){", c.search(/LbF=class/));
dump("LbF.render body start", lbfr, 100);
