// Render a generated Rorschach blot to a PNG so a human (or an LLM) can look at
// it and answer the eternal question: "what do you see?"
//
// The blots live in public/images/rorschach/<slug>.svg and reference the bean
// art via root-absolute hrefs (/images/<bean>.svg). They also lean on SVG
// filters (feTurbulence + feDisplacementMap) that headless renderers like
// Inkscape get wrong. So we do it the way the real app does: serve public/ over
// HTTP and screenshot it in headless Chrome.
//
// Usage:
//   node scripts/preview-rorschach.mjs <slug> [--out file.png] [--mode mask|ink] [--size 300]
//
//   --mode mask  (default) the blot as the app shows it: a gradient revealed
//                through the blot's alpha. Pretty, but the colour is a
//                distraction if you only want the shape.
//   --mode ink   flat black ink on white — the pure silhouette, which is what
//                you want when asking an LLM to free-associate on the shape.
//
// Examples:
//   node scripts/preview-rorschach.mjs bitter-boiled-butter
//   node scripts/preview-rorschach.mjs spicy-fried-kidney --mode ink --out /tmp/blot.png

import { createServer } from "http";
import { readFile, writeFile, access } from "fs/promises";
import { spawn } from "child_process";
import { resolve, dirname, extname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const publicDir = resolve(root, "public");

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

function parseArgs(argv) {
  const args = { slug: undefined, out: undefined, mode: "mask", size: 300 };
  const rest = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") args.out = argv[++i];
    else if (a === "--mode") args.mode = argv[++i];
    else if (a === "--size") args.size = Number(argv[++i]);
    else rest.push(a);
  }
  args.slug = rest[0];
  return args;
}

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

function previewHtml(slug, mode, size) {
  // The blot SVG is used as a CSS mask, exactly like the app does. In "mask"
  // mode we reveal a gradient through it; in "ink" mode we reveal flat black.
  const fill =
    mode === "ink"
      ? "#111"
      : "linear-gradient(135deg,#ff5fa2,#7c5cff,#33d6c0)";
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;background:#fff}
  .box{width:${size}px;height:${size}px;background:${fill};
    -webkit-mask:url(/images/rorschach/${slug}.svg) no-repeat center/contain;
    mask:url(/images/rorschach/${slug}.svg) no-repeat center/contain;}
</style></head><body><div class="box"></div></body></html>`;
}

function startServer(slug, mode, size) {
  return new Promise((resolveServer) => {
    const server = createServer(async (req, res) => {
      const url = new URL(req.url, "http://localhost");
      if (url.pathname === "/preview") {
        res.writeHead(200, { "Content-Type": MIME[".html"] });
        res.end(previewHtml(slug, mode, size));
        return;
      }
      // Serve files out of public/, refusing anything that escapes it.
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
      // Chrome headless exits 0 on success; it's noisy on stderr even then.
      if (code === 0) resolveShot();
      else reject(new Error(`Chrome exited ${code}:\n${stderr}`));
    });
  });
}

async function main() {
  const { slug, out, mode, size } = parseArgs(process.argv.slice(2));
  if (!slug) {
    console.error(
      "Usage: node scripts/preview-rorschach.mjs <slug> [--out file.png] [--mode mask|ink] [--size 300]",
    );
    process.exit(1);
  }
  if (mode !== "mask" && mode !== "ink") {
    console.error(`Unknown --mode "${mode}" (expected "mask" or "ink")`);
    process.exit(1);
  }

  const svg = resolve(publicDir, "images/rorschach", `${slug}.svg`);
  if (!(await exists(svg))) {
    console.error(
      `No blot at ${svg}\nRun "node scripts/build-rorschach.mjs" first, or check the slug.`,
    );
    process.exit(1);
  }

  const outPath = out || resolve(tmpdir(), `rorschach-${slug}-${mode}.png`);
  const chrome = await findChrome();
  const { server, port } = await startServer(slug, mode, size);
  try {
    await screenshot(chrome, `http://127.0.0.1:${port}/preview`, outPath, size);
  } finally {
    server.close();
  }
  console.log(outPath);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
