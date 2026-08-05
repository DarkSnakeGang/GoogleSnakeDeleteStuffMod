#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const c = fs.readFileSync(path.join(__dirname, "snake-current.js"), "utf8");
console.log("=== LIGHT DRAW @103230 ===");
console.log(c.slice(103230, 105200));
console.log("\n=== LIGHT COMPOSITE @110780 ===");
console.log(c.slice(110780, 111900));
console.log("\n=== DESTINATION-IN @107500 ===");
console.log(c.slice(107500, 107850));
