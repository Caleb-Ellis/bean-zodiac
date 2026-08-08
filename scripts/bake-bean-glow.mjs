// Bake each bean's glow halo to a pair of alpha PNG masks.
//
// Why this exists: the bean glow used to be two chained drop-shadow() passes at
// the end of Bean's filter chain. drop-shadow resamples the source alpha every
// paint, and the grids (Beaniary met grid, beans index, Beanstalk timeline)
// mount dozens to hundreds of beans at once, so mobile scrolling stuttered.
//
// Baking turns the glow into a static texture: the app draws a solid-colour div
// masked by these PNGs, which composites instead of blurring. The halo still
// hugs the bean outline, which a radial gradient conspicuously did not.
//
// One mask per bean covers every combination. None of the form filters in
// FormFilters.tsx touch the alpha channel — they're colour matrices, turbulence
// composited `in` SourceAlpha, and edge treatments clipped back inside
// SourceAlpha — and the flavour and quality filters are colour-only. So all 360
// zodiacs share 12 silhouettes.
//
// We bake through real headless Chrome for the same reason bake-rorschach.mjs
// does: it renders the filter exactly as the app will. brightness(0) blackens
// every non-transparent pixel while preserving alpha, blur() then spreads that
// alpha, and on a transparent page the screenshot's alpha channel IS the mask.
//
// Usage: node scripts/bake-bean-glow.mjs [--width 512]
//   Writes public/images/glow/<bean>-inner.png and <bean>-outer.png.

import { createServer } from "http";
import { readFile, mkdir, access } from "fs/promises";
import { spawn } from "child_process";
import { resolve, dirname, extname, basename } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const publicDir = resolve(root, "public");
const imageDir = resolve(publicDir, "images");
const outDir = resolve(publicDir, "images/glow");
const beansJson = resolve(root, "src/data/generated/beans.json");

// Blur radii as a fraction of the rendered bean width. The app constrains beans
// by width (`width: 100%; max-width: 10rem`), so width is what's consistent
// across beans on screen — anchoring to it keeps the halo even.
//
// Derived from the drop-shadows these replace, measured at the hero size of
// 10rem = 160px: drop-shadow(0 0 0.3rem) and (0 0 0.5rem). CSS drop-shadow's
// blur parameter is 2x the standard deviation, while filter: blur() takes the
// standard deviation directly — so 0.3rem => 2.4px => 1.5% of 160px. Opened up
// from that literal reading, which sat too tight against the bean's edge.
const SIGMA = { inner: 0.022, outer: 0.036 };

// Transparent margin baked around the bean, as a fraction of its width
// (left/right) and height (top/bottom). Deliberately not uniform in pixels: the
// margin only has to clear the blur's ~3-sigma reach on each axis, and matching
// the image's own aspect means the app can position the mask with a plain
// `inset: -18%` and no per-bean geometry. Flattest bean (pinto, 358x236) is the
// binding case vertically: 0.18 * 236 = 42px against 3 * 0.036 * 358 = 39px.
//
// Keep this in step with the inset in Bean.module.css.
const PAD = 0.18;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

async function exists(p) {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function findChrome() {
  for (const c of CHROME_CANDIDATES) {
    if (await exists(c)) return c;
  }
  throw new Error(
    "No Chrome/Chromium found. Install Google Chrome or set a path in CHROME_CANDIDATES.",
  );
}

// Intrinsic size of a WebP, read straight from the container header. We need it
// to size Chrome's window to the padded canvas, and pulling in an image library
// for twelve files isn't worth it. Handles the three chunk layouts; the bean art
// is all VP8X today, but the others are cheap to cover.
function webpSize(buf) {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error("not a WebP file");
  }
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X") {
    return {
      width: buf.readUIntLE(24, 3) + 1,
      height: buf.readUIntLE(27, 3) + 1,
    };
  }
  if (chunk === "VP8 ") {
    if (buf[23] !== 0x9d || buf[24] !== 0x01 || buf[25] !== 0x2a) {
      throw new Error("bad VP8 start code");
    }
    return {
      width: buf.readUInt16LE(26) & 0x3fff,
      height: buf.readUInt16LE(28) & 0x3fff,
    };
  }
  if (chunk === "VP8L") {
    if (buf[20] !== 0x2f) throw new Error("bad VP8L signature");
    const bits = buf.readUInt32LE(21);
    return {
      width: (bits & 0x3fff) + 1,
      height: ((bits >> 14) & 0x3fff) + 1,
    };
  }
  throw new Error(`unknown WebP chunk ${chunk}`);
}

// The bean, blackened and blurred, centred in a canvas PAD larger on each axis.
// Percentages rather than pixels so the geometry stays exactly in step with the
// `inset: -15%` the app uses to position the mask.
function glowHtml(imageFile, sigma) {
  const scale = 1 + 2 * PAD;
  const inset = ((PAD / scale) * 100).toFixed(4);
  const size = ((1 / scale) * 100).toFixed(4);
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;background:transparent}
  .canvas{position:absolute;inset:0}
  img{position:absolute;left:${inset}%;top:${inset}%;width:${size}%;height:${size}%;
    filter:brightness(0) blur(${sigma.toFixed(3)}px);}
</style></head><body><div class="canvas"><img src="/images/${imageFile}"></div></body></html>`;
}

function startServer(pages) {
  return new Promise((resolveServer) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url, "http://localhost");
      // /glow/<key> renders that bean+radius mask page.
      if (url.pathname.startsWith("/glow/")) {
        const key = decodeURIComponent(url.pathname.slice("/glow/".length));
        const html = pages.get(key);
        if (!html) {
          res.writeHead(404);
          res.end("no such page");
          return;
        }
        res.writeHead(200, { "Content-Type": MIME[".html"] });
        res.end(html);
        return;
      }
      const filePath = resolve(publicDir, "." + url.pathname);
      if (!filePath.startsWith(publicDir)) {
        res.writeHead(403);
        res.end("forbidden");
        return;
      }
      try {
        const body = await readFile(filePath);
        res.writeHead(200, {
          "Content-Type": MIME[extname(filePath)] || "application/octet-stream",
        });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end("not found");
      }
    });
    server.listen(0, "127.0.0.1", () =>
      resolveServer({ server, port: server.address().port }),
    );
  });
}

function screenshot(chrome, url, out, width, height) {
  return new Promise((resolveShot, reject) => {
    const proc = spawn(chrome, [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-sandbox",
      `--screenshot=${out}`,
      `--window-size=${width},${height}`,
      "--default-background-color=00000000",
      url,
    ]);
    let stderr = "";
    proc.stderr.on("data", (d) => (stderr += d));
    proc.on("error", reject);
    proc.on("exit", (code) => {
      if (code === 0) resolveShot();
      else reject(new Error(`Chrome exited ${code}:\n${stderr}`));
    });
  });
}

function parseArgs(argv) {
  const args = { width: 512 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--width") args.width = Number(argv[++i]);
  }
  return args;
}

async function main() {
  const { width: renderWidth } = parseArgs(process.argv.slice(2));
  const beans = JSON.parse(await readFile(beansJson, "utf8"));
  const entries = Object.values(beans).map((b) => b.imageFile);
  if (entries.length === 0) throw new Error(`No beans in ${beansJson}`);

  await mkdir(outDir, { recursive: true });

  const scale = 1 + 2 * PAD;
  const pages = new Map();
  const jobs = [];

  for (const imageFile of entries) {
    const stem = basename(imageFile, extname(imageFile));
    const { width, height } = webpSize(await readFile(resolve(imageDir, imageFile)));
    const renderHeight = Math.round(renderWidth * (height / width));
    const canvasW = Math.round(renderWidth * scale);
    const canvasH = Math.round(renderHeight * scale);

    for (const [radius, fraction] of Object.entries(SIGMA)) {
      const key = `${stem}-${radius}`;
      pages.set(key, glowHtml(imageFile, fraction * renderWidth));
      jobs.push({ key, canvasW, canvasH });
    }
  }

  const chrome = await findChrome();
  const { server, port } = await startServer(pages);
  try {
    for (const { key, canvasW, canvasH } of jobs) {
      await screenshot(
        chrome,
        `http://127.0.0.1:${port}/glow/${encodeURIComponent(key)}`,
        resolve(outDir, `${key}.png`),
        canvasW,
        canvasH,
      );
    }
    console.log(`Baked ${jobs.length} glow masks at ${renderWidth}px bean width`);
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
