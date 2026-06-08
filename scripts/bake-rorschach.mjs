// Bake each generated Rorschach SVG to a high-res alpha PNG.
//
// Why this exists: the blot SVGs lean on a live filter chain (feTurbulence +
// feDisplacementMap) to throw the "ink splat" — tendrils, lobes, flecks. When
// the SVG is used as a CSS mask sized to ~144px (mobile), the browser runs that
// whole filter at 144px, where the turbulence has far too few cycles and the
// splat collapses into a featureless blob. Baking the filter once at high res
// turns the splat into image data, so mobile just downscales a sharp PNG.
//
// We bake the way the app renders (and the way preview-rorschach.mjs proved is
// correct): serve public/ over HTTP and screenshot through real headless
// Chrome, because headless rasterizers like Inkscape/librsvg mis-render these
// filters. The masked box is solid black on a transparent page, so the
// screenshot's alpha channel IS the blot silhouette — exactly a mask-image.
//
// Usage: node scripts/bake-rorschach.mjs [--size 600]
//   Writes public/images/rorschach/<slug>.png for every <slug>.svg present.

import { createServer } from "http";
import { readFile, writeFile, access, readdir } from "fs/promises";
import { spawn } from "child_process";
import { resolve, dirname, extname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const publicDir = resolve(root, "public");
const blotDir = resolve(publicDir, "images/rorschach");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
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

// A solid-black box masked by the blot SVG, on a transparent page. With Chrome's
// transparent default background the screenshot's alpha is the blot silhouette.
function maskHtml(slug, size) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;background:transparent}
  .box{width:${size}px;height:${size}px;background:#000;
    -webkit-mask:url(/images/rorschach/${slug}.svg) no-repeat center/contain;
    mask:url(/images/rorschach/${slug}.svg) no-repeat center/contain;}
</style></head><body><div class="box"></div></body></html>`;
}

function startServer(size) {
  return new Promise((resolveServer) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url, "http://localhost");
      // /preview/<slug> renders that blot's mask page.
      if (url.pathname.startsWith("/preview/")) {
        const slug = decodeURIComponent(url.pathname.slice("/preview/".length));
        res.writeHead(200, { "Content-Type": MIME[".html"] });
        res.end(maskHtml(slug, size));
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

function screenshot(chrome, url, out, size) {
  return new Promise((resolveShot, reject) => {
    const proc = spawn(chrome, [
      "--headless",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-sandbox",
      `--screenshot=${out}`,
      `--window-size=${size},${size}`,
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
  const args = { size: 600 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--size") args.size = Number(argv[++i]);
  }
  return args;
}

async function main() {
  const { size } = parseArgs(process.argv.slice(2));
  const slugs = (await readdir(blotDir))
    .filter((f) => f.endsWith(".svg"))
    .map((f) => f.slice(0, -4));

  if (slugs.length === 0) {
    console.error(`No blot SVGs in ${blotDir}. Run build-rorschach.mjs first.`);
    process.exit(1);
  }

  const chrome = await findChrome();
  const { server, port } = await startServer(size);
  try {
    let n = 0;
    for (const slug of slugs) {
      const out = resolve(blotDir, `${slug}.png`);
      await screenshot(
        chrome,
        `http://127.0.0.1:${port}/preview/${encodeURIComponent(slug)}`,
        out,
        size,
      );
      n++;
      if (n % 30 === 0) console.log(`  baked ${n}/${slugs.length}`);
    }
    console.log(`Baked ${n} Rorschach PNGs at ${size}px`);
  } finally {
    server.close();
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
