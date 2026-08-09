#!/usr/bin/env node
/**
 * Run VisibilityModCode.alterSnakeCode (optionally after Pudding) against snake.js.
 * Records success / throws with a dump on syntax errors.
 *
 * Typical update workflow:
 *   1. node tools/probe-anchors.js current     # which anchors broke?
 *   2. edit VisibilityInit.js
 *   3. node tools/verify-visi.js               # Visibility alone
 *   4. node tools/verify-visi.js --pudding     # after Pudding (needs make-tolerant stubs)
 *   5. python VisiBuilder.py
 *
 * Usage:
 *   node tools/verify-visi.js
 *   node tools/verify-visi.js path/to/snake.js
 *   node tools/verify-visi.js --pudding
 *   node tools/verify-visi.js --pudding path/to/snake.js
 *
 * Env (legacy): VISI_WITH_PUDDING=1
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const https = require("https");
const http = require("http");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2).filter((a) => a !== "--");
const withPudding =
  args.includes("--pudding") || process.env.VISI_WITH_PUDDING === "1";
const outIndex = args.indexOf("--out");
const outPath = outIndex === -1 ? null : args[outIndex + 1];
const positional = args.filter(
  (a, i) => a !== "--pudding" && i !== outIndex && i !== outIndex + 1
);
const snakeArg = positional[0];
const snakePath = snakeArg || path.join(__dirname, "snake-current.js");

if (args.includes("--help") || args.includes("-h")) {
  console.log(`Usage: node tools/verify-visi.js [--pudding] [--out file.js] [snake.js]

  Default snake path: tools/snake-current.js (downloads v/current if missing)

  --pudding   Run PuddingMod.alterSnakeCode before Visibility
  --out FILE  Write the patched snake code to FILE, handy for checking that a
              gate landed on the draw call you actually meant
  --help      Show this help

Also see: node tools/probe-anchors.js
          node tools/refresh-helpers.js`);
  process.exit(0);
}

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

function checkSyntax(code) {
  try {
    new vm.Script(code, { filename: "snake.altered.js" });
    return null;
  } catch (e) {
    return e;
  }
}

function makeEl(tag = "div") {
  const children = [];
  const el = {
    tagName: String(tag).toUpperCase(),
    style: {},
    classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
    children,
    childNodes: children,
    parentNode: null,
    innerHTML: "",
    textContent: "",
    value: "",
    checked: false,
    disabled: false,
    hidden: false,
    id: "",
    src: "",
    href: "",
    type: "",
    dataset: {},
    attributes: {},
    appendChild(child) {
      children.push(child);
      if (child) child.parentNode = el;
      return child;
    },
    append(...nodes) {
      nodes.forEach((n) => el.appendChild(n));
    },
    removeChild(child) {
      const i = children.indexOf(child);
      if (i >= 0) children.splice(i, 1);
      return child;
    },
    insertBefore(node) {
      children.unshift(node);
      return node;
    },
    setAttribute(k, v) {
      el.attributes[k] = v;
      if (k === "id") el.id = v;
    },
    getAttribute(k) {
      return el.attributes[k] ?? null;
    },
    addEventListener() {},
    removeEventListener() {},
    querySelector() {
      return makeEl();
    },
    querySelectorAll() {
      return [];
    },
    getElementsByClassName() {
      return [makeEl()];
    },
    getElementsByTagName() {
      return [makeEl()];
    },
    cloneNode() {
      return makeEl(tag);
    },
    focus() {},
    click() {},
    remove() {},
    prepend(...nodes) {
      nodes.reverse().forEach((n) => children.unshift(n));
    },
    getContext() {
      return {
        canvas: el,
        fillRect() {},
        clearRect() {},
        drawImage() {},
        save() {},
        restore() {},
        beginPath() {},
        fill() {},
        stroke() {},
        measureText() {
          return { width: 0 };
        },
      };
    },
  };
  return el;
}

function installBrowserStubs() {
  const store = Object.create(null);
  global.localStorage = {
    getItem(k) {
      return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null;
    },
    setItem(k, v) {
      store[k] = String(v);
    },
    removeItem(k) {
      delete store[k];
    },
  };

  global.document = {
    body: makeEl("body"),
    head: makeEl("head"),
    documentElement: makeEl("html"),
    createElement(tag) {
      return makeEl(tag);
    },
    createTextNode(t) {
      return { textContent: t, nodeType: 3 };
    },
    createDocumentFragment() {
      return makeEl("fragment");
    },
    getElementById(id) {
      if (id === "apple") {
        const apple = makeEl("div");
        apple.id = "apple";
        for (let i = 0; i < 24; i++) apple.appendChild(makeEl("img"));
        return apple;
      }
      if (id === "count") {
        const count = makeEl("div");
        count.id = "count";
        for (let i = 0; i < 7; i++) count.appendChild(makeEl("img"));
        return count;
      }
      if (id === "trophy") {
        const trophy = makeEl("div");
        trophy.id = "trophy";
        for (let i = 0; i < 23; i++) trophy.appendChild(makeEl("img"));
        return trophy;
      }
      return makeEl("div");
    },
    querySelector(sel) {
      const s = String(sel);
      if (s.includes("apple")) {
        const apple = makeEl("div");
        apple.id = "apple";
        for (let i = 0; i < 24; i++) apple.appendChild(makeEl("img"));
        return apple;
      }
      return makeEl("div");
    },
    // Pudding indexes into these results (mute buttons, image lists), so hand back a
    // couple of stubs rather than an empty list
    querySelectorAll() {
      return [makeEl("img"), makeEl("img")];
    },
    getElementsByClassName() {
      return [makeEl(), makeEl()];
    },
    getElementsByTagName() {
      return [makeEl(), makeEl()];
    },
    addEventListener() {},
  };

  global.window = global;
  global.self = global;
  global.navigator = { userAgent: "node-verify" };
  global.location = { href: "https://googlesnakemods.com/v/current/" };
  global.Image = class Image {
    constructor() {
      this.src = "";
      this.classList = { add() {}, remove() {} };
    }
  };
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  global.MutationObserver = class {
    observe() {}
    disconnect() {}
  };
  global.HTMLElement = class {};
  global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
  global.cancelAnimationFrame = clearTimeout;
  global.alert = () => {};
  global.confirm = () => true;
  global.prompt = () => "";
  global.getComputedStyle = () => new Proxy({}, { get: () => "" });
  global.XMLHttpRequest = class {
    open() {}
    send() {}
    setRequestHeader() {}
  };

  global.window.NepDebug = false;
  global.window.pudding_settings = {
    Skull: false,
    SokoGoals: true,
    InputDisplay: false,
    TopBar: true,
    SpeedInfo: false,
    PortalPairs: false,
    SelectedPairs: [0, 1, 2, 3, 4, 5],
    DisableRandom: false,
    randomizeThemeApple: false,
    ScrollBar: false,
  };
  global.window.escapeRegex = function (string) {
    return String(string).replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
  };
}

async function main() {
  installBrowserStubs();

  let snakeCode;
  if (fs.existsSync(snakePath)) {
    snakeCode = fs.readFileSync(snakePath, "utf8");
  } else {
    console.log("Fetching current snake.js...");
    snakeCode = await fetchText("https://googlesnakemods.com/v/current/snake.js");
    fs.writeFileSync(snakePath, snakeCode);
  }
  console.log(`snake.js (${snakeCode.length} chars)`);

  const puddingPath = path.join(ROOT, "PuddingMod.js");
  if (!fs.existsSync(puddingPath)) {
    console.log("Fetching PuddingMod.js...");
    const p = await fetchText(
      "https://raw.githubusercontent.com/DarkSnakeGang/GoogleSnakePudding/main/PuddingMod.js"
    );
    fs.writeFileSync(puddingPath, p);
  }

  eval(fs.readFileSync(path.join(__dirname, "modloader-helpers-snip.js"), "utf8"));
  eval(fs.readFileSync(puddingPath, "utf8"));
  eval(fs.readFileSync(path.join(ROOT, "VisibilityInit.js"), "utf8"));

  // Pudding's alterCode reads state that its make() hooks build up (image sources and
  // similar), so run them, but one library failing on a DOM gap must not block the rest.
  window.Libraries = [
    "Core",
    "Theme",
    "DistinctVisual",
    "Counter",
    "ModeRegistry",
    "TimeKeeper",
    "Fruit",
    "TopBar",
    "SnakeColor",
    "SettingsSaver",
    "SpeedInfo",
    "InputDisplay",
    "Timer",
    "BootstrapMenu",
    "ResetKey",
    "RenderDelayFix",
    "CustomBowl",
  ];
  window.NepDebug = false;
  window.isVisi = false;
  window.catchError = function (culprit_regex, code) {
    try {
      code.match(culprit_regex)[0];
    } catch (e) {
      return true;
    }
    return false;
  };

  const quiet = console.log;

  if (withPudding) {
    console.log = () => {};
    const makeFailures = [];
    for (const libName of window.Libraries) {
      try {
        window[libName].make();
      } catch (e) {
        makeFailures.push(`${libName}: ${e.message}`);
      }
    }
    console.log = quiet;
    if (makeFailures.length) {
      console.warn("Pudding make() gaps (DOM stub limits):");
      makeFailures.forEach((f) => console.warn("  " + f));
    }
  }

  // Visibility runCodeBefore sets checkbox state; tolerate DOM failures
  console.log = () => {};
  try {
    window.VisibilityModCode.runCodeBefore();
  } catch (e) {
    console.log = quiet;
    console.warn("Visibility runCodeBefore warn:", e.message);
    // Minimal checkbox defaults if UI setup failed
    window.checkboxes = window.checkboxes || {
      checkboxStatuses: {
        leftEye: true, rightEye: true, body: true, snoot: true, nose: true, lightTiles: true,
        darkTiles: true, eatAnimation: true, fruit: true, poison: true, shadow: true, border: true,
        die: true, lumps: true, portals: true, flashSnake: false, shadowIncluded: true,
        keys: true, walls: true, locks: true, hotdogWalls: true, sokobanBox: true, sokobanGoal: true, mines: true,
        statue: true, brokenStatue: true, mineRadius: true, tongue: true,
        bridges: true, arrows: true, gates: true, shields: true,
        lightSnake: true, lightFruit: true,
      },
    };
    window.flashSnakeStatus = window.flashSnakeStatus || {
      flashCount: 0, currentlyFlashingSnake: false, durationMillisecond: 1000,
    };
    window.visiBorderEls = window.visiBorderEls || [];
    window.applyVisiBorder = window.applyVisiBorder || function () {};
  }
  console.log = quiet;

  let code = snakeCode;
  if (withPudding) {
    console.log("PuddingMod.alterSnakeCode...");
    console.log = () => {};
    try {
      code = window.PuddingMod.alterSnakeCode(code);
    } catch (e) {
      console.log = quiet;
      console.error("Pudding FAILED:", e.message);
      console.error(e.stack);
      process.exit(1);
    }
    console.log = quiet;
    console.log(`Pudding OK (${code.length} chars)`);
  } else {
    console.log("Skipping Pudding (pass --pudding to include). Testing Visibility on raw snake.js");
    // Still preprocess $ like Pudding does
    code = code.replaceAll(/\$\$/gm, "doubleD");
    code = code.replaceAll(/\$\&/gm, "$ &");
  }

  let syn = checkSyntax(code);
  if (syn) {
    console.error("Pudding syntax error:", syn.message);
    process.exit(1);
  }

  console.log("VisibilityModCode.alterSnakeCode...");
  try {
    code = window.VisibilityModCode.alterSnakeCode(code);
  } catch (e) {
    console.error("Visibility FAILED:");
    console.error(e.stack || e.message);
    process.exit(2);
  }
  console.log(`Visibility OK (${code.length} chars)`);

  syn = checkSyntax(code);
  if (syn) {
    console.error("Combined syntax error:", syn.message);
    const dump = path.join(__dirname, ".broken-visi.js");
    fs.writeFileSync(dump, code);
    console.error("Wrote", dump);
    const m = /snake\.altered\.js:(\d+)/.exec(syn.stack || "");
    if (m) {
      const lineNo = Number(m[1]);
      const lines = code.split("\n");
      console.error("Around line", lineNo, "len", (lines[lineNo - 1] || "").length);
      console.error((lines[lineNo - 1] || "").slice(0, 500));
    }
    process.exit(3);
  }

  if (outPath) {
    const resolved = path.resolve(ROOT, outPath);
    fs.writeFileSync(resolved, code);
    console.log("Wrote", resolved);
  }

  console.log("SUCCESS");
  console.log("isVisi:", window.isVisi);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
